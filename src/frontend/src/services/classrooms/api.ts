import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function createClass(data: ClassroomsAPI.CreateClassDto) {
	return axios.post(`${ip3}/classrooms`, data);
}

export async function getTeacherClasses() {
	return axios.get(`${ip3}/classrooms/teacher`);
}

export async function getClassById(id: string) {
	return axios.get(`${ip3}/classrooms/${id}`);
}

export async function deleteClass(id: string) {
	return axios.delete(`${ip3}/classrooms/${id}`);
}

export async function joinClass(data: ClassroomsAPI.JoinClassDto) {
	return axios.post(`${ip3}/classrooms/join`, data);
}

export async function updateMemberStatus(classId: string, memberId: string, status: 'APPROVED' | 'REJECTED') {
	return axios.patch(`${ip3}/classrooms/${classId}/members/${memberId}`, { status });
}

export async function createAssignment(classId: string, data: ClassroomsAPI.CreateAssignmentDto) {
	return axios.post(`${ip3}/classrooms/${classId}/assignments`, data);
}

export async function submitAssignment(assignmentId: string, data: ClassroomsAPI.SubmitAssignmentDto) {
	return axios.post(`${ip3}/classrooms/assignments/${assignmentId}/submit`, data);
}

export async function getStudentClasses() {
	return axios.get(`${ip3}/classrooms/student/me`);
}

// ─── ANALYTICS ────────────────────────────────────────

export async function getTeacherDashboardOverview() {
	return axios.get(`${ip3}/analytics/teacher/overview`);
}

export async function getTeacherClassComparison() {
	return axios.get(`${ip3}/analytics/teacher/class-comparison`);
}

export async function getTeacherMonthlyTrends(months = 6) {
	return axios.get(`${ip3}/analytics/teacher/monthly-trends`, { params: { months } });
}

export async function getTeacherTopStudents(limit = 10) {
	return axios.get(`${ip3}/analytics/teacher/top-students`, { params: { limit } });
}

export async function getTeacherRecentActivity(limit = 20) {
	return axios.get(`${ip3}/analytics/teacher/recent-activity`, { params: { limit } });
}

export async function getTeacherSubjectBreakdown() {
	return axios.get(`${ip3}/analytics/teacher/subject-breakdown`);
}

export async function getClassAnalyticsOverview(classId: string) {
	return axios.get(`${ip3}/classrooms/${classId}/analytics/overview`);
}

export async function getClassCompletion(classId: string, params?: { assignmentId?: string; period?: string }) {
	return axios.get(`${ip3}/classrooms/${classId}/analytics/completion`, { params });
}

export async function getClassScoreDistribution(classId: string) {
	return axios.get(`${ip3}/classrooms/${classId}/analytics/score-distribution`);
}

export async function getClassTimeline(classId: string, period?: string) {
	return axios.get(`${ip3}/classrooms/${classId}/analytics/timeline`, { params: { period } });
}

export async function getClassStudentRanking(classId: string) {
	return axios.get(`${ip3}/classrooms/${classId}/analytics/student-ranking`);
}

export async function getClassPerAssignment(classId: string) {
	return axios.get(`${ip3}/classrooms/${classId}/analytics/per-assignment`);
}

export async function getClassStudentDetail(classId: string) {
	return axios.get(`${ip3}/classrooms/${classId}/analytics/student-detail`);
}

export function getExportStudentDetailUrl(classId: string) {
	return `${ip3}/classrooms/${classId}/analytics/student-detail/export/xlsx`;
}

export function getExportStudentRankingUrl(classId: string) {
	return `${ip3}/classrooms/${classId}/analytics/student-ranking/export/xlsx`;
}

export function getExportRecentActivityUrl() {
	return `${ip3}/analytics/teacher/recent-activity/export/xlsx`;
}
