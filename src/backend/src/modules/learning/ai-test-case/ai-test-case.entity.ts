import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_test_cases')
export class AiTestCaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'text' })
  input: string;

  @Column({ type: 'jsonb' })
  expected: any;

  @Column({ name: 'source_learning_item_id', type: 'varchar', nullable: true })
  sourceLearningItemId?: string;

  @Column({ name: 'evaluation_focus', type: 'jsonb', default: () => "'[]'::jsonb" })
  evaluationFocus: string[];

  @Column({ name: 'validation_status', type: 'varchar', nullable: true })
  validationStatus?: string;

  @Column({ name: 'source_data', type: 'jsonb', nullable: true })
  sourceData?: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
