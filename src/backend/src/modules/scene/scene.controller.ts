import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { SceneEntity } from './scene.entity';
import { SceneService } from './scene.service';

@ApiTags('Quản lý thí nghiệm (Sandbox)')
@Controller('scene')
export class SceneController extends BaseController<SceneEntity> {
  constructor(private readonly sceneService: SceneService) {
    super(sceneService);
  }
}
