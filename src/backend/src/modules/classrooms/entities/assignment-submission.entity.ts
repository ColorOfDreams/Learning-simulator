import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { ClassAssignmentEntity } from './class-assignment.entity';
import { ClassMemberEntity } from './class-member.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum SubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
}

@Entity('assignment_submissions')
export class AssignmentSubmissionEntity extends BaseEntity {
  @ApiProperty({ description: 'ID của bài tập' })
  @Column()
  assignmentId!: string;

  @ApiProperty({ description: 'ID của thành viên lớp nộp bài' })
  @Column()
  memberId!: string;

  @ApiProperty({ description: 'Điểm số (dựa trên AI Quiz)' })
  @Column({ type: 'float', nullable: true })
  score?: number;

  @ApiProperty({ description: 'Trạng thái nộp bài', enum: SubmissionStatus })
  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.SUBMITTED,
  })
  status!: SubmissionStatus;

  @ApiProperty({ description: 'Ngày nộp' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt!: Date;

  @ManyToOne(() => ClassAssignmentEntity, (ass) => ass.submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assignmentId' })
  assignment!: ClassAssignmentEntity;

  @ManyToOne(() => ClassMemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'memberId' })
  member!: ClassMemberEntity;
}
