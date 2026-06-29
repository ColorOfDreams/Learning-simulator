import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export type LabStatus = 'in_progress' | 'completed';

@Entity('user_lab_sessions')
export class UserLabSessionEntity extends BaseEntity {
  @ApiProperty()
  @Column()
  userId!: string;

  @ApiProperty()
  @Column()
  simulationId!: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  simulationTitle?: string;

  @ApiProperty({ default: 'chem' })
  @Column({ default: 'chem' })
  subject!: string;

  @ApiProperty({ enum: ['in_progress', 'completed'], default: 'in_progress' })
  @Column({
    type: 'enum',
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
  })
  status!: LabStatus;

  @ApiProperty({ nullable: true })
  @Column({ type: 'int', nullable: true })
  score?: number;

  @ApiProperty({ nullable: true })
  @Column({ type: 'int', nullable: true })
  totalQuestions?: number;

  @ApiProperty({ nullable: true })
  @Column({ type: 'int', nullable: true })
  correctAnswers?: number;

  @ApiProperty({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;
}
