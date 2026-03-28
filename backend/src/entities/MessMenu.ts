import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
}

@Entity('mess_menus')
export class MessMenu {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mealType!: MealType;

  @Column({ type: 'json' })
  items!: string[]; // list of food item names

  @Column({ type: 'uuid', nullable: true })
  uploadedBy!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity('mess_feedbacks')
export class MessFeedback {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => MessMenu, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menuId' })
  menu!: MessMenu;

  @Column({ type: 'uuid' })
  menuId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'int' })
  rating!: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
