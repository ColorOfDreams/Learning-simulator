import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

type CountRow = {
  totalTheoryChunks: number | string;
  activeTheoryChunks: number | string;
  embeddedTheoryChunks: number | string;
  missingEmbeddings: number | string;
  needsReviewTheoryChunks: number | string;
  generatedCleanedTheoryChunks: number | string;
};

async function main() {
  const outputPath = process.argv[2];
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const [countRow] = (await dataSource.query(`
      SELECT
        COUNT(*)::int AS "totalTheoryChunks",
        COUNT(*) FILTER (WHERE is_active = true)::int AS "activeTheoryChunks",
        COUNT(embedding)::int AS "embeddedTheoryChunks",
        (COUNT(*) - COUNT(embedding))::int AS "missingEmbeddings",
        COUNT(*) FILTER (WHERE validation_status = 'needs_review')::int AS "needsReviewTheoryChunks",
        COUNT(*) FILTER (
          WHERE id LIKE 'GENCLN_%'
             OR source_data->'metadata'->>'pipeline' = 'scripts/convert_cleaned_to_learning_structured.py'
             OR metadata->>'pipeline' = 'scripts/convert_cleaned_to_learning_structured.py'
        )::int AS "generatedCleanedTheoryChunks"
      FROM theory_chunks
    `)) as CountRow[];

    const subjectDistribution = await dataSource.query(`
      SELECT subject, COUNT(*)::int AS count
      FROM theory_chunks
      GROUP BY subject
      ORDER BY subject
    `);
    const gradeDistribution = await dataSource.query(`
      SELECT grade, COUNT(*)::int AS count
      FROM theory_chunks
      GROUP BY grade
      ORDER BY grade
    `);
    const validationStatusDistribution = await dataSource.query(`
      SELECT COALESCE(validation_status, 'null') AS "validationStatus", COUNT(*)::int AS count
      FROM theory_chunks
      GROUP BY validation_status
      ORDER BY validation_status
    `);

    const diagnostics = {
      generated_at: new Date().toISOString(),
      theoryChunks: normalizeNumbers(countRow),
      subjectDistribution,
      gradeDistribution,
      validationStatusDistribution,
    };

    const body = JSON.stringify(diagnostics, null, 2);
    if (outputPath) {
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `${body}\n`, 'utf8');
    }
    console.log(body);
  } finally {
    await app.close();
  }
}

function normalizeNumbers(row: CountRow) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, Number(value)]),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
