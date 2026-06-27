import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { BaseController } from '../../core/base/base.controller';
import { UserEntity, UserRole } from './entities/user.entity';
import { UserLabSessionEntity } from './entities/user-lab-session.entity';
import { UsersService } from './users.service';

class CompleteActivityDto {
  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(0)
  xpEarned!: number;
}

class OpenLabDto {
  @ApiProperty({ example: 'SIM-01' })
  @IsString()
  simulationId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  simulationTitle?: string;

  @ApiProperty({ example: 'chem' })
  @IsString()
  subject!: string;
}

class CompleteLabDto {
  @ApiProperty({ example: 'SIM-01' })
  @IsString()
  simulationId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  simulationTitle?: string;

  @ApiProperty({ example: 'chem' })
  @IsString()
  subject!: string;

  @ApiProperty({ example: 80 })
  @IsNumber()
  score!: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  totalQuestions!: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  correctAnswers!: number;
}

function getLevelTitle(level: number): string {
  if (level <= 3) return 'Học sinh mới';
  if (level <= 6) return 'Nhà thí nghiệm';
  if (level <= 10) return 'Nhà khoa học tập sự';
  return 'Nhà khoa học';
}

function calcLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

@ApiTags('users')
@Controller('users')
export class UsersController extends BaseController<UserEntity> {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(UserLabSessionEntity)
    private readonly labRepo: Repository<UserLabSessionEntity>,
  ) {
    super(usersService);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  getMe(@Req() req: Request): UserEntity {
    return req.user as UserEntity;
  }

  @Get('me/stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy stats gamification của học sinh' })
  async getMeStats(@Req() req: Request) {
    const user = req.user as UserEntity;
    const fresh = await this.usersService.findById(user.id);
    const level = fresh?.level ?? 1;
    const xp = fresh?.xp ?? 0;
    const nextThreshold = level * level * 100;
    return {
      ...fresh,
      levelTitle: getLevelTitle(level),
      xpToNextLevel: Math.max(0, nextThreshold - xp),
      nextThreshold,
      maxStreak: fresh?.maxStreak ?? 0,
    };
  }

  @Post('me/complete-activity')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ghi nhận hoàn thành hoạt động và tích XP' })
  async completeActivity(@Req() req: Request, @Body() dto: CompleteActivityDto) {
    const user = req.user as UserEntity;
    const fresh = await this.usersService.findById(user.id);
    const currentXp = fresh?.xp ?? 0;
    const currentStreak = fresh?.streak ?? 0;
    const lastActiveDate = fresh?.lastActiveDate;

    const newXp = currentXp + dto.xpEarned;
    const newLevel = calcLevel(newXp);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let newStreak = 1;
    if (lastActiveDate) {
      const last = new Date(lastActiveDate);
      last.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - last.getTime()) / 86400000);
      if (diffDays === 0) newStreak = currentStreak;
      else if (diffDays === 1) newStreak = currentStreak + 1;
    }

    const maxStreak = Math.max(fresh?.maxStreak ?? 0, newStreak);

    await this.usersService.update(user.id, {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      maxStreak,
      lastActiveDate: today,
    } as any);

    return { xp: newXp, level: newLevel, streak: newStreak, maxStreak, levelTitle: getLevelTitle(newLevel) };
  }

  @Get('leaderboard')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bảng xếp hạng học sinh theo XP' })
  async getLeaderboard(@Query('limit') limit = 10) {
    const students = await this.usersService.findAll({
      where: { role: UserRole.STUDENT },
      order: { xp: 'DESC' } as any,
      take: Number(limit),
    } as any);
    return (students as UserEntity[]).map(({ id, firstName, lastName, xp, level, picture }) => ({
      id, firstName, lastName, xp, level, picture,
    }));
  }

  @Post('me/labs/open')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ghi nhận học sinh mở lab (in_progress)' })
  async openLab(@Req() req: Request, @Body() dto: OpenLabDto) {
    const userId = (req.user as UserEntity).id;
    const existing = await this.labRepo.findOne({
      where: { userId, simulationId: dto.simulationId, status: 'in_progress' },
      order: { updatedAt: 'DESC' },
    });
    if (existing) {
      existing.simulationTitle = dto.simulationTitle ?? existing.simulationTitle;
      return this.labRepo.save(existing);
    }
    const session = this.labRepo.create({
      userId,
      simulationId: dto.simulationId,
      simulationTitle: dto.simulationTitle,
      subject: dto.subject,
      status: 'in_progress',
    });
    return this.labRepo.save(session);
  }

  @Post('me/labs/complete')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ghi nhận học sinh hoàn thành lab với điểm' })
  async completeLab(@Req() req: Request, @Body() dto: CompleteLabDto) {
    const userId = (req.user as UserEntity).id;
    const existing = await this.labRepo.findOne({
      where: { userId, simulationId: dto.simulationId, status: 'in_progress' },
      order: { updatedAt: 'DESC' },
    });
    if (existing) {
      await this.labRepo.update(existing.id, {
        status: 'completed',
        score: dto.score,
        totalQuestions: dto.totalQuestions,
        correctAnswers: dto.correctAnswers,
        completedAt: new Date(),
      } as any);
      return { ...existing, status: 'completed', score: dto.score };
    }
    const session = this.labRepo.create({
      userId,
      simulationId: dto.simulationId,
      simulationTitle: dto.simulationTitle,
      subject: dto.subject,
      status: 'completed',
      score: dto.score,
      totalQuestions: dto.totalQuestions,
      correctAnswers: dto.correctAnswers,
      completedAt: new Date(),
    });
    return this.labRepo.save(session);
  }

  @Get('me/labs')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách labs của học sinh' })
  async getMyLabs(@Req() req: Request) {
    const userId = (req.user as UserEntity).id;
    const sessions = await this.labRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    const bySimId: Record<string, UserLabSessionEntity[]> = {};
    for (const s of sessions) {
      if (!bySimId[s.simulationId]) bySimId[s.simulationId] = [];
      bySimId[s.simulationId].push(s);
    }

    const inProgress: UserLabSessionEntity[] = [];
    const completed: UserLabSessionEntity[] = [];

    for (const simSessions of Object.values(bySimId)) {
      const hasCompleted = simSessions.some(s => s.status === 'completed');
      if (hasCompleted) {
        const best = simSessions
          .filter(s => s.status === 'completed')
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
        completed.push(best);
      } else {
        inProgress.push(simSessions[0]);
      }
    }

    return { inProgress, completed };
  }
}
