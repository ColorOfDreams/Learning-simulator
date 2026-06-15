import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SceneController } from './scene.controller';
import { SceneService } from './scene.service';
import { SceneEntity } from './scene.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SceneEntity])],
  controllers: [SceneController],
  providers: [SceneService],
  exports: [SceneService],
})
export class SceneModule {}
