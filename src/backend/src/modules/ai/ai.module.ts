import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { LearningModule } from '../learning/learning.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiUsageService } from './ai-usage.service';
import { AiUsageLogEntity } from './entities/ai-usage-log.entity';
import { EmbeddingService } from './embedding.service';
import { LlmAnswerService } from './llm-answer.service';
import { LlmService } from './llm.service';
import { RagRetrievalService } from './rag-retrieval.service';

@Module({
  imports: [
    LearningModule,
    TypeOrmModule.forFeature([AiUsageLogEntity]),
    ThrottlerModule.forRoot([{ name: 'default', limit: 10, ttl: 60000 }]),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    LlmService,
    LlmAnswerService,
    EmbeddingService,
    RagRetrievalService,
    AiUsageService,
  ],
  exports: [
    AiService,
    LlmService,
    EmbeddingService,
    RagRetrievalService,
    AiUsageService,
    ThrottlerModule,
  ],
})
export class AiModule {}
