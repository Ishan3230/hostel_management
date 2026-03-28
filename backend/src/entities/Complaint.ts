import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum ComplaintCategory {
  WATER = 'WATER',
  ELECTRICITY = 'ELECTRICITY',
  INTERNET = 'INTERNET',
  FURNITURE = 'FURNITURE',
  CLEANLINESS = 'CLEANLINESS',
  OTHER = 'OTHER',
}

export enum ComplaintPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category!: ComplaintCategory;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 50, default: ComplaintPriority.LOW })
  priority!: ComplaintPriority;

  @Column({ type: 'varchar', length: 50, default: ComplaintStatus.PENDING })
  status!: ComplaintStatus;

  @Column({ type: 'uuid', nullable: true })
  resolvedBy!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
