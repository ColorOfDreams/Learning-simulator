import { createReadStream, createWriteStream, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import * as readline from 'readline';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { hashText } from '../src/modules/ai/hash.util';

type ExportedEmbedding = {
  id: string;
  contentHash: string;
  embeddingModel: string | null;
  embeddingVersion: string | null;
  embeddedAt: string | null;
  dimension: number | null;
  embedding: string;
};

type RestoreStats = {
  restored: number;
  missingChunk: number;
  hashMismatch: number;
  invalidRecord: number;
};

async function main() {
  const mode = process.argv[2] ?? 'export';
  const outputPath =
    process.argv[3] ??
    resolve(
      process.cwd(),
      'reports',
      `theory-embeddings-backup-${timestamp()}.jsonl`,
    );

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);

    if (mode === 'export') {
      await exportEmbeddings(dataSource, outputPath);
      return;
    }

    if (mode === 'restore') {
      await restoreEmbeddings(dataSource, outputPath);
      return;
    }

    throw new Error(
      `Unknown mode "${mode}". Use "export" or "restore". Example: npm run backup:theory-embeddings -- reports\\embeddings.jsonl`,
    );
  } finally {
    await app.close();
  }
}

async function exportEmbeddings(dataSource: DataSource, outputPath: string) {
  mkdirSync(dirname(outputPath), { recursive: true });

  const rows = (await dataSource.query(`
    SELECT
      id,
      content_hash AS "contentHash",
      embedding_model AS "embeddingModel",
      embedding_version AS "embeddingVersion",
      embedded_at AS "embeddedAt",
      vector_dims(embedding)::int AS "dimension",
      embedding::text AS embedding
    FROM theory_chunks
    WHERE embedding IS NOT NULL
    ORDER BY id ASC
  `)) as ExportedEmbedding[];

  const stream = createWriteStream(outputPath, { encoding: 'utf-8' });
  for (const row of rows) {
    stream.write(`${JSON.stringify(row)}\n`);
  }
  await new Promise<void>((resolvePromise, reject) => {
    stream.end(resolvePromise);
    stream.on('error', reject);
  });

  console.table([{ exported: rows.length, outputPath }]);
}

async function restoreEmbeddings(dataSource: DataSource, inputPath: string) {
  const stats: RestoreStats = {
    restored: 0,
    missingChunk: 0,
    hashMismatch: 0,
    invalidRecord: 0,
  };

  const reader = readline.createInterface({
    input: createReadStream(inputPath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  });

  for await (const line of reader) {
    if (!line.trim()) {
      continue;
    }

    let record: ExportedEmbedding;
    try {
      record = JSON.parse(line) as ExportedEmbedding;
    } catch {
      stats.invalidRecord += 1;
      continue;
    }

    if (
      !record.id ||
      !record.contentHash ||
      !record.embedding ||
      typeof record.embedding !== 'string'
    ) {
      stats.invalidRecord += 1;
      continue;
    }

    const [chunk] = (await dataSource.query(
      `SELECT text FROM theory_chunks WHERE id = $1`,
      [record.id],
    )) as Array<{ text: string }>;

    if (!chunk) {
      stats.missingChunk += 1;
      continue;
    }

    if (hashText(chunk.text) !== record.contentHash) {
      stats.hashMismatch += 1;
      continue;
    }

    await dataSource.query(
      `
        UPDATE theory_chunks
        SET
          embedding = $1::vector,
          embedding_model = $2,
          embedding_version = $3,
          content_hash = $4,
          embedded_at = COALESCE($5::timestamp, embedded_at, CURRENT_TIMESTAMP)
        WHERE id = $6
      `,
      [
        record.embedding,
        record.embeddingModel,
        record.embeddingVersion,
        record.contentHash,
        record.embeddedAt,
        record.id,
      ],
    );
    stats.restored += 1;
  }

  console.table([stats]);
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
