import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QuestionType } from './question-type.entity';
import { QuestionTypesService } from './question_types.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('question-types')
@Controller('question-types')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class QuestionTypesController extends BaseController<QuestionType> {
  constructor(private readonly service: QuestionTypesService) {
    super(service);
  }
}
