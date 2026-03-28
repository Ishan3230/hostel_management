import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum SleepSchedule {
  EARLY_BIRD = 'EARLY_BIRD',
  NIGHT_OWL = 'NIGHT_OWL',
  FLEXIBLE = 'FLEXIBLE',
}

export enum StudyHabits {
  QUIET = 'QUIET',
  GROUP = 'GROUP',
  MUSIC = 'MUSIC',
}

@Entity('student_preferences')
export class StudentPreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @Column({ type: 'uuid', unique: true })
  studentId!: string;

  @Column({ type: 'varchar', length: 50, default: SleepSchedule.FLEXIBLE })
  sleepSchedule!: SleepSchedule;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cleanliness!: string | null; // NEAT_FREAK, MODERATE, MESSY

  @Column({ type: 'int', default: 3 })
  cleanlinessLevel!: number; // 1-5 legacy/score

  @Column({ type: 'varchar', length: 50, default: StudyHabits.QUIET })
  studyHabits!: StudyHabits;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department!: string | null;

  @Column({ type: 'int', nullable: true })
  year!: number | null;

  @Column({ type: 'text', nullable: true })
  hobbies!: string | null;

  @Column({ type: 'text', nullable: true })
  additionalNotes!: string | null;

  @CreateDateColumn()
  submittedAt!: Date;
}
