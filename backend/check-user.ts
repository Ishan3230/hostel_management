import { AppDataSource } from './src/config/data-source';
import { User } from './src/entities/User';

async function checkUser() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { email: 'superadmin@hostel.com' } });
    if (user) {
      console.log('USER_FOUND:', JSON.stringify({ email: user.email, role: user.role }));
    } else {
      console.log('USER_NOT_FOUND');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
