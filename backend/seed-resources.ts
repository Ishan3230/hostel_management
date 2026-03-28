import { AppDataSource } from './src/config/data-source';
import { Resource } from './src/entities/Resource';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for resource seeding (v2)...');

    const repo = AppDataSource.getRepository(Resource);

    const defaults = [
      { name: 'Main Study Room', type: 'STUDY_ROOM', totalSlots: 20, description: 'Quiet study area with high-speed internet. Located in Block A.' },
      { name: 'Hostel Gym', type: 'GYM', totalSlots: 10, description: 'Equipped with basic cardio and weight machines. Located in Block B Basement.' },
      { name: 'Laundry Center', type: 'LAUNDRY', totalSlots: 5, description: 'Washing machines and dryers available for students. Located in Block C Terrace.' },
      { name: 'Common TV Room', type: 'OTHER', totalSlots: 15, description: 'Common area with TV and seating. Located in Block A Lobby.' },
    ];

    for (const d of defaults) {
      // Clear existing to ensure clean seed with new 'type' field
      const existing = await repo.findOne({ where: { name: d.name } });
      if (existing) {
        await repo.remove(existing);
      }
      
      const resource = repo.create(d);
      await repo.save(resource);
      console.log(`Resource seeded: ${d.name} (${d.type})`);
    }

    console.log('Resource seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Resource seeding failed:', err);
    process.exit(1);
  }
}

seed();
