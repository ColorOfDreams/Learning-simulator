import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Difficulty } from './difficulty.entity';
import { DifficultysService } from './difficulties.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('difficulties')
@Controller('difficulties')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DifficultysController extends BaseController<Difficulty> {
  constructor(private readonly service: DifficultysService) {
    super(service);
  }
}
