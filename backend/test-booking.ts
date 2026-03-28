import { AppDataSource } from './src/config/data-source';
import { Resource, ResourceBooking, BookingStatus } from './src/entities/Resource';
import { User } from './src/entities/User';

async function testBooking() {
  try {
    await AppDataSource.initialize();
    
    const student = await AppDataSource.getRepository(User).findOne({ where: { email: 'student1@demo.com' } });
    const resource = await AppDataSource.getRepository(Resource).findOne({ where: {} }); // Just get the first one

    if (!student || !resource) {
      console.log('Student or Resource not found');
      process.exit(1);
    }

    const booking = AppDataSource.getRepository(ResourceBooking).create({
      resourceId: resource.id,
      studentId: student.id,
      date: '2026-03-29',
      startTime: '10:00',
      endTime: '11:00',
      status: BookingStatus.CONFIRMED
    });

    await AppDataSource.getRepository(ResourceBooking).save(booking);
    console.log('Test booking created:', booking.id);
    
    const all = await AppDataSource.getRepository(ResourceBooking).find({
      relations: ['resource', 'student']
    });
    console.log('All Bookings after test:', JSON.stringify(all, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
testBooking();
