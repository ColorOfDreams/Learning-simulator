import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Grade } from './grade.entity';
import { GradesService } from './grades.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('grades')
@Controller('grades')
export class GradesController extends BaseController<Grade> {
  constructor(private readonly service: GradesService) {
    super(service);
  }
}
