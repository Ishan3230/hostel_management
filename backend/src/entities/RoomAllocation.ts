import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from './Room';
import { User } from './User';

@Entity('room_allocations')
export class RoomAllocation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column({ type: 'uuid' })
  roomId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @Column({ type: 'uuid' })
  studentId!: string;

  @CreateDateColumn()
  allottedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  vacatedAt!: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
