import { Controller, Get, Param, Query, Req, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import {
  PeriodQueryDto,
  CompletionQueryDto,
  MonthsQueryDto,
  LimitQueryDto,
  ExportQueryDto,
} from './dto/analytics.dto';

@ApiTags('Analytics')
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ─── DASHBOARD TỔNG QUAN ──────────────────────────────

  @Get('analytics/teacher/overview')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard tổng quan cho giáo viên' })
  getTeacherOverview(@Req() req: any) {
    return this.analyticsService.getTeacherOverview(req.user.id);
  }

  @Get('analytics/teacher/class-comparison')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'So sánh điểm TB và tỉ lệ nộp bài giữa các lớp' })
  getClassComparison(@Req() req: any) {
    return this.analyticsService.getClassComparison(req.user.id);
  }

  @Get('analytics/teacher/monthly-trends')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xu hướng theo tháng (số bài nộp, học sinh mới)' })
  getMonthlyTrends(@Req() req: any, @Query() query: MonthsQueryDto) {
    return this.analyticsService.getMonthlyTrends(req.user.id, query.months);
  }

  @Get('analytics/teacher/top-students')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Top học sinh có điểm TB cao nhất' })
  getTopStudents(@Req() req: any, @Query() query: LimitQueryDto) {
    return this.analyticsService.getTopStudents(req.user.id, query.limit);
  }

  @Get('analytics/teacher/recent-activity')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hoạt động nộp bài gần đây' })
  getRecentActivity(@Req() req: any, @Query() query: LimitQueryDto) {
    return this.analyticsService.getRecentActivity(req.user.id, query.limit);
  }

  @Get('analytics/teacher/subject-breakdown')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Phân bố bài tập theo môn học' })
  getSubjectBreakdown(@Req() req: any) {
    return this.analyticsService.getSubjectBreakdown(req.user.id);
  }

  // ─── PER-CLASS ANALYTICS ──────────────────────────────

  @Get('classrooms/:id/analytics/overview')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tổng quan thống kê của một lớp' })
  getClassOverview(@Param('id') classId: string) {
    return this.analyticsService.getClassOverview(classId);
  }

  @Get('classrooms/:id/analytics/completion')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tỉ lệ hoàn thành bài tập trong lớp' })
  getClassCompletion(
    @Param('id') classId: string,
    @Query() query: CompletionQueryDto,
  ) {
    return this.analyticsService.getClassCompletion(
      classId,
      query.assignmentId,
      query.period,
    );
  }

  @Get('classrooms/:id/analytics/score-distribution')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Phân bố điểm số của lớp' })
  getScoreDistribution(@Param('id') classId: string) {
    return this.analyticsService.getScoreDistribution(classId);
  }

  @Get('classrooms/:id/analytics/timeline')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tiến độ nộp bài theo tuần/tháng' })
  getClassTimeline(
    @Param('id') classId: string,
    @Query() query: PeriodQueryDto,
  ) {
    return this.analyticsService.getClassTimeline(classId, query.period);
  }

  @Get('classrooms/:id/analytics/student-ranking')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xếp hạng học sinh trong lớp' })
  getStudentRanking(@Param('id') classId: string) {
    return this.analyticsService.getStudentRanking(classId);
  }

  @Get('classrooms/:id/analytics/per-assignment')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Phân tích chi tiết từng bài tập' })
  getPerAssignmentAnalysis(@Param('id') classId: string) {
    return this.analyticsService.getPerAssignmentAnalysis(classId);
  }

  @Get('classrooms/:id/analytics/student-detail')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bảng chi tiết từng học sinh' })
  getStudentDetail(@Param('id') classId: string) {
    return this.analyticsService.getStudentDetail(classId);
  }

  // ─── EXCEL EXPORT ──────────────────────────────────────

  @Get('classrooms/:id/analytics/student-detail/export/xlsx')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xuất Excel bảng chi tiết học sinh' })
  async exportStudentDetailXlsx(@Param('id') classId: string, @Res() res: Response) {
    const buffer = await this.analyticsService.exportStudentDetailToXlsx(classId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="hoc-sinh-${classId.slice(0, 8)}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get('classrooms/:id/analytics/student-ranking/export/xlsx')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xuất Excel bảng xếp hạng học sinh' })
  async exportStudentRankingXlsx(@Param('id') classId: string, @Res() res: Response) {
    const buffer = await this.analyticsService.exportStudentRankingToXlsx(classId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="xep-hang-${classId.slice(0, 8)}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get('analytics/teacher/recent-activity/export/xlsx')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xuất Excel hoạt động gần đây' })
  async exportActivityXlsx(@Req() req: any, @Res() res: Response) {
    const buffer = await this.analyticsService.exportActivityToXlsx(req.user.id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="hoat-dong-gan-day.xlsx"`,
    });
    res.send(buffer);
  }
}
