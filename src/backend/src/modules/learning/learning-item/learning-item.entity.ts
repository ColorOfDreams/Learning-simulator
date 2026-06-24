import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type {
  LearningAnswer,
  LearningDifficulty,
  LearningParameter,
  LearningTarget,
} from './learning-item.types';

@Entity('learning_items')
export class LearningItemEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar', default: 'physics' })
  subject!: string;

  @Column({ type: 'int', default: 11 })
  grade!: number;

  @Column({ type: 'varchar' })
  chapter!: string;

  @Column({ name: 'lesson_id', type: 'varchar', nullable: true })
  lessonId?: string;

  @Column({ name: 'lesson_title', type: 'varchar', nullable: true })
  lessonTitle?: string;

  @Column({ type: 'varchar' })
  topic!: string;

  @Column({ name: 'pattern_id', type: 'varchar', nullable: true })
  patternId?: string;

  @Column({ name: 'simulation_id', type: 'varchar', nullable: true })
  simulationId?: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text' })
  text!: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  parameters!: LearningParameter[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  target!: LearningTarget[];

  @Column({ type: 'jsonb' })
  answer!: LearningAnswer;

  @Column({ type: 'varchar', default: 'recognition' })
  difficulty!: LearningDifficulty;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  concepts!: string[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  skills!: string[];

  @Column({ type: 'jsonb', nullable: true })
  source?: any;

  @Column({ name: 'validation_status', type: 'varchar', nullable: true })
  validationStatus?: string;

  @Column({ name: 'source_data', type: 'jsonb', nullable: true })
  sourceData?: any;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
