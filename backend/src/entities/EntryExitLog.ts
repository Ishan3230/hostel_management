import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum LogType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
}

@Entity('entry_exit_logs')
export class EntryExitLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type!: LogType;

  @Column({ type: 'boolean', default: false })
  isLate!: boolean;

  @Column({ type: 'uuid', nullable: true })
  scannedBy!: string | null; // security user ID

  @Column({ type: 'varchar', length: 20, default: 'QR' })
  method!: string; // QR or MANUAL

  @CreateDateColumn()
  timestamp!: Date;
}
