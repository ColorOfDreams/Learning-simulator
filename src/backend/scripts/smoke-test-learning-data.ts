import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { LearningItemEntity } from '../src/modules/learning/learning-item/learning-item.entity';
import { ProblemPatternEntity } from '../src/modules/learning/problem-pattern/problem-pattern.entity';
import { TheoryChunkEntity } from '../src/modules/learning/theory-chunk/theory-chunk.entity';
import { TheoryChunkService } from '../src/modules/learning/theory-chunk/theory-chunk.service';
import { DataSource } from 'typeorm';

const requiredQueries = ['dao động điều hòa', 'bước sóng', 'định luật Coulomb'];

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const theoryService = app.get(TheoryChunkService);
    const [theoryChunks, problemPatterns, learningItems] = await Promise.all([
      dataSource.getRepository(TheoryChunkEntity).count(),
      dataSource.getRepository(ProblemPatternEntity).count(),
      dataSource.getRepository(LearningItemEntity).count(),
    ]);
    const searchResults = await Promise.all(
      requiredQueries.map(async (query) => ({
        query,
        results: await theoryService.searchForRag(query),
      })),
    );

    console.table([
      { name: 'theoryChunks', count: theoryChunks },
      { name: 'problemPatterns', count: problemPatterns },
      { name: 'learningItems', count: learningItems },
    ]);
    searchResults.forEach(({ query, results }) =>
      console.log(`${query}: ${results.length} result(s)`),
    );

    if (
      theoryChunks === 0 ||
      problemPatterns === 0 ||
      learningItems === 0 ||
      searchResults.some(({ results }) => results.length === 0)
    ) {
      process.exitCode = 1;
    }
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
