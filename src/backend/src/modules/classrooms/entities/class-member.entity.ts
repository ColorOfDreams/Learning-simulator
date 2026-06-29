import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ClassEntity } from './class.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ClassMemberStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('class_members')
export class ClassMemberEntity extends BaseEntity {
  @ApiProperty({ description: 'ID của lớp học' })
  @Column()
  classId!: string;

  @ApiProperty({ description: 'ID của học sinh (nếu có tài khoản)' })
  @Column({ nullable: true })
  userId?: string;

  @ApiProperty({ description: 'Họ và tên học sinh' })
  @Column()
  studentName!: string;

  @ApiProperty({ description: 'Mã học sinh' })
  @Column()
  studentCode!: string;

  @ApiProperty({ description: 'Trạng thái xét duyệt', enum: ClassMemberStatus })
  @Column({
    type: 'enum',
    enum: ClassMemberStatus,
    default: ClassMemberStatus.PENDING,
  })
  status!: ClassMemberStatus;

  @ApiProperty({ description: 'Ngày được duyệt vào lớp' })
  @Column({ type: 'timestamp', nullable: true })
  joinedAt?: Date;

  @ManyToOne(() => ClassEntity, (cls) => cls.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  classDetails!: ClassEntity;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;
}
