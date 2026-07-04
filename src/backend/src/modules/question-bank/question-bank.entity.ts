import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  ESSAY = 'ESSAY',
  SHORT_ANSWER = 'SHORT_ANSWER',
}

@Entity('question_bank')
export class QuestionEntity extends BaseEntity {
  @ApiProperty({ enum: QuestionType })
  @Column({ type: 'enum', enum: QuestionType })
  type!: QuestionType;

  @ApiProperty()
  @Column()
  subject!: string;

  @ApiProperty()
  @Column({ type: 'int', default: 10 })
  grade!: number;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  chapter?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  topic?: string;

  @ApiProperty()
  @Column({ type: 'text' })
  question!: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  options?: { key: string; text: string }[];

  @ApiProperty()
  @Column({ type: 'text' })
  correctAnswer!: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  explanation?: string;

  @ApiProperty()
  @Column({ type: 'int', default: 2 })
  difficulty!: number;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  createdBy?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];
}
