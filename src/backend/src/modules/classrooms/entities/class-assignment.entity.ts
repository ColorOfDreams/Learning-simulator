import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { ClassEntity } from './class.entity';
// trigger recheck
import { ApiProperty } from '@nestjs/swagger';
import { AssignmentSubmissionEntity } from './assignment-submission.entity';

@Entity('class_assignments')
export class ClassAssignmentEntity extends BaseEntity {
  @ApiProperty({ description: 'ID của lớp học' })
  @Column()
  classId!: string;

  @ApiProperty({ description: 'Tên bài tập' })
  @Column()
  title!: string;

  @ApiProperty({ description: 'Mô tả bài tập', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'ID của thí nghiệm (SIM-... hoặc UUID)' })
  @Column()
  simulationId!: string;

  @ApiProperty({ description: 'Hạn nộp bài' })
  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @ManyToOne(() => ClassEntity, (cls) => cls.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classId' })
  classDetails!: ClassEntity;

  @OneToMany(() => AssignmentSubmissionEntity, (sub) => sub.assignment)
  submissions!: AssignmentSubmissionEntity[];
}
