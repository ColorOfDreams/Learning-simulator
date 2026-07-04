import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { ModerationStatus } from '../question-bank/question-bank.entity';
import { AdminService } from './admin.service';
import { RailwayMetricsService } from './railway-metrics.service';
import { CreateAdminUserDto, UpdateLockDto, UpdateUserRoleDto } from './dto/admin-users.dto';
import { ReassignTeacherDto, UpdateClassLockDto } from './dto/admin-classes.dto';
import { AssignSimSubjectDto, PublishSimDto } from './dto/admin-content.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly railwayMetricsService: RailwayMetricsService,
  ) {}

  @Get('stats/overview')
  getOverviewStats(@Query('range') range?: 'day' | 'week' | 'month') {
    return this.adminService.getOverviewStats(range);
  }

  @Get('stats/railway-metrics')
  getRailwayMetrics(@Query('range') range?: '1h' | '6h' | '1d' | '7d' | '30d') {
    return this.railwayMetricsService.getBackendMetrics(range);
  }

  // ── Users ──

  @Get('users')
  listUsers(
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.listUsers({
      search,
      role,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('users')
  createUser(@Body() dto: CreateAdminUserDto) {
    return this.adminService.createUser(dto);
  }

  @Put('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Put('users/:id/lock')
  setUserLocked(@Param('id') id: string, @Body() dto: UpdateLockDto) {
    return this.adminService.setUserLocked(id, dto.isLocked);
  }

  @Post('users/:id/reset-password')
  resetUserPassword(@Param('id') id: string) {
    return this.adminService.resetUserPassword(id);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('users/import')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  importUsers(@UploadedFile() file: { buffer: Buffer }) {
    return this.adminService.importUsersFromExcel(file.buffer);
  }

  // ── Classes ──

  @Get('classes')
  listClasses(@Query('search') search?: string, @Query('teacherId') teacherId?: string) {
    return this.adminService.listClasses({ search, teacherId });
  }

  @Put('classes/:id/teacher')
  reassignClassTeacher(@Param('id') id: string, @Body() dto: ReassignTeacherDto) {
    return this.adminService.reassignClassTeacher(id, dto.teacherId);
  }

  @Put('classes/:id/lock')
  setClassLocked(@Param('id') id: string, @Body() dto: UpdateClassLockDto) {
    return this.adminService.setClassLocked(id, dto.isLocked);
  }

  @Delete('classes/:id')
  deleteClass(@Param('id') id: string) {
    return this.adminService.deleteClass(id);
  }

  // ── Content: sims ──

  @Get('content/sims')
  listSims() {
    return this.adminService.listSims();
  }

  @Put('content/sims/:id/publish')
  setSimPublished(@Param('id') id: string, @Body() dto: PublishSimDto) {
    return this.adminService.setSimPublished(id, dto.published);
  }

  @Put('content/sims/:id/subject')
  assignSimSubject(@Param('id') id: string, @Body() dto: AssignSimSubjectDto) {
    return this.adminService.assignSimSubject(id, dto.roomType);
  }

  // ── Content: questions ──

  @Get('content/questions')
  listQuestions(@Query('status') status?: ModerationStatus, @Query('subject') subject?: string) {
    return this.adminService.listQuestions({ status, subject });
  }

  @Put('content/questions/:id/approve')
  approveQuestion(@Param('id') id: string) {
    return this.adminService.setQuestionStatus(id, ModerationStatus.APPROVED);
  }

  @Put('content/questions/:id/reject')
  rejectQuestion(@Param('id') id: string) {
    return this.adminService.setQuestionStatus(id, ModerationStatus.REJECTED);
  }

  // ── Content: exams ──

  @Get('content/exams')
  listExams(@Query('status') status?: ModerationStatus, @Query('subject') subject?: string) {
    return this.adminService.listExams({ status, subject });
  }

  @Put('content/exams/:id/approve')
  approveExam(@Param('id') id: string) {
    return this.adminService.setExamStatus(id, ModerationStatus.APPROVED);
  }

  @Put('content/exams/:id/reject')
  rejectExam(@Param('id') id: string) {
    return this.adminService.setExamStatus(id, ModerationStatus.REJECTED);
  }
}
