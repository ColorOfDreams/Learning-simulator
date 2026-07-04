import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Subject } from './subject.entity';
import { SubjectsService } from './subjects.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('subjects')
@Controller('subjects')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SubjectsController extends BaseController<Subject> {
  constructor(private readonly service: SubjectsService) {
    super(service);
  }
}
