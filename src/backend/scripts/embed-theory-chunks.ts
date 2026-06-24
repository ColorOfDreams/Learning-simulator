import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { EmbeddingService } from '../src/modules/ai/embedding.service';
import { hashText } from '../src/modules/ai/hash.util';
import { toPgVector } from '../src/modules/ai/vector.util';

type TheoryChunkRow = {
  id: string;
  text: string;
  contentHash: string | null;
  hasEmbedding: boolean;
};

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const embeddingService = app.get(EmbeddingService);

    if (!embeddingService.isConfigured()) {
      throw new Error(
        'EMBEDDING_API_KEY is required. Set it before running embed:theory.',
      );
    }

    const chunks = (await dataSource.query(`
      SELECT
        id,
        text,
        content_hash AS "contentHash",
        embedding IS NOT NULL AS "hasEmbedding"
      FROM theory_chunks
      ORDER BY id ASC
    `)) as TheoryChunkRow[];

    let embedded = 0;
    let skipped = 0;
    let failed = 0;

    for (const chunk of chunks) {
      const contentHash = hashText(chunk.text);

      if (chunk.hasEmbedding && chunk.contentHash === contentHash) {
        skipped += 1;
        continue;
      }

      await new Promise((r) => setTimeout(r, 250));

      try {
        const vector = await embeddingService.embedText(chunk.text);

        await dataSource.query(
          `
            UPDATE theory_chunks
            SET
              embedding = $1::vector,
              embedding_model = $2,
              embedding_version = $3,
              content_hash = $4,
              embedded_at = CURRENT_TIMESTAMP
            WHERE id = $5
          `,
          [
            toPgVector(vector),
            embeddingService.model,
            `${embeddingService.model}:${embeddingService.dimension}`,
            contentHash,
            chunk.id,
          ],
        );
        embedded += 1;
      } catch (error) {
        failed += 1;
        console.error(`Failed to embed theory chunk ${chunk.id}:`, error);
      }
    }

    console.table([
      {
        totalChunks: chunks.length,
        embedded,
        skipped,
        failed,
      },
    ]);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
