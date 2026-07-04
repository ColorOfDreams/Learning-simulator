import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('daily_active_users')
@Index(['userId', 'date'], { unique: true })
export class DailyActiveUserEntity extends BaseEntity {
  @ApiProperty()
  @Column()
  userId!: string;

  @ApiProperty({ description: 'Ngày hoạt động (YYYY-MM-DD)' })
  @Column({ type: 'date' })
  date!: string;
}
