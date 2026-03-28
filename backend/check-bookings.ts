import { AppDataSource } from './src/config/data-source';
import { ResourceBooking } from './src/entities/Resource';

async function check() {
  try {
    await AppDataSource.initialize();
    const bookings = await AppDataSource.getRepository(ResourceBooking).find({
      relations: ['resource', 'student']
    });
    console.log('Current Bookings:', JSON.stringify(bookings, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
