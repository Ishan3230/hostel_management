import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum ListingCategory {
  BOOKS = 'BOOKS',
  ELECTRONICS = 'ELECTRONICS',
  CYCLES = 'CYCLES',
  CLOTHING = 'CLOTHING',
  FURNITURE = 'FURNITURE',
  OTHER = 'OTHER',
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  REMOVED = 'REMOVED',
}

@Entity('marketplace_listings')
export class MarketplaceListing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sellerId' })
  seller!: User;

  @Column({ type: 'uuid' })
  sellerId!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', length: 50, default: ListingCategory.OTHER })
  category!: ListingCategory;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'varchar', length: 50, default: ListingStatus.ACTIVE })
  status!: ListingStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
