import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as ExcelJS from 'exceljs';
import * as crypto from 'crypto';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { UserLabSessionEntity } from '../users/entities/user-lab-session.entity';
import { ClassEntity } from '../classrooms/entities/class.entity';
import { ExamEntity } from '../exams/exam.entity';
import { QuestionEntity, ModerationStatus } from '../question-bank/question-bank.entity';
import { SceneEntity } from '../scene/scene.entity';
import { ActivityService } from '../activity/activity.service';
import { AiUsageService } from '../ai/ai-usage.service';

function sanitizeUser(user: UserEntity): Omit<UserEntity, 'password'> {
  const { password: _password, ...rest } = user;
  return rest;
}

function rangeToDates(range: 'day' | 'week' | 'month' = 'day') {
  const to = new Date().toISOString().slice(0, 10);
  const days = range === 'month' ? 30 : range === 'week' ? 7 : 1;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - (days - 1));
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserLabSessionEntity)
    private readonly labRepo: Repository<UserLabSessionEntity>,
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    @InjectRepository(ExamEntity)
    private readonly examRepo: Repository<ExamEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionRepo: Repository<QuestionEntity>,
    @InjectRepository(SceneEntity)
    private readonly sceneRepo: Repository<SceneEntity>,
    private readonly activityService: ActivityService,
    private readonly aiUsageService: AiUsageService,
  ) {}

  // ── Stats ──

  async getOverviewStats(range: 'day' | 'week' | 'month' = 'day') {
    const { from, to } = rangeToDates(range);

    const [
      totalAdmins,
      totalTeachers,
      totalStudents,
      totalClasses,
      totalExams,
      totalQuestions,
      totalScenes,
      labCompletions,
      dauTrend,
      systemVisits,
      aiTotals,
      aiCostTrend,
    ] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.ADMIN } }),
      this.userRepo.count({ where: { role: UserRole.TEACHER } }),
      this.userRepo.count({ where: { role: UserRole.STUDENT } }),
      this.classRepo.count(),
      this.examRepo.count(),
      this.questionRepo.count(),
      this.sceneRepo.count(),
      this.labRepo.count({ where: { status: 'completed' } }),
      this.activityService.dailyTrend(14),
      this.activityService.countRowsBetween(from, to),
      this.aiUsageService.totalsBetween(from, to),
      this.aiUsageService.dailyCostTrend(14),
    ]);

    return {
      users: {
        admin: totalAdmins,
        teacher: totalTeachers,
        student: totalStudents,
        total: totalAdmins + totalTeachers + totalStudents,
      },
      totalClasses,
      totalExams,
      totalQuestions,
      totalScenes,
      labCompletions,
      systemVisits,
      dauTrend,
      aiCalls: aiTotals.calls,
      aiCostUsd: aiTotals.totalCostUsd,
      aiCostTrend,
      range,
    };
  }

  // ── Users ──

  async listUsers(params: { search?: string; role?: UserRole; page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const where: any = {};
    if (params.role) where.role = params.role;
    if (params.search) where.email = Like(`%${params.search}%`);
    const [result, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { result: result.map(sanitizeUser), total, page, limit };
  }

  async createUser(dto: {
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    password: string;
  }) {
    const user = this.userRepo.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      password: await bcrypt.hash(dto.password, 10),
    });
    return sanitizeUser(await this.userRepo.save(user));
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await this.findUserOrFail(id);
    user.role = role;
    return sanitizeUser(await this.userRepo.save(user));
  }

  async setUserLocked(id: string, isLocked: boolean) {
    const user = await this.findUserOrFail(id);
    user.isLocked = isLocked;
    return sanitizeUser(await this.userRepo.save(user));
  }

  async resetUserPassword(id: string): Promise<{ tempPassword: string }> {
    const user = await this.findUserOrFail(id);
    const tempPassword = crypto.randomBytes(6).toString('base64url');
    user.password = await bcrypt.hash(tempPassword, 10);
    await this.userRepo.save(user);
    return { tempPassword };
  }

  async deleteUser(id: string) {
    const user = await this.findUserOrFail(id);
    await this.userRepo.softRemove(user);
    return { success: true };
  }

  async importUsersFromExcel(buffer: Buffer): Promise<{ created: number; errors: string[] }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];
    const errors: string[] = [];
    const toCreate: Partial<UserEntity>[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // header
      const email = String(row.getCell(1).value ?? '').trim();
      const firstName = String(row.getCell(2).value ?? '').trim();
      const lastName = String(row.getCell(3).value ?? '').trim();
      const roleRaw = String(row.getCell(4).value ?? '').trim().toLowerCase();

      if (!email) {
        errors.push(`Dòng ${rowNumber}: thiếu email`);
        return;
      }
      const role = ([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] as string[]).includes(roleRaw)
        ? (roleRaw as UserRole)
        : UserRole.STUDENT;

      toCreate.push({ email, firstName, lastName, role });
    });

    const created: UserEntity[] = [];
    for (const dto of toCreate) {
      const exists = await this.userRepo.findOne({ where: { email: dto.email } });
      if (exists) {
        errors.push(`${dto.email}: email đã tồn tại, bỏ qua`);
        continue;
      }
      const tempPassword = crypto.randomBytes(6).toString('base64url');
      const entity = this.userRepo.create({
        ...dto,
        password: await bcrypt.hash(tempPassword, 10),
      });
      created.push(await this.userRepo.save(entity));
    }

    return { created: created.length, errors };
  }

  private async findUserOrFail(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  // ── Classes ──

  async listClasses(params: { search?: string; teacherId?: string }) {
    const where: any = {};
    if (params.teacherId) where.teacherId = params.teacherId;
    if (params.search) where.name = Like(`%${params.search}%`);
    const classes = await this.classRepo.find({
      where,
      relations: { teacher: true, members: true },
      order: { createdAt: 'DESC' },
    });
    return classes.map((cls) => ({
      ...cls,
      studentsCount: (cls.members ?? []).filter((m) => m.status === 'APPROVED').length,
    }));
  }

  async reassignClassTeacher(id: string, teacherId: string) {
    const cls = await this.findClassOrFail(id);
    cls.teacherId = teacherId;
    return this.classRepo.save(cls);
  }

  async setClassLocked(id: string, isLocked: boolean) {
    const cls = await this.findClassOrFail(id);
    cls.isLocked = isLocked;
    return this.classRepo.save(cls);
  }

  async deleteClass(id: string) {
    const cls = await this.findClassOrFail(id);
    await this.classRepo.softRemove(cls);
    return { success: true };
  }

  private async findClassOrFail(id: string) {
    const cls = await this.classRepo.findOne({ where: { id } });
    if (!cls) throw new NotFoundException('Không tìm thấy lớp học');
    return cls;
  }

  // ── Content: sims ──

  async listSims() {
    const scenes = await this.sceneRepo.find({ order: { createdAt: 'DESC' } });
    const playCounts = await this.labRepo
      .createQueryBuilder('l')
      .select('l.simulationId', 'simulationId')
      .addSelect('COUNT(*)', 'plays')
      .groupBy('l.simulationId')
      .getRawMany<{ simulationId: string; plays: string }>();
    const playsBySimId = new Map(playCounts.map((p) => [p.simulationId, Number(p.plays)]));

    return scenes.map((scene) => ({
      ...scene,
      plays: playsBySimId.get(scene.id) ?? 0,
    }));
  }

  async setSimPublished(id: string, published: boolean) {
    const scene = await this.findSceneOrFail(id);
    scene.published = published;
    return this.sceneRepo.save(scene);
  }

  async assignSimSubject(id: string, roomType: string) {
    const scene = await this.findSceneOrFail(id);
    scene.roomType = roomType;
    return this.sceneRepo.save(scene);
  }

  private async findSceneOrFail(id: string) {
    const scene = await this.sceneRepo.findOne({ where: { id } });
    if (!scene) throw new NotFoundException('Không tìm thấy mô phỏng');
    return scene;
  }

  // ── Content: questions ──

  async listQuestions(params: { status?: ModerationStatus; subject?: string }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.subject) where.subject = params.subject;
    return this.questionRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async setQuestionStatus(id: string, status: ModerationStatus) {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Không tìm thấy câu hỏi');
    question.status = status;
    return this.questionRepo.save(question);
  }

  // ── Content: exams ──

  async listExams(params: { status?: ModerationStatus; subject?: string }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.subject) where.subject = params.subject;
    return this.examRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async setExamStatus(id: string, status: ModerationStatus) {
    const exam = await this.examRepo.findOne({ where: { id } });
    if (!exam) throw new NotFoundException('Không tìm thấy đề thi');
    exam.status = status;
    return this.examRepo.save(exam);
  }
}
