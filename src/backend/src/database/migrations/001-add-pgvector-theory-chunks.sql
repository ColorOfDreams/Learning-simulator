-- Run manually (after filling connection values):
-- psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -f src/database/migrations/001-add-pgvector-theory-chunks.sql

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE theory_chunks
ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE theory_chunks
ADD COLUMN IF NOT EXISTS embedding_model TEXT;

ALTER TABLE theory_chunks
ADD COLUMN IF NOT EXISTS embedding_version TEXT;

ALTER TABLE theory_chunks
ADD COLUMN IF NOT EXISTS content_hash TEXT;

ALTER TABLE theory_chunks
ADD COLUMN IF NOT EXISTS embedded_at TIMESTAMP;
