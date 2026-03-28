import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './User';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string; // Study Room, Gym, Laundry

  @Column({ type: 'varchar', length: 50, default: 'OTHER' })
  type!: string; // STUDY_ROOM, GYM, LAUNDRY, OTHER

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'int', default: 5 })
  totalSlots!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity('resource_bookings')
@Unique(['resourceId', 'date', 'startTime', 'endTime'])
export class ResourceBooking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Resource, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resourceId' })
  resource!: Resource;

  @Column({ type: 'uuid' })
  resourceId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'time' })
  startTime!: string;

  @Column({ type: 'time' })
  endTime!: string;

  @Column({ type: 'varchar', length: 50, default: BookingStatus.CONFIRMED })
  status!: BookingStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
