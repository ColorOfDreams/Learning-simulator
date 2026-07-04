import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuestionType } from './question-type.entity';
import { QuestionTypesService } from './question_types.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('question-types')
@Controller('question-types')
export class QuestionTypesController extends BaseController<QuestionType> {
  constructor(private readonly service: QuestionTypesService) {
    super(service);
  }
}
