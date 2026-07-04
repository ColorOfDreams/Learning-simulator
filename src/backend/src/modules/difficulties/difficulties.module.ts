import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Difficulty } from './difficulty.entity';
import { DifficultysController } from './difficulties.controller';
import { DifficultysService } from './difficulties.service';

@Module({
  imports: [TypeOrmModule.forFeature([Difficulty])],
  controllers: [DifficultysController],
  providers: [DifficultysService],
  exports: [DifficultysService],
})
export class DifficultysModule {}
