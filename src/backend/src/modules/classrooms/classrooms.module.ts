import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from './entities/class.entity';
import { ClassMemberEntity } from './entities/class-member.entity';
import { ClassAssignmentEntity } from './entities/class-assignment.entity';
import { AssignmentSubmissionEntity } from './entities/assignment-submission.entity';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomsService } from './classrooms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassEntity,
      ClassMemberEntity,
      ClassAssignmentEntity,
      AssignmentSubmissionEntity,
    ]),
  ],
  controllers: [ClassroomsController],
  providers: [ClassroomsService],
  exports: [ClassroomsService],
})
export class ClassroomsModule { }
