import 'reflect-metadata';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Room } from '../entities/Room';
import { RoomAllocation } from '../entities/RoomAllocation';
import { StudentPreference } from '../entities/StudentPreference';
import { EntryExitLog } from '../entities/EntryExitLog';
import { Complaint } from '../entities/Complaint';
import { VisitorPass } from '../entities/VisitorPass';
import { MessMenu, MessFeedback } from '../entities/MessMenu';
import { Resource, ResourceBooking } from '../entities/Resource';
import { EmergencyAlert } from '../entities/EmergencyAlert';
import { MarketplaceListing } from '../entities/MarketplaceListing';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [
    User,
    Room,
    RoomAllocation,
    StudentPreference,
    EntryExitLog,
    Complaint,
    VisitorPass,
    MessMenu,
    MessFeedback,
    Resource,
    ResourceBooking,
    EmergencyAlert,
    MarketplaceListing,
  ],
  synchronize: true,
  logging: false,
});
