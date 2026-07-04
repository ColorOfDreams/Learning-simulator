import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('ai_usage_logs')
export class AiUsageLogEntity extends BaseEntity {
  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  userId?: string;

  @ApiProperty()
  @Column()
  model!: string;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  promptTokens!: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  completionTokens!: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  totalTokens!: number;

  @ApiProperty({ description: 'Chi phí ước tính (USD), không phải số hóa đơn chính xác' })
  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  estimatedCostUsd!: number;
}
