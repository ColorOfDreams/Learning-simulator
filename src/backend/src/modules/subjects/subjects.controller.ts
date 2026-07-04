import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Subject } from './subject.entity';
import { SubjectsService } from './subjects.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('subjects')
@Controller('subjects')
export class SubjectsController extends BaseController<Subject> {
  constructor(private readonly service: SubjectsService) {
    super(service);
  }
}
