import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';

@Entity('scenes')
export class SceneEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'room_type', type: 'varchar', length: 50 })
  roomType: string;

  @Column({ type: 'jsonb', nullable: true })
  environment: any;

  @Column({ type: 'jsonb', default: [] })
  objects: any[];
}
