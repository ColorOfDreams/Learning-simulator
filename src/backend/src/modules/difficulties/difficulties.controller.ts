import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Difficulty } from './difficulty.entity';
import { DifficultysService } from './difficulties.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('difficulties')
@Controller('difficulties')
export class DifficultysController extends BaseController<Difficulty> {
  constructor(private readonly service: DifficultysService) {
    super(service);
  }
}
