import { AppDataSource } from './src/config/data-source';
import { User } from './src/entities/User';

async function fix() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { email: 'ishanvirpariya042@gmail.com' } });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    if (!user.studentId) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      user.studentId = `STU${randomDigits}`;
      await repo.save(user);
      console.log(`Fixed user ishanvirpariya042@gmail.com with studentId: ${user.studentId}`);
    } else {
      console.log('User already has studentId:', user.studentId);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
