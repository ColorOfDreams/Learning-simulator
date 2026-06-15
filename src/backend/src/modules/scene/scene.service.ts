import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../core/base/base.service';
import { SceneEntity } from './scene.entity';

@Injectable()
export class SceneService extends BaseService<SceneEntity> {
  constructor(
    @InjectRepository(SceneEntity)
    private readonly sceneRepo: Repository<SceneEntity>,
  ) {
    super(sceneRepo);
  }
}
