import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('topics')
export class Topic extends BaseEntity {
  @ApiProperty({ description: 'Tên chủ đề' })
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Mã chủ đề' })
  @Column({ name: 'code', type: 'varchar', length: 100 })
  code!: string;

  @ApiProperty({ description: 'Mô tả thêm', required: false })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Mã môn học', required: false })
  @Column({ name: 'subject_code', type: 'varchar', length: 100, nullable: true })
  subjectCode?: string;

  @ApiProperty({ description: 'Mã lớp', required: false })
  @Column({ name: 'grade_code', type: 'varchar', length: 100, nullable: true })
  gradeCode?: string;
}
