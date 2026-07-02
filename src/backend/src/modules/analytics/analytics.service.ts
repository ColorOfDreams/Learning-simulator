import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Raw } from 'typeorm';
import { ClassEntity } from '../classrooms/entities/class.entity';
import { ClassMemberEntity, ClassMemberStatus } from '../classrooms/entities/class-member.entity';
import { ClassAssignmentEntity } from '../classrooms/entities/class-assignment.entity';
import { AssignmentSubmissionEntity } from '../classrooms/entities/assignment-submission.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UserLabSessionEntity } from '../users/entities/user-lab-session.entity';
import { AnalyticsPeriod } from './dto/analytics.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    @InjectRepository(ClassMemberEntity)
    private readonly memberRepo: Repository<ClassMemberEntity>,
    @InjectRepository(ClassAssignmentEntity)
    private readonly assignmentRepo: Repository<ClassAssignmentEntity>,
    @InjectRepository(AssignmentSubmissionEntity)
    private readonly submissionRepo: Repository<AssignmentSubmissionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserLabSessionEntity)
    private readonly labRepo: Repository<UserLabSessionEntity>,
  ) {}

  // ─── HELPER ──────────────────────────────────────────

  private getPeriodDateRange(period?: AnalyticsPeriod): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now);
    let start: Date;
    if (period === AnalyticsPeriod.WEEK) {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
    } else if (period === AnalyticsPeriod.MONTH) {
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
    } else {
      start = new Date(0);
    }
    return { start, end };
  }

  // ─── DASHBOARD TỔNG QUAN ──────────────────────────────

  async getTeacherOverview(teacherId: string) {
    const classes = await this.classRepo.find({ where: { teacherId }, relations: { members: true, assignments: { submissions: true } } });

    let totalStudents = 0;
    let totalAssignments = 0;
    let totalSubmissions = 0;
    let totalScore = 0;
    let scoreCount = 0;

    for (const cls of classes) {
      const approved = cls.members.filter(m => m.status === ClassMemberStatus.APPROVED).length;
      totalStudents += approved;
      totalAssignments += cls.assignments.length;
      for (const ass of cls.assignments) {
        for (const sub of ass.submissions) {
          totalSubmissions++;
          if (sub.score != null) { totalScore += sub.score; scoreCount++; }
        }
      }
    }

    const avgScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0;
    const completionRate = totalAssignments > 0 && totalStudents > 0
      ? Math.round((totalSubmissions / (totalAssignments * totalStudents)) * 100)
      : 0;

    return {
      totalClasses: classes.length,
      totalStudents,
      totalAssignments,
      totalSubmissions,
      avgScore,
      completionRate,
    };
  }

  async getClassComparison(teacherId: string) {
    const classes = await this.classRepo.find({ where: { teacherId }, relations: { members: true, assignments: { submissions: true } } });

    return classes.map(cls => {
      const approved = cls.members.filter(m => m.status === ClassMemberStatus.APPROVED).length;
      let totalSubmissions = 0;
      let totalScore = 0;
      let scoreCount = 0;
      for (const ass of cls.assignments) {
        for (const sub of ass.submissions) {
          totalSubmissions++;
          if (sub.score != null) { totalScore += sub.score; scoreCount++; }
        }
      }
      const avgScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0;
      const totalExpected = cls.assignments.length * approved;
      const completionRate = totalExpected > 0 ? Math.round((totalSubmissions / totalExpected) * 100) : 0;

      return {
        classId: cls.id,
        className: cls.name,
        studentCount: approved,
        assignmentCount: cls.assignments.length,
        submissionCount: totalSubmissions,
        avgScore,
        completionRate,
      };
    });
  }

  async getMonthlyTrends(teacherId: string, months = 6) {
    const now = new Date();
    const labels: string[] = [];
    const submissionData: number[] = [];
    const newStudentData: number[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = `${monthStart.getMonth() + 1}/${monthStart.getFullYear()}`;
      labels.push(label);

      const classes = await this.classRepo.find({ where: { teacherId }, select: { id: true } });
      const classIds = classes.map(c => c.id);

      if (classIds.length === 0) {
        submissionData.push(0);
        newStudentData.push(0);
        continue;
      }

      const [subCount] = await this.submissionRepo.query(
        `SELECT COUNT(*) as cnt FROM assignment_submissions sub
         JOIN class_assignments ass ON sub."assignmentId" = ass.id
         WHERE ass."classId" = ANY($1) AND sub."submittedAt" >= $2 AND sub."submittedAt" < $3`,
        [classIds, monthStart, monthEnd],
      );

      const [memberCount] = await this.memberRepo.query(
        `SELECT COUNT(*) as cnt FROM class_members
         WHERE "classId" = ANY($1) AND status = 'APPROVED' AND "joinedAt" >= $2 AND "joinedAt" < $3`,
        [classIds, monthStart, monthEnd],
      );

      submissionData.push(parseInt(subCount?.cnt || '0', 10));
      newStudentData.push(parseInt(memberCount?.cnt || '0', 10));
    }

    return { labels, submissionData, newStudentData };
  }

  async getTopStudents(teacherId: string, limit = 10) {
    const classes = await this.classRepo.find({ where: { teacherId }, select: { id: true } });
    if (classes.length === 0) return [];

    const classIds = classes.map(c => c.id);

    const rows = await this.submissionRepo.query(
      `SELECT m.id, m."studentName", m."studentCode",
              COUNT(sub.id) as submissionCount,
              AVG(sub.score) as avgScore,
              MAX(sub.score) as maxScore
       FROM assignment_submissions sub
       JOIN class_assignments ass ON sub."assignmentId" = ass.id
       JOIN class_members m ON sub."memberId" = m.id
       WHERE ass."classId" = ANY($1)
       GROUP BY m.id, m."studentName", m."studentCode"
       ORDER BY AVG(sub.score) DESC
       LIMIT $2`,
      [classIds, limit],
    );

    return rows.map((r: any) => ({
      memberId: r.id,
      studentName: r.studentName,
      studentCode: r.studentCode,
      submissionCount: parseInt(r.submissionCount, 10),
      avgScore: Math.round(parseFloat(r.avgScore) * 10) / 10,
      maxScore: r.maxScore != null ? Math.round(r.maxScore * 10) / 10 : null,
    }));
  }

  async getRecentActivity(teacherId: string, limit = 20) {
    const classes = await this.classRepo.find({ where: { teacherId }, select: { id: true } });
    if (classes.length === 0) return [];

    const classIds = classes.map(c => c.id);

    const rows = await this.submissionRepo.query(
      `SELECT sub.id, sub.score, sub."submittedAt",
              m."studentName", m."studentCode",
              ass.title as assignmentTitle, ass."simulationId",
              cls.name as className
       FROM assignment_submissions sub
       JOIN class_assignments ass ON sub."assignmentId" = ass.id
       JOIN class_members m ON sub."memberId" = m.id
       JOIN classes cls ON ass."classId" = cls.id
       WHERE ass."classId" = ANY($1)
       ORDER BY sub."submittedAt" DESC
       LIMIT $2`,
      [classIds, limit],
    );

    return rows;
  }

  async getSubjectBreakdown(teacherId: string) {
    const classes = await this.classRepo.find({ where: { teacherId }, select: { id: true } });
    if (classes.length === 0) return [];

    const classIds = classes.map(c => c.id);

    const rows = await this.assignmentRepo.query(
      `SELECT ass."simulationId",
              COUNT(sub.id) as submissionCount,
              AVG(sub.score) as avgScore
       FROM class_assignments ass
       LEFT JOIN assignment_submissions sub ON sub."assignmentId" = ass.id
       WHERE ass."classId" = ANY($1)
       GROUP BY ass."simulationId"
       ORDER BY COUNT(sub.id) DESC`,
      [classIds],
    );

    const subjectMap: Record<string, { label: string; count: number; avgScore: number }> = {
      physics: { label: 'Vật lý', count: 0, avgScore: 0 },
      chemistry: { label: 'Hóa học', count: 0, avgScore: 0 },
      math: { label: 'Toán học', count: 0, avgScore: 0 },
    };

    for (const row of rows) {
      const simId = (row.simulationId || '').toLowerCase();
      let subject = 'other';
      if (simId.startsWith('chem')) subject = 'chemistry';
      else if (simId.startsWith('phys') || simId.startsWith('vat')) subject = 'physics';
      else if (simId.startsWith('math') || simId.startsWith('toan')) subject = 'math';

      if (!subjectMap[subject]) subjectMap[subject] = { label: 'Khác', count: 0, avgScore: 0 };
      subjectMap[subject].count += parseInt(row.submissionCount || '0', 10);
    }

    return Object.entries(subjectMap)
      .filter(([_, v]) => v.count > 0)
      .map(([key, val]) => ({
        subject: key,
        label: val.label,
        count: val.count,
      }));
  }

  // ─── PER-CLASS ANALYTICS ──────────────────────────────

  async getClassOverview(classId: string) {
    const cls = await this.classRepo.findOne({ where: { id: classId }, relations: { members: true, assignments: { submissions: true } } });
    if (!cls) throw new NotFoundException('Không tìm thấy lớp học');

    const approved = cls.members.filter(m => m.status === ClassMemberStatus.APPROVED);
    const pending = cls.members.filter(m => m.status === ClassMemberStatus.PENDING);
    let totalSubmissions = 0;
    let totalScore = 0;
    let scoreCount = 0;

    for (const ass of cls.assignments) {
      for (const sub of ass.submissions) {
        totalSubmissions++;
        if (sub.score != null) { totalScore += sub.score; scoreCount++; }
      }
    }

    const avgScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0;
    const totalExpected = cls.assignments.length * approved.length;
    const completionRate = totalExpected > 0 ? Math.round((totalSubmissions / totalExpected) * 100) : 0;

    return {
      className: cls.name,
      inviteCode: cls.inviteCode,
      totalStudents: approved.length,
      pendingStudents: pending.length,
      totalAssignments: cls.assignments.length,
      totalSubmissions,
      avgScore,
      completionRate,
    };
  }

  async getClassCompletion(classId: string, assignmentId?: string, period?: AnalyticsPeriod) {
    const cls = await this.classRepo.findOne({ where: { id: classId }, relations: { members: true, assignments: { submissions: true } } });
    if (!cls) throw new NotFoundException('Không tìm thấy lớp học');

    const approved = cls.members.filter(m => m.status === ClassMemberStatus.APPROVED);
    const { start, end } = this.getPeriodDateRange(period);

    let assignments = cls.assignments;
    if (assignmentId) {
      assignments = assignments.filter(a => a.id === assignmentId);
    }

    const filteredAssignments = assignments.map(a => ({
      ...a,
      submissions: a.submissions.filter(s => {
        if (period) return new Date(s.submittedAt) >= start && new Date(s.submittedAt) <= end;
        return true;
      }),
    }));

    const submitted = filteredAssignments.reduce((sum, a) => sum + a.submissions.length, 0);
    const total = approved.length * filteredAssignments.length;
    const notSubmitted = Math.max(0, total - submitted);

    const byAssignment = filteredAssignments.map(a => ({
      assignmentId: a.id,
      title: a.title,
      simulationId: a.simulationId,
      submitted: a.submissions.length,
      total: approved.length,
      notSubmitted: approved.length - a.submissions.length,
      rate: approved.length > 0 ? Math.round((a.submissions.length / approved.length) * 100) : 0,
    }));

    return {
      submitted,
      notSubmitted,
      total,
      rate: total > 0 ? Math.round((submitted / total) * 100) : 0,
      totalStudents: approved.length,
      byAssignment,
    };
  }

  async getScoreDistribution(classId: string) {
    const cls = await this.classRepo.findOne({ where: { id: classId }, relations: { assignments: { submissions: true } } });
    if (!cls) throw new NotFoundException('Không tìm thấy lớp học');

    const scores: number[] = [];
    for (const ass of cls.assignments) {
      for (const sub of ass.submissions) {
        if (sub.score != null) scores.push(sub.score);
      }
    }

    const ranges = [
      { label: '0 - 2', min: 0, max: 2, count: 0 },
      { label: '2 - 4', min: 2, max: 4, count: 0 },
      { label: '4 - 6', min: 4, max: 6, count: 0 },
      { label: '6 - 8', min: 6, max: 8, count: 0 },
      { label: '8 - 10', min: 8, max: 10, count: 0 },
    ];

    for (const score of scores) {
      for (const range of ranges) {
        if (score >= range.min && score < range.max) {
          range.count++;
          break;
        }
      }
    }

    const sorted = [...scores].sort((a, b) => a - b);
    const sum = scores.reduce((a, b) => a + b, 0);

    return {
      ranges,
      average: scores.length > 0 ? Math.round((sum / scores.length) * 10) / 10 : 0,
      highest: scores.length > 0 ? Math.max(...scores) : 0,
      lowest: scores.length > 0 ? Math.min(...scores) : 0,
      median: scores.length > 0
        ? sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)]
        : 0,
      totalScores: scores.length,
    };
  }

  async getClassTimeline(classId: string, period?: AnalyticsPeriod) {
    const cls = await this.classRepo.findOne({ where: { id: classId }, relations: { assignments: { submissions: true } } });
    if (!cls) throw new NotFoundException('Không tìm thấy lớp học');

    const now = new Date();
    const points: { label: string; submissions: number; uniqueStudents: number }[] = [];
    const intervals = period === AnalyticsPeriod.WEEK ? 7 : 12;

    for (let i = intervals - 1; i >= 0; i--) {
      let start: Date;
      let end: Date;
      let label: string;

      if (period === AnalyticsPeriod.WEEK) {
        start = new Date(now);
        start.setDate(now.getDate() - i);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        label = `${start.getDate()}/${start.getMonth() + 1}`;
      } else {
        start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        label = `Tháng ${start.getMonth() + 1}`;
      }

      let submissions = 0;
      const studentSet = new Set<string>();
      for (const ass of cls.assignments) {
        for (const sub of ass.submissions) {
          const d = new Date(sub.submittedAt);
          if (d >= start && d < end) {
            submissions++;
            studentSet.add(sub.memberId);
          }
        }
      }

      points.push({ label, submissions, uniqueStudents: studentSet.size });
    }

    return points;
  }

  async getStudentRanking(classId: string) {
    const cls = await this.classRepo.findOne({ where: { id: classId }, relations: { members: true, assignments: { submissions: true } } });
    if (!cls) throw new NotFoundException('Không tìm thấy lớp học');

    const approved = cls.members.filter(m => m.status === ClassMemberStatus.APPROVED);
    const studentMap = new Map<string, { name: string; code: string; scores: number[] }>();

    for (const m of approved) {
      studentMap.set(m.id, { name: m.studentName, code: m.studentCode, scores: [] });
    }

    for (const ass of cls.assignments) {
      for (const sub of ass.submissions) {
        if (sub.score != null && studentMap.has(sub.memberId)) {
          studentMap.get(sub.memberId)!.scores.push(sub.score);
        }
      }
    }

    const ranking = Array.from(studentMap.entries())
      .map(([memberId, data]) => {
        const avgScore = data.scores.length > 0
          ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10
          : 0;
        return {
          memberId,
          studentName: data.name,
          studentCode: data.code,
          submissionCount: data.scores.length,
          avgScore,
          maxScore: data.scores.length > 0 ? Math.max(...data.scores) : null,
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore);

    return ranking.map((r, i) => ({ ...r, rank: i + 1 }));
  }

  async getPerAssignmentAnalysis(classId: string) {
    const cls = await this.classRepo.findOne({ where: { id: classId }, relations: { members: true, assignments: { submissions: true } } });
    if (!cls) throw new NotFoundException('Không tìm thấy lớp học');

    const approvedCount = cls.members.filter(m => m.status === ClassMemberStatus.APPROVED).length;

    return cls.assignments.map(ass => {
      const scores = ass.submissions.map(s => s.score).filter((s): s is number => s != null);
      return {
        assignmentId: ass.id,
        title: ass.title,
        simulationId: ass.simulationId,
        submittedCount: ass.submissions.length,
        totalStudents: approvedCount,
        notSubmitted: Math.max(0, approvedCount - ass.submissions.length),
        completionRate: approvedCount > 0 ? Math.round((ass.submissions.length / approvedCount) * 100) : 0,
        avgScore: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
        highestScore: scores.length > 0 ? Math.max(...scores) : null,
        lowestScore: scores.length > 0 ? Math.min(...scores) : null,
        dueDate: ass.dueDate,
      };
    });
  }

  async getStudentDetail(classId: string) {
    const cls = await this.classRepo.findOne({ where: { id: classId }, relations: { members: true, assignments: { submissions: true } } });
    if (!cls) throw new NotFoundException('Không tìm thấy lớp học');

    const approved = cls.members.filter(m => m.status === ClassMemberStatus.APPROVED);
    const studentMap = new Map<string, { name: string; code: string; submissions: { assignmentId: string; title: string; score: number; submittedAt: Date }[] }>();

    for (const m of approved) {
      studentMap.set(m.id, { name: m.studentName, code: m.studentCode, submissions: [] });
    }

    for (const ass of cls.assignments) {
      for (const sub of ass.submissions) {
        if (studentMap.has(sub.memberId)) {
          studentMap.get(sub.memberId)!.submissions.push({
            assignmentId: ass.id,
            title: ass.title,
            score: sub.score ?? 0,
            submittedAt: sub.submittedAt,
          });
        }
      }
    }

    return Array.from(studentMap.entries()).map(([memberId, data]) => {
      const scores = data.submissions.map(s => s.score);
      const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
      const lastSubmission = data.submissions.length > 0
        ? data.submissions.reduce((a, b) => new Date(a.submittedAt) > new Date(b.submittedAt) ? a : b)
        : null;

      return {
        memberId,
        studentName: data.name,
        studentCode: data.code,
        totalSubmissions: data.submissions.length,
        avgScore,
        highestScore: scores.length > 0 ? Math.max(...scores) : null,
        lowestScore: scores.length > 0 ? Math.min(...scores) : null,
        lastSubmission: lastSubmission ? {
          assignmentTitle: lastSubmission.title,
          score: lastSubmission.score,
          submittedAt: lastSubmission.submittedAt,
        } : null,
      };
    });
  }

  // ─── EXCEL EXPORT ─────────────────────────────────────

  async exportStudentDetailToXlsx(classId: string): Promise<ExcelJS.Buffer> {
    const data = await this.getStudentDetail(classId);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Chi tiết học sinh');

    sheet.columns = [
      { header: 'Mã HS', key: 'studentCode', width: 15 },
      { header: 'Họ và tên', key: 'studentName', width: 25 },
      { header: 'Số bài nộp', key: 'totalSubmissions', width: 15 },
      { header: 'Điểm TB', key: 'avgScore', width: 12 },
      { header: 'Điểm cao nhất', key: 'highestScore', width: 15 },
      { header: 'Điểm thấp nhất', key: 'lowestScore', width: 15 },
      { header: 'Bài cuối', key: 'lastAssignment', width: 25 },
      { header: 'Điểm bài cuối', key: 'lastScore', width: 15 },
      { header: 'Nộp cuối', key: 'lastSubmittedAt', width: 20 },
    ];

    for (const row of data) {
      sheet.addRow({
        studentCode: row.studentCode,
        studentName: row.studentName,
        totalSubmissions: row.totalSubmissions,
        avgScore: row.avgScore,
        highestScore: row.highestScore,
        lowestScore: row.lowestScore,
        lastAssignment: row.lastSubmission?.assignmentTitle || '',
        lastScore: row.lastSubmission?.score ?? '',
        lastSubmittedAt: row.lastSubmission
          ? new Date(row.lastSubmission.submittedAt).toLocaleDateString('vi-VN')
          : '',
      });
    }

    sheet.getRow(1).font = { bold: true };

    return workbook.xlsx.writeBuffer();
  }

  async exportStudentRankingToXlsx(classId: string): Promise<ExcelJS.Buffer> {
    const data = await this.getStudentRanking(classId);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Xếp hạng học sinh');

    sheet.columns = [
      { header: 'Hạng', key: 'rank', width: 8 },
      { header: 'Mã HS', key: 'studentCode', width: 15 },
      { header: 'Họ và tên', key: 'studentName', width: 25 },
      { header: 'Số bài nộp', key: 'submissionCount', width: 15 },
      { header: 'Điểm TB', key: 'avgScore', width: 12 },
      { header: 'Điểm cao nhất', key: 'maxScore', width: 15 },
    ];

    for (const row of data) {
      sheet.addRow({
        rank: row.rank,
        studentCode: row.studentCode,
        studentName: row.studentName,
        submissionCount: row.submissionCount,
        avgScore: row.avgScore,
        maxScore: row.maxScore,
      });
    }

    sheet.getRow(1).font = { bold: true };

    return workbook.xlsx.writeBuffer();
  }

  async exportActivityToXlsx(teacherId: string, limit = 100): Promise<ExcelJS.Buffer> {
    const rows = await this.getRecentActivity(teacherId, limit);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Hoạt động gần đây');

    sheet.columns = [
      { header: 'Lớp', key: 'className', width: 20 },
      { header: 'Học sinh', key: 'studentName', width: 25 },
      { header: 'Mã HS', key: 'studentCode', width: 15 },
      { header: 'Bài tập', key: 'assignmentTitle', width: 30 },
      { header: 'Điểm', key: 'score', width: 10 },
      { header: 'Ngày nộp', key: 'submittedAt', width: 20 },
    ];

    for (const row of rows) {
      sheet.addRow({
        className: row.className,
        studentName: row.studentName,
        studentCode: row.studentCode,
        assignmentTitle: row.assignmentTitle,
        score: row.score,
        submittedAt: new Date(row.submittedAt).toLocaleString('vi-VN'),
      });
    }

    sheet.getRow(1).font = { bold: true };

    return workbook.xlsx.writeBuffer();
  }
}
