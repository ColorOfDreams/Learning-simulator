import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { LearningDatasetSeedService } from '../src/modules/learning/learning-dataset-seed.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const service = app.get(LearningDatasetSeedService);
    const result = await service.seedLearningDataset(process.argv[2]);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
