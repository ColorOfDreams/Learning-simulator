import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UserLabSessionEntity } from '../users/entities/user-lab-session.entity';
import { ClassEntity } from '../classrooms/entities/class.entity';
import { ExamEntity } from '../exams/exam.entity';
import { QuestionEntity } from '../question-bank/question-bank.entity';
import { SceneEntity } from '../scene/scene.entity';
import { ActivityModule } from '../activity/activity.module';
import { AiModule } from '../ai/ai.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RailwayMetricsService } from './railway-metrics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserLabSessionEntity,
      ClassEntity,
      ExamEntity,
      QuestionEntity,
      SceneEntity,
    ]),
    ActivityModule,
    AiModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, RailwayMetricsService],
})
export class AdminModule {}
