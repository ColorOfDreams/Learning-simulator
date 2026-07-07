import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type DeepPartial } from 'typeorm';
import type { Request } from 'express';
import { BaseController } from '../../core/base/base.controller';
import { UserEntity, UserRole } from './entities/user.entity';
import { UserLabSessionEntity } from './entities/user-lab-session.entity';
import { UsersService } from './users.service';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

class CompleteActivityDto {
  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(0)
  xpEarned!: number;
}

class UpdateMeDto {
  @ApiProperty({ required: false, example: 'Nguyễn Văn' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ required: false, example: 'An' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ required: false, example: 'Học sinh yêu thích Vật lý.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
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

  @ApiProperty({ example: 372, required: false, description: 'Thời lượng làm bài (giây)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationSeconds?: number;
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

// Chuẩn hoá một giá trị ngày (Date | string | null) về chuỗi lịch 'YYYY-MM-DD'.
// Cột lastActiveDate là kiểu `date` (chỉ ngày), driver có thể trả về string
// 'YYYY-MM-DD' hoặc Date — xử lý cả hai để tránh lệch timezone.
function toYMD(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  if (typeof d === 'string') return d.slice(0, 10);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Số ngày lịch giữa 2 chuỗi 'YYYY-MM-DD' (so theo Date.UTC để không dính timezone).
function daysBetweenYMD(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round(
    (Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000,
  );
}

// Tính streak theo NGÀY DÙNG APP (robust timezone):
//  - cùng ngày (diff 0) → giữ nguyên
//  - cách đúng 1 ngày → +1
//  - cách ≥2 ngày hoặc chưa có mốc → reset về 1
function computeStreakUpdate(
  lastActiveDate: Date | string | null | undefined,
  currentStreak: number,
  currentMaxStreak: number,
): { streak: number; maxStreak: number; todayYMD: string } {
  const now = new Date();
  const todayYMD = toYMD(now) as string;
  const lastYMD = toYMD(lastActiveDate);

  let streak = 1;
  if (lastYMD) {
    const diff = daysBetweenYMD(lastYMD, todayYMD);
    if (diff === 0) streak = currentStreak || 1;
    else if (diff === 1) streak = (currentStreak || 0) + 1;
    else streak = 1; // bỏ lỡ ≥2 ngày → reset
  }
  const maxStreak = Math.max(currentMaxStreak ?? 0, streak);
  return { streak, maxStreak, todayYMD };
}

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
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

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tự cập nhật hồ sơ (tên, giới thiệu)' })
  async updateMe(@Req() req: Request, @Body() dto: UpdateMeDto) {
    const user = req.user as UserEntity;
    const patch: Partial<UserEntity> = {};
    if (dto.firstName !== undefined) patch.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) patch.lastName = dto.lastName.trim();
    if (dto.bio !== undefined) patch.bio = dto.bio.trim();
    if (Object.keys(patch).length > 0) {
      await this.usersService.update(user.id, patch);
    }
    // Trả về user tươi để frontend cập nhật currentUser ngay.
    return this.usersService.findById(user.id);
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
  async completeActivity(
    @Req() req: Request,
    @Body() dto: CompleteActivityDto,
  ) {
    const user = req.user as UserEntity;
    const fresh = await this.usersService.findById(user.id);
    const currentXp = fresh?.xp ?? 0;

    const newXp = currentXp + dto.xpEarned;
    const newLevel = calcLevel(newXp);

    // Hoàn thành hoạt động cũng tính là 1 ngày dùng app → dùng chung logic streak.
    const { streak, maxStreak, todayYMD } = computeStreakUpdate(
      fresh?.lastActiveDate,
      fresh?.streak ?? 0,
      fresh?.maxStreak ?? 0,
    );

    await this.usersService.update(user.id, {
      xp: newXp,
      level: newLevel,
      streak,
      maxStreak,
      lastActiveDate: todayYMD as any,
    });

    return {
      xp: newXp,
      level: newLevel,
      streak,
      maxStreak,
      levelTitle: getLevelTitle(newLevel),
    };
  }

  @Post('me/touch')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ghi nhận ngày dùng app (cập nhật streak, không cộng XP)',
  })
  async touch(@Req() req: Request) {
    const user = req.user as UserEntity;
    const fresh = await this.usersService.findById(user.id);

    const { streak, maxStreak, todayYMD } = computeStreakUpdate(
      fresh?.lastActiveDate,
      fresh?.streak ?? 0,
      fresh?.maxStreak ?? 0,
    );

    await this.usersService.update(user.id, {
      streak,
      maxStreak,
      lastActiveDate: todayYMD as any,
    });

    // Trả về user tươi (đã cập nhật streak) để frontend merge vào currentUser.
    return {
      ...(fresh ?? {}),
      streak,
      maxStreak,
      lastActiveDate: todayYMD,
      levelTitle: getLevelTitle(fresh?.level ?? 1),
    };
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
    return students.map(({ id, firstName, lastName, xp, level, picture }) => ({
      id,
      firstName,
      lastName,
      xp,
      level,
      picture,
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
      existing.simulationTitle =
        dto.simulationTitle ?? existing.simulationTitle;
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
    const now = new Date();
    if (existing) {
      // Ưu tiên durationSeconds client gửi; nếu không có thì tự tính từ lúc
      // mở session (createdAt) tới lúc hoàn thành.
      const duration =
        dto.durationSeconds ??
        Math.max(
          0,
          Math.round((now.getTime() - new Date(existing.createdAt).getTime()) / 1000),
        );
      await this.labRepo.update(existing.id, {
        status: 'completed',
        score: dto.score,
        totalQuestions: dto.totalQuestions,
        correctAnswers: dto.correctAnswers,
        durationSeconds: duration,
        completedAt: now,
      } as any);
      return { ...existing, status: 'completed', score: dto.score, durationSeconds: duration };
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
      durationSeconds: dto.durationSeconds ?? 0,
      completedAt: now,
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
      const hasCompleted = simSessions.some((s) => s.status === 'completed');
      if (hasCompleted) {
        const best = simSessions
          .filter((s) => s.status === 'completed')
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
        completed.push(best);
      } else {
        inProgress.push(simSessions[0]);
      }
    }

    return { inProgress, completed };
  }

  // ── Các route CRUD chung kế thừa từ BaseController thao tác trực tiếp
  // trên toàn bộ user (liệt kê/tạo/sửa/xóa bất kỳ ai) chỉ dành cho admin.
  // Override lại để gắn thêm RolesGuard mà không ảnh hưởng tới các route
  // /me phía trên (guard cộng dồn theo method, không theo class).

  @Get('page')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPage(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() query: any,
  ) {
    return super.getPage(page, limit, query);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAll(@Query() query: any) {
    return super.getAll(query);
  }

  @Get('one')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getOne(@Query('condition') condition: any) {
    return super.getOne(condition);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getById(@Param('id') id: string) {
    return super.getById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createDto: DeepPartial<UserEntity>) {
    return super.create(createDto);
  }

  @Put('many')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateMany(
    @Body('ids') ids: string[],
    @Body('payload') updateDto: DeepPartial<UserEntity>,
  ) {
    return super.updateMany(ids, updateDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: DeepPartial<UserEntity>) {
    return super.update(id, updateDto);
  }

  @Delete('many')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteMany(@Body('ids') ids: string[]) {
    await super.deleteMany(ids);
    return { deletedCount: ids.length };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    await super.delete(id);
    return true;
  }
}
