import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { UserEntity, UserRole } from './entities/user.entity';
import { UserLabSessionEntity } from './entities/user-lab-session.entity';
import * as bcrypt from 'bcryptjs';

const STUDENTS: Partial<UserEntity>[] = [
  {
    email: 'nguyen.thi.lan@student.edu.vn',
    firstName: 'Thị Lan',
    lastName: 'Nguyễn',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lan',
    grade: 11,
    xp: 4200,
    level: 8,
    streak: 14,
    maxStreak: 21,
    lastActiveDate: new Date(),
  },
  {
    email: 'tran.van.minh@student.edu.vn',
    firstName: 'Văn Minh',
    lastName: 'Trần',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh',
    grade: 12,
    xp: 3100,
    level: 6,
    streak: 7,
    maxStreak: 15,
    lastActiveDate: new Date(),
  },
  {
    email: 'le.thi.hoa@student.edu.vn',
    firstName: 'Thị Hoa',
    lastName: 'Lê',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hoa',
    grade: 10,
    xp: 2800,
    level: 6,
    streak: 5,
    maxStreak: 12,
    lastActiveDate: new Date(),
  },
  {
    email: 'pham.van.duc@student.edu.vn',
    firstName: 'Văn Đức',
    lastName: 'Phạm',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc',
    grade: 11,
    xp: 2200,
    level: 5,
    streak: 3,
    maxStreak: 10,
    lastActiveDate: new Date(Date.now() - 86400000),
  },
  {
    email: 'hoang.thi.mai@student.edu.vn',
    firstName: 'Thị Mai',
    lastName: 'Hoàng',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai',
    grade: 12,
    xp: 1800,
    level: 4,
    streak: 9,
    maxStreak: 9,
    lastActiveDate: new Date(),
  },
  {
    email: 'ngo.van.tung@student.edu.vn',
    firstName: 'Văn Tùng',
    lastName: 'Ngô',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tung',
    grade: 10,
    xp: 1400,
    level: 4,
    streak: 0,
    maxStreak: 7,
    lastActiveDate: new Date(Date.now() - 3 * 86400000),
  },
  {
    email: 'vu.thi.thu@student.edu.vn',
    firstName: 'Thị Thu',
    lastName: 'Vũ',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thu',
    grade: 11,
    xp: 950,
    level: 3,
    streak: 2,
    maxStreak: 6,
    lastActiveDate: new Date(),
  },
  {
    email: 'dang.van.hung@student.edu.vn',
    firstName: 'Văn Hùng',
    lastName: 'Đặng',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hung',
    grade: 12,
    xp: 700,
    level: 3,
    streak: 1,
    maxStreak: 4,
    lastActiveDate: new Date(Date.now() - 86400000),
  },
  {
    email: 'bui.thi.ngoc@student.edu.vn',
    firstName: 'Thị Ngọc',
    lastName: 'Bùi',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ngoc',
    grade: 10,
    xp: 350,
    level: 2,
    streak: 0,
    maxStreak: 3,
    lastActiveDate: new Date(Date.now() - 5 * 86400000),
  },
  {
    email: 'duong.van.nam@student.edu.vn',
    firstName: 'Văn Nam',
    lastName: 'Dương',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nam',
    grade: 11,
    xp: 120,
    level: 1,
    streak: 0,
    maxStreak: 1,
    lastActiveDate: new Date(Date.now() - 7 * 86400000),
  },
];

const LAB_SESSIONS = [
  {
    simulationId: 'acid-base_3D',
    simulationTitle: 'Phản ứng Axit - Bazơ',
    subject: 'chem',
    score: 92,
    totalQuestions: 5,
    correctAnswers: 5,
  },
  {
    simulationId: 'spring_3D',
    simulationTitle: 'Con lắc lò xo',
    subject: 'phys',
    score: 80,
    totalQuestions: 5,
    correctAnswers: 4,
  },
  {
    simulationId: 'pendulum_3D',
    simulationTitle: 'Con lắc đơn',
    subject: 'phys',
    score: 60,
    totalQuestions: 5,
    correctAnswers: 3,
  },
  {
    simulationId: 'oxidation-reduction_3D',
    simulationTitle: 'Oxi hóa - Khử',
    subject: 'chem',
    score: 100,
    totalQuestions: 5,
    correctAnswers: 5,
  },
  {
    simulationId: 'electrolysis_3D',
    simulationTitle: 'Điện phân',
    subject: 'chem',
    score: 40,
    totalQuestions: 5,
    correctAnswers: 2,
  },
];

@Injectable()
export class UsersSeedService implements OnApplicationBootstrap {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(UserLabSessionEntity)
    private readonly labSessionRepository: Repository<UserLabSessionEntity>,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.DEMO_SEED_ON_START === 'false') return;
    await this.seedAdmin();
    await this.seedTeacher();
    await this.seedStudents();
    await this.seedOwner();
  }

  private async seedAdmin() {
    const data = { firstName: 'Admin', lastName: 'Hệ thống', role: UserRole.ADMIN };
    const existing = await this.usersService.findByEmail('admin@gmail.com');
    if (existing) {
      await this.usersService.update(existing.id, data);
      return;
    }
    const hashed = await bcrypt.hash('abc123', 10);
    await this.usersService.create({ email: 'admin@gmail.com', password: hashed, ...data });
  }

  private async seedTeacher() {
    const data = { firstName: 'Giáo viên', lastName: 'Mẫu', role: UserRole.TEACHER };
    const existing = await this.usersService.findByEmail('giaovien@gmail.com');
    if (existing) {
      await this.usersService.update(existing.id, data);
      return;
    }
    const hashed = await bcrypt.hash('abc123', 10);
    await this.usersService.create({ email: 'giaovien@gmail.com', password: hashed, ...data });
  }

  private async seedOwner() {
    const existing = await this.usersService.findByEmail(
      'vanhung71388@gmail.com',
    );
    if (!existing) return;
    await this.usersService.update(existing.id, {
      xp: 3800,
      level: 7,
      streak: 10,
      maxStreak: 18,
      lastActiveDate: new Date(),
    });
    await this.seedLabSessions(existing.id);
  }

  private async seedStudents() {
    const hashed = await bcrypt.hash('abc123', 10);

    for (const data of STUDENTS) {
      const existing = await this.usersService.findByEmail(data.email!);
      if (existing) {
        await this.usersService.update(existing.id, {
          xp: data.xp,
          level: data.level,
          streak: data.streak,
          maxStreak: data.maxStreak,
          lastActiveDate: data.lastActiveDate,
          picture: data.picture,
        });
        await this.seedLabSessions(existing.id);
        continue;
      }

      const user = await this.usersService.create({
        ...data,
        password: hashed,
        role: UserRole.STUDENT,
      });
      await this.seedLabSessions(user.id);
    }
  }

  private async seedLabSessions(userId: string) {
    const existing = await this.labSessionRepository.count({
      where: { userId },
    });
    if (existing > 0) return;

    const sessions = LAB_SESSIONS.slice(0, 2 + Math.floor(Math.random() * 4));
    for (const s of sessions) {
      const session = this.labSessionRepository.create({
        userId,
        simulationId: s.simulationId,
        simulationTitle: s.simulationTitle,
        subject: s.subject,
        status: 'completed',
        score: s.score,
        totalQuestions: s.totalQuestions,
        correctAnswers: s.correctAnswers,
        completedAt: new Date(
          Date.now() - Math.floor(Math.random() * 7) * 86400000,
        ),
      });
      await this.labSessionRepository.save(session);
    }
  }
}
