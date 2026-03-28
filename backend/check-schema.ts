import { AppDataSource } from './src/config/data-source';

async function checkSchema() {
  try {
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();
    const table = await queryRunner.getTable('resource_bookings');
    console.log('Table Schema:', JSON.stringify(table, null, 2));
    await queryRunner.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkSchema();
