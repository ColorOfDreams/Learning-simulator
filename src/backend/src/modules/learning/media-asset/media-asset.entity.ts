import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('media_assets')
export class MediaAssetEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar', default: 'physics' })
  subject: string;

  @Column({ type: 'int', default: 11 })
  grade: number;

  @Column({ type: 'varchar' })
  chapter: string;

  @Column({ name: 'lesson_id', type: 'varchar' })
  lessonId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'text' })
  path: string;

  @Column({ name: 'alt_text', type: 'text', nullable: true })
  altText?: string;

  @Column({ name: 'validation_status', type: 'varchar', nullable: true })
  validationStatus?: string;

  @Column({ name: 'source_data', type: 'jsonb', nullable: true })
  sourceData?: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
