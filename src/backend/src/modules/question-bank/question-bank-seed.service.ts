import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionEntity } from './question-bank.entity';
import { SEED_QUESTIONS } from './question-bank.seed';

@Injectable()
export class QuestionBankSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepo: Repository<QuestionEntity>,
  ) {}

  async onModuleInit() {
    if (process.env.DEMO_SEED_ON_START === 'false') return;
    const count = await this.questionRepo.count();
    if (count > 0) return;
    const questions = SEED_QUESTIONS.map(q => this.questionRepo.create({ ...q, createdBy: 'seed' }));
    await this.questionRepo.save(questions);
    console.log(`✅ Seeded ${questions.length} questions to question_bank`);
  }
}
