import { Module } from '@nestjs/common';
import { LearningModule } from '../learning/learning.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LlmService } from './llm.service';

@Module({
  imports: [LearningModule],
  controllers: [AiController],
  providers: [AiService, LlmService],
  exports: [AiService],
})
export class AiModule {}
