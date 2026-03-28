import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum AlertCategory {
  MEDICAL = 'MEDICAL',
  FIRE = 'FIRE',
  SECURITY = 'SECURITY',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
}

@Entity('emergency_alerts')
export class EmergencyAlert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'triggeredBy' })
  triggeredByUser!: User;

  @Column({ type: 'uuid' })
  triggeredBy!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category!: AlertCategory;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location!: string | null;

  @Column({ type: 'varchar', length: 50, default: AlertStatus.ACTIVE })
  status!: AlertStatus;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
