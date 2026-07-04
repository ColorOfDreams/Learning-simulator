import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('question_types')
export class QuestionType extends BaseEntity {
  @ApiProperty({ description: 'Tên question-type' })
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Mã question-type' })
  @Column({ name: 'code', type: 'varchar', length: 100 })
  code!: string;

  @ApiProperty({ description: 'Mô tả thêm', required: false })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;
}
