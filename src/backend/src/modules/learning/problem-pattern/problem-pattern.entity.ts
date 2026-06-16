import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type {
  ProblemPatternExample,
  ProblemPatternLevel,
  ProblemPatternMetadata,
} from './problem-pattern.types';

@Entity('problem_patterns')
export class ProblemPatternEntity {
  @PrimaryColumn({ name: 'pattern_id', type: 'varchar' })
  patternId!: string;

  @Column({ type: 'varchar', default: 'physics' })
  subject!: string;

  @Column({ type: 'int', default: 11 })
  grade!: number;

  @Column({ type: 'varchar' })
  chapter!: string;

  @Column({ type: 'varchar' })
  topic!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'main_formula', type: 'varchar', nullable: true })
  mainFormula?: string;

  @Column({
    name: 'required_parameters',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  requiredParameters!: string[];

  @Column({
    name: 'optional_parameters',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  optionalParameters!: string[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  target!: string[];

  @Column({ name: 'simulation_id', type: 'varchar', nullable: true })
  simulationId?: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  levels!: ProblemPatternLevel[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  examples!: ProblemPatternExample[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: ProblemPatternMetadata;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
