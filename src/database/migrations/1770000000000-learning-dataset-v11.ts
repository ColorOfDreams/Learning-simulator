import { MigrationInterface, QueryRunner } from 'typeorm';

export class LearningDatasetV111770000000000 implements MigrationInterface {
  name = 'LearningDatasetV111770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE theory_chunks ADD COLUMN IF NOT EXISTS lesson_id varchar`);
    await queryRunner.query(`ALTER TABLE theory_chunks ADD COLUMN IF NOT EXISTS lesson_title varchar`);
    await queryRunner.query(`ALTER TABLE theory_chunks ADD COLUMN IF NOT EXISTS validation_status varchar`);
    await queryRunner.query(`ALTER TABLE theory_chunks ADD COLUMN IF NOT EXISTS source_data jsonb`);
    await queryRunner.query(`ALTER TABLE problem_patterns ADD COLUMN IF NOT EXISTS validation_status varchar`);
    await queryRunner.query(`ALTER TABLE problem_patterns ADD COLUMN IF NOT EXISTS source_data jsonb`);
    await queryRunner.query(`ALTER TABLE learning_items ADD COLUMN IF NOT EXISTS lesson_id varchar`);
    await queryRunner.query(`ALTER TABLE learning_items ADD COLUMN IF NOT EXISTS lesson_title varchar`);
    await queryRunner.query(`ALTER TABLE learning_items ADD COLUMN IF NOT EXISTS source jsonb`);
    await queryRunner.query(`ALTER TABLE learning_items ADD COLUMN IF NOT EXISTS validation_status varchar`);
    await queryRunner.query(`ALTER TABLE learning_items ADD COLUMN IF NOT EXISTS source_data jsonb`);
    await queryRunner.query(`ALTER TABLE simulation_templates ADD COLUMN IF NOT EXISTS engine varchar`);
    await queryRunner.query(`ALTER TABLE simulation_templates ADD COLUMN IF NOT EXISTS scene_type varchar`);
    await queryRunner.query(`ALTER TABLE simulation_templates ADD COLUMN IF NOT EXISTS parameter_schema jsonb`);
    await queryRunner.query(`ALTER TABLE simulation_templates ADD COLUMN IF NOT EXISTS supported_actions jsonb`);
    await queryRunner.query(`ALTER TABLE simulation_templates ADD COLUMN IF NOT EXISTS validation_status varchar`);
    await queryRunner.query(`ALTER TABLE simulation_templates ADD COLUMN IF NOT EXISTS source_data jsonb`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS ai_test_cases (
      id varchar PRIMARY KEY,
      input text NOT NULL,
      expected jsonb NOT NULL,
      source_learning_item_id varchar,
      evaluation_focus jsonb NOT NULL DEFAULT '[]'::jsonb,
      validation_status varchar,
      source_data jsonb,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS media_assets (
      id varchar PRIMARY KEY,
      subject varchar NOT NULL DEFAULT 'physics',
      grade integer NOT NULL DEFAULT 11,
      chapter varchar NOT NULL,
      lesson_id varchar NOT NULL,
      title varchar NOT NULL,
      type varchar NOT NULL,
      path text NOT NULL,
      alt_text text,
      validation_status varchar,
      source_data jsonb,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS media_assets`);
    await queryRunner.query(`DROP TABLE IF EXISTS ai_test_cases`);
    await queryRunner.query(`ALTER TABLE simulation_templates DROP COLUMN IF EXISTS source_data, DROP COLUMN IF EXISTS validation_status, DROP COLUMN IF EXISTS supported_actions, DROP COLUMN IF EXISTS parameter_schema, DROP COLUMN IF EXISTS scene_type, DROP COLUMN IF EXISTS engine`);
    await queryRunner.query(`ALTER TABLE learning_items DROP COLUMN IF EXISTS source_data, DROP COLUMN IF EXISTS validation_status, DROP COLUMN IF EXISTS source, DROP COLUMN IF EXISTS lesson_title, DROP COLUMN IF EXISTS lesson_id`);
    await queryRunner.query(`ALTER TABLE problem_patterns DROP COLUMN IF EXISTS source_data, DROP COLUMN IF EXISTS validation_status`);
    await queryRunner.query(`ALTER TABLE theory_chunks DROP COLUMN IF EXISTS source_data, DROP COLUMN IF EXISTS validation_status, DROP COLUMN IF EXISTS lesson_title, DROP COLUMN IF EXISTS lesson_id`);
  }
}
