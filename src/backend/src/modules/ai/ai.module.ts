import { Module } from '@nestjs/common';
import { LearningModule } from '../learning/learning.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { LlmService } from './llm.service';
import { RagRetrievalService } from './rag-retrieval.service';

@Module({
  imports: [LearningModule],
  controllers: [AiController],
  providers: [AiService, LlmService, EmbeddingService, RagRetrievalService],
  exports: [AiService, EmbeddingService, RagRetrievalService],
})
export class AiModule {}
