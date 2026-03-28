import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  TRIPLE = 'TRIPLE',
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  FULL = 'FULL',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  roomNumber!: string;

  @Column({ type: 'int' })
  floor!: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  hostelBlock!: string | null;

  @Column({ type: 'varchar', length: 50, default: RoomType.DOUBLE })
  type!: RoomType;

  @Column({ type: 'int', default: 2 })
  capacity!: number;

  @Column({ type: 'int', default: 0 })
  currentOccupancy!: number;

  @Column({ type: 'varchar', length: 50, default: RoomStatus.AVAILABLE })
  status!: RoomStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
