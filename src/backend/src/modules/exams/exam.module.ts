import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { QuestionBankModule } from '../question-bank/question-bank.module';
import { QuestionEntity } from '../question-bank/question-bank.entity';
import { ExamEntity } from './exam.entity';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExamEntity, QuestionEntity]),
    AiModule,
    QuestionBankModule,
  ],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
