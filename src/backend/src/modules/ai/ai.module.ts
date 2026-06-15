import { Module } from '@nestjs/common';
import { LearningModule } from '../learning/learning.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [LearningModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
