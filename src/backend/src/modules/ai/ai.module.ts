import { Module } from '@nestjs/common';
import { LearningModule } from '../learning/learning.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { LlmAnswerService } from './llm-answer.service';
import { LlmService } from './llm.service';
import { RagRetrievalService } from './rag-retrieval.service';

@Module({
  imports: [LearningModule],
  controllers: [AiController],
  providers: [
    AiService,
    LlmService,
    LlmAnswerService,
    EmbeddingService,
    RagRetrievalService,
  ],
  exports: [AiService, LlmService, EmbeddingService, RagRetrievalService],
})
export class AiModule {}
