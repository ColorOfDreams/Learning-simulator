import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionType } from './question-type.entity';
import { QuestionTypesController } from './question_types.controller';
import { QuestionTypesService } from './question_types.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionType])],
  controllers: [QuestionTypesController],
  providers: [QuestionTypesService],
  exports: [QuestionTypesService],
})
export class QuestionTypesModule {}
