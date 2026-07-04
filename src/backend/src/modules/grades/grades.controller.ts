import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Grade } from './grade.entity';
import { GradesService } from './grades.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('grades')
@Controller('grades')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class GradesController extends BaseController<Grade> {
  constructor(private readonly service: GradesService) {
    super(service);
  }
}
