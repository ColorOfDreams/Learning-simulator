import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { LearningModule } from './modules/learning/learning.module';
import { AiModule } from './modules/ai/ai.module';
import { ChatModule } from './modules/chat/chat.module';
import { SceneModule } from './modules/scene/scene.module';
import { ClassroomsModule } from './modules/classrooms/classrooms.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { QuestionBankModule } from './modules/question-bank/question-bank.module';
import { ExamModule } from './modules/exams/exam.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { GradesModule } from './modules/grades/grades.module';
import { QuestionTypesModule } from './modules/question-types/question_types.module';
import { TopicsModule } from './modules/topics/topics.module';
import { DifficultysModule } from './modules/difficulties/difficulties.module';
import { ActivityModule } from './modules/activity/activity.module';
import { AdminModule } from './modules/admin/admin.module';
import { databaseOptions } from './core/database-options';
import { HealthController } from './core/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseOptions,
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    LearningModule,
    AiModule,
    ChatModule,
    SceneModule,
    ClassroomsModule,
    NotificationsModule,
    AnalyticsModule,
    QuestionBankModule,
    ExamModule,
    SubjectsModule,
    GradesModule,
    QuestionTypesModule,
    TopicsModule,
    DifficultysModule,
    ActivityModule,
    AdminModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }
