import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

// ── Stats ──

export async function getAdminOverviewStats(range: 'day' | 'week' | 'month' = 'day') {
	return axios.get(`${ip3}/admin/stats/overview`, { params: { range } });
}

export async function getAdminRailwayMetrics(range: '1h' | '6h' | '1d' | '7d' | '30d' = '1d') {
	return axios.get(`${ip3}/admin/stats/railway-metrics`, { params: { range } });
}

// ── Users ──

export async function getAdminUsers(params: { search?: string; role?: string; page?: number; limit?: number }) {
	return axios.get(`${ip3}/admin/users`, { params });
}

export async function createAdminUser(data: { email: string; firstName?: string; lastName?: string; role: string; password: string }) {
	return axios.post(`${ip3}/admin/users`, data);
}

export async function updateAdminUserRole(id: string, role: string) {
	return axios.put(`${ip3}/admin/users/${id}/role`, { role });
}

export async function setAdminUserLocked(id: string, isLocked: boolean) {
	return axios.put(`${ip3}/admin/users/${id}/lock`, { isLocked });
}

export async function resetAdminUserPassword(id: string) {
	return axios.post(`${ip3}/admin/users/${id}/reset-password`);
}

export async function deleteAdminUser(id: string) {
	return axios.delete(`${ip3}/admin/users/${id}`);
}

export async function importAdminUsers(file: File) {
	const formData = new FormData();
	formData.append('file', file);
	return axios.post(`${ip3}/admin/users/import`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
}

// ── Classes ──

export async function getAdminClasses(params: { search?: string; teacherId?: string }) {
	return axios.get(`${ip3}/admin/classes`, { params });
}

export async function reassignAdminClass(id: string, teacherId: string) {
	return axios.put(`${ip3}/admin/classes/${id}/teacher`, { teacherId });
}

export async function setAdminClassLocked(id: string, isLocked: boolean) {
	return axios.put(`${ip3}/admin/classes/${id}/lock`, { isLocked });
}

export async function deleteAdminClass(id: string) {
	return axios.delete(`${ip3}/admin/classes/${id}`);
}

// ── Content: sims ──

export async function getAdminSims() {
	return axios.get(`${ip3}/admin/content/sims`);
}

export async function setAdminSimPublished(id: string, published: boolean) {
	return axios.put(`${ip3}/admin/content/sims/${id}/publish`, { published });
}

export async function assignAdminSimSubject(id: string, roomType: string) {
	return axios.put(`${ip3}/admin/content/sims/${id}/subject`, { roomType });
}

// ── Content: questions ──

export async function getAdminQuestions(params?: { status?: string; subject?: string }) {
	return axios.get(`${ip3}/admin/content/questions`, { params });
}

export async function approveAdminQuestion(id: string) {
	return axios.put(`${ip3}/admin/content/questions/${id}/approve`);
}

export async function rejectAdminQuestion(id: string) {
	return axios.put(`${ip3}/admin/content/questions/${id}/reject`);
}

// ── Content: exams ──

export async function getAdminExams(params?: { status?: string; subject?: string }) {
	return axios.get(`${ip3}/admin/content/exams`, { params });
}

export async function approveAdminExam(id: string) {
	return axios.put(`${ip3}/admin/content/exams/${id}/approve`);
}

export async function rejectAdminExam(id: string) {
	return axios.put(`${ip3}/admin/content/exams/${id}/reject`);
}
