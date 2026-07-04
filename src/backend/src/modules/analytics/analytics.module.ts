import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from '../classrooms/entities/class.entity';
import { ClassMemberEntity } from '../classrooms/entities/class-member.entity';
import { ClassAssignmentEntity } from '../classrooms/entities/class-assignment.entity';
import { AssignmentSubmissionEntity } from '../classrooms/entities/assignment-submission.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UserLabSessionEntity } from '../users/entities/user-lab-session.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassEntity,
      ClassMemberEntity,
      ClassAssignmentEntity,
      AssignmentSubmissionEntity,
      UserEntity,
      UserLabSessionEntity,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
