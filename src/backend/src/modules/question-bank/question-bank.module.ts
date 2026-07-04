import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { QuestionEntity } from './question-bank.entity';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';
import { QuestionBankSeedService } from './question-bank-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionEntity]), AiModule],
  controllers: [QuestionBankController],
  providers: [QuestionBankService, QuestionBankSeedService],
  exports: [QuestionBankService],
})
export class QuestionBankModule {}
