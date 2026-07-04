import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ClassMemberEntity } from './class-member.entity';
import { ClassAssignmentEntity } from './class-assignment.entity';

@Entity('classes')
export class ClassEntity extends BaseEntity {
  @ApiProperty({ description: 'Tên lớp học' })
  @Column()
  name!: string;

  @ApiProperty({ description: 'Mô tả lớp học', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Mã mời tham gia lớp học' })
  @Column({ unique: true })
  inviteCode!: string;

  @ApiProperty({ description: 'ID của giáo viên tạo lớp' })
  @Column()
  teacherId!: string;

  @ApiProperty({ description: 'Môn học của lớp', required: false })
  @Column({ nullable: true })
  subject?: string;

  @ApiProperty({ description: 'Khối lớp', required: false })
  @Column({ type: 'int', nullable: true })
  grade?: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'teacherId' })
  teacher!: UserEntity;

  @OneToMany(() => ClassMemberEntity, (member) => member.classDetails)
  members!: ClassMemberEntity[];

  @OneToMany(
    () => ClassAssignmentEntity,
    (assignment) => assignment.classDetails,
  )
  assignments!: ClassAssignmentEntity[];

  @ApiProperty({ description: 'Lớp học có bị khóa bởi admin hay không', default: false })
  @Column({ type: 'boolean', default: false })
  isLocked!: boolean;
}
