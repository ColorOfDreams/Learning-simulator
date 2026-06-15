import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type {
  TheoryChunkType,
  TheoryMetadata,
  TheorySource,
} from './theory-chunk.types';

@Entity('theory_chunks')
export class TheoryChunkEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar', default: 'physics' })
  subject: string;

  @Column({ type: 'int', default: 11 })
  grade: number;

  @Column({ type: 'varchar' })
  chapter: string;

  @Column({ type: 'varchar' })
  topic: string;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'varchar' })
  type: TheoryChunkType;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  keywords: string[];

  @Column({ type: 'jsonb', nullable: true })
  source?: TheorySource;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: TheoryMetadata;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
