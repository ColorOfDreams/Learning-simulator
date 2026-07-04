import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionType } from './question-type.entity';
import { BaseService } from '../../core/base/base.service';

@Injectable()
export class QuestionTypesService extends BaseService<QuestionType> {
  constructor(
    @InjectRepository(QuestionType)
    protected readonly repo: Repository<QuestionType>,
  ) {
    super(repo);
  }
}
