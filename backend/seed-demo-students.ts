import { AppDataSource } from './src/config/data-source';
import { User, UserRole } from './src/entities/User';
import { StudentPreference, SleepSchedule, StudyHabits } from './src/entities/StudentPreference';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    const userRepo = AppDataSource.getRepository(User);
    const prefRepo = AppDataSource.getRepository(StudentPreference);

    const password = await bcrypt.hash('pass123', 10);

    const departments = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Architecture'];
    const names = [
      'Arjun Sharma', 'Priya Patel', 'Rohan Gupta', 'Sanya Malhotra', 'Vikram Singh',
      'Ananya Das', 'Ishaan Verma', 'Meera Reddy', 'Kabir Khan', 'Zoya Ahmed',
      'Aditya Rao', 'Tara Iyer', 'Varun Nair', 'Kiara Joshi', 'Aavya Singh'
    ];

    const sleepSchedules = [SleepSchedule.EARLY_BIRD, SleepSchedule.NIGHT_OWL, SleepSchedule.FLEXIBLE];
    const cleanlinessOptions = ['NEAT_FREAK', 'MODERATE', 'MESSY'];
    const studyHabitsOptions = [StudyHabits.QUIET, StudyHabits.GROUP, StudyHabits.MUSIC];

    for (let i = 0; i < names.length; i++) {
      const email = `student${i + 1}@demo.com`;
      
      let user = await userRepo.findOne({ where: { email } });
      if (!user) {
        user = userRepo.create({
          name: names[i],
          email,
          password,
          role: UserRole.STUDENT,
          studentId: `STU${100 + i}`,
          department: departments[i % departments.length],
          year: (i % 4) + 1,
        });
        await userRepo.save(user);
        console.log(`Created student: ${email}`);
      }

      let pref = await prefRepo.findOne({ where: { studentId: user.id } });
      if (!pref) {
        pref = prefRepo.create({
          studentId: user.id,
          sleepSchedule: sleepSchedules[i % sleepSchedules.length],
          cleanliness: cleanlinessOptions[i % cleanlinessOptions.length],
          cleanlinessLevel: (i % 3) * 2 + 1, // 1, 3, 5
          studyHabits: studyHabitsOptions[i % studyHabitsOptions.length],
          department: user.department,
          year: user.year,
          hobbies: 'Gaming, Reading, Traveling',
          additionalNotes: 'Looking for a compatible roommate.'
        });
        await prefRepo.save(pref);
        console.log(`Created preferences for: ${email}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
