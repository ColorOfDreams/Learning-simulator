import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from './entities/class.entity';
import {
  ClassMemberEntity,
  ClassMemberStatus,
} from './entities/class-member.entity';
import { ClassAssignmentEntity } from './entities/class-assignment.entity';
import {
  AssignmentSubmissionEntity,
  SubmissionStatus,
} from './entities/assignment-submission.entity';
import {
  CreateClassDto,
  JoinClassDto,
  UpdateMemberStatusDto,
  CreateAssignmentDto,
  SubmitAssignmentDto,
} from './dto/classrooms.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    @InjectRepository(ClassMemberEntity)
    private readonly memberRepo: Repository<ClassMemberEntity>,
    @InjectRepository(ClassAssignmentEntity)
    private readonly assignmentRepo: Repository<ClassAssignmentEntity>,
    @InjectRepository(AssignmentSubmissionEntity)
    private readonly submissionRepo: Repository<AssignmentSubmissionEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async generateInviteCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const exists = await this.classRepo.findOne({
      where: { inviteCode: code },
    });
    if (exists) return this.generateInviteCode();
    return code;
  }

  async createClass(teacherId: string, dto: CreateClassDto) {
    const inviteCode = await this.generateInviteCode();
    const newClass = this.classRepo.create({
      ...dto,
      teacherId,
      inviteCode,
    });
    return this.classRepo.save(newClass);
  }

  async getTeacherClasses(teacherId: string) {
    return this.classRepo.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
      relations: { members: true, assignments: true },
    });
  }

  async getClassById(id: string) {
    const cls = await this.classRepo.findOne({
      where: { id },
      relations: {
        members: true,
        assignments: {
          submissions: true,
        },
      },
    });
    if (!cls) throw new NotFoundException('Không tìm thấy lớp học');
    return cls;
  }

  async deleteClass(id: string, teacherId: string) {
    const cls = await this.classRepo.findOne({
      where: { id, teacherId },
    });
    if (!cls) {
      throw new NotFoundException('Không tìm thấy lớp học hoặc bạn không có quyền xóa');
    }
    return this.classRepo.remove(cls);
  }

  async joinClass(userId: string | undefined, dto: JoinClassDto) {
    const cls = await this.classRepo.findOne({
      where: { inviteCode: dto.inviteCode },
    });
    if (!cls) throw new NotFoundException('Mã mời không hợp lệ');

    const existingMember = await this.memberRepo.findOne({
      where: { classId: cls.id, studentCode: dto.studentCode },
    });
    if (existingMember) {
      throw new BadRequestException(
        'Học sinh với mã này đã xin vào lớp hoặc đang trong lớp',
      );
    }

    const member = this.memberRepo.create({
      classId: cls.id,
      userId,
      studentName: dto.studentName,
      studentCode: dto.studentCode,
      status: ClassMemberStatus.PENDING,
    });
    const savedMember = await this.memberRepo.save(member);

    // Notify teacher
    await this.notificationsService.createNotification(
      cls.teacherId,
      'Yêu cầu tham gia lớp',
      `Học sinh ${dto.studentName} (${dto.studentCode}) xin tham gia lớp ${cls.name}`,
      'CLASS_INVITE',
      { classId: cls.id, memberId: savedMember.id }
    );

    return savedMember;
  }

  async updateMemberStatus(
    classId: string,
    memberId: string,
    dto: UpdateMemberStatusDto,
  ) {
    const member = await this.memberRepo.findOne({
      where: { id: memberId, classId },
    });
    if (!member) throw new NotFoundException('Thành viên không tồn tại');

    member.status = dto.status as ClassMemberStatus;
    if (member.status === ClassMemberStatus.APPROVED) {
      member.joinedAt = new Date();
    }
    const savedMember = await this.memberRepo.save(member);

    // Notify student if they were approved
    if (member.status === ClassMemberStatus.APPROVED && member.userId) {
      const cls = await this.classRepo.findOne({ where: { id: classId } });
      await this.notificationsService.createNotification(
        member.userId,
        'Yêu cầu được duyệt',
        `Giáo viên đã duyệt yêu cầu tham gia lớp ${cls?.name} của bạn`,
        'CLASS_APPROVED',
        { classId: classId }
      );
    }

    return savedMember;
  }

  async createAssignment(classId: string, dto: CreateAssignmentDto) {
    const assignment = this.assignmentRepo.create({
      ...dto,
      classId,
    });
    const savedAssignment = await this.assignmentRepo.save(assignment);

    // Notify all approved students in the class
    const members = await this.memberRepo.find({
      where: { classId, status: ClassMemberStatus.APPROVED },
    });
    const cls = await this.classRepo.findOne({ where: { id: classId } });
    
    for (const member of members) {
      if (member.userId) {
        await this.notificationsService.createNotification(
          member.userId,
          'Bài tập mới',
          `Giáo viên vừa giao bài tập: ${dto.title} trong lớp ${cls?.name}`,
          'ASSIGNMENT_NEW',
          { classId, assignmentId: savedAssignment.id }
        );
      }
    }

    return savedAssignment;
  }

  async submitAssignment(assignmentId: string, dto: SubmitAssignmentDto) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
    });
    if (!assignment) throw new NotFoundException('Bài tập không tồn tại');

    const existing = await this.submissionRepo.findOne({
      where: { assignmentId, memberId: dto.memberId },
    });
    if (existing) {
      existing.score = dto.score;
      existing.submittedAt = new Date();
      return this.submissionRepo.save(existing);
    }

    const submission = this.submissionRepo.create({
      assignmentId,
      memberId: dto.memberId,
      score: dto.score,
      status: SubmissionStatus.SUBMITTED,
    });
    return this.submissionRepo.save(submission);
  }

  async getStudentClasses(userId: string) {
    const members = await this.memberRepo.find({
      where: { userId },
      relations: {
        classDetails: { assignments: true, teacher: true }
      },
    });
    return members
      .filter((m) => m.classDetails != null)
      .map((m) => {
        const cls = m.classDetails;
        delete (m as any).classDetails; // Break circular reference for JSON serialization
        cls.members = [m];
        return cls;
      });
  }
}
