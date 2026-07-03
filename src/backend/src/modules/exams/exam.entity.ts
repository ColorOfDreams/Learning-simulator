import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('exams')
export class ExamEntity extends BaseEntity {
  @ApiProperty()
  @Column()
  title!: string;

  @ApiProperty()
  @Column()
  subject!: string;

  @ApiProperty()
  @Column({ type: 'int', default: 10 })
  grade!: number;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'int', nullable: true })
  duration?: number;

  @ApiProperty({ default: 10 })
  @Column({ type: 'int', default: 10 })
  totalScore!: number;

  @ApiProperty()
  @Column()
  createdBy!: string;

  @ApiProperty({ default: false })
  @Column({ default: false })
  isAIGenerated!: boolean;

  @ApiProperty()
  @Column({ type: 'jsonb' })
  sections!: ExamSection[];

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  questionCount!: number;
}

export interface ExamSection {
  type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER';
  title: string;
  maxScore: number;
  questions: ExamQuestionRef[];
}

export interface ExamQuestionRef {
  questionId: string;
  score: number;
}
