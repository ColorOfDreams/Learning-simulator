import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SimulationTemplateEntity } from './simulation-template/simulation-template.entity';
import { SimulationTemplateService } from './simulation-template/simulation-template.service';
import { SimulationTemplateController } from './simulation-template/simulation-template.controller';

import { LearningItemEntity } from './learning-item/learning-item.entity';
import { LearningItemService } from './learning-item/learning-item.service';
import { LearningItemController } from './learning-item/learning-item.controller';

import { TheoryChunkEntity } from './theory-chunk/theory-chunk.entity';
import { TheoryChunkService } from './theory-chunk/theory-chunk.service';
import { TheoryChunkController } from './theory-chunk/theory-chunk.controller';

import { ProblemPatternEntity } from './problem-pattern/problem-pattern.entity';
import { ProblemPatternService } from './problem-pattern/problem-pattern.service';
import { ProblemPatternController } from './problem-pattern/problem-pattern.controller';
import { LearningController } from './learning.controller';
import { LearningDatasetSeedService } from './learning-dataset-seed.service';
import { LearningService } from './learning.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SimulationTemplateEntity,
      LearningItemEntity,
      TheoryChunkEntity,
      ProblemPatternEntity,
    ]),
  ],
  controllers: [
    LearningController,
    SimulationTemplateController,
    LearningItemController,
    TheoryChunkController,
    ProblemPatternController,
  ],
  providers: [
    LearningService,
    LearningDatasetSeedService,
    SimulationTemplateService,
    LearningItemService,
    TheoryChunkService,
    ProblemPatternService,
  ],
  exports: [
    SimulationTemplateService,
    LearningItemService,
    TheoryChunkService,
    ProblemPatternService,
  ],
})
export class LearningModule {}
