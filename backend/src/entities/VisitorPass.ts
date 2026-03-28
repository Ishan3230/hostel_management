import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum VisitorStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DENIED = 'DENIED',
}

@Entity('visitor_passes')
export class VisitorPass {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'varchar', length: 120 })
  visitorName!: string;

  @Column({ type: 'varchar', length: 20 })
  visitorPhone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  purpose!: string | null;

  @Column({ type: 'varchar', length: 500, unique: true })
  qrToken!: string;

  @Column({ type: 'varchar', length: 50, default: VisitorStatus.PENDING })
  status!: VisitorStatus;

  @Column({ type: 'timestamp', nullable: true })
  expectedArrival!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expectedDeparture!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  actualEntry!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  actualExit!: Date | null;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
