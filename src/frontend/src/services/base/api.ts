import axios from '@/utils/axios';
import { ip3, ipNotif } from '@/utils/ip';
import type { ESettingKey } from './constant';
import type { ISetting } from './typing';

export async function getUserInfo() {
	return axios.get(`${ip3}/users/me`);
}

// Tự cập nhật hồ sơ học sinh (tên, giới thiệu)
export async function updateMyProfile(payload: { firstName?: string; lastName?: string; bio?: string }) {
	return axios.patch(`${ip3}/users/me`, payload);
}

export async function getUserStats() {
	return axios.get(`${ip3}/users/me/stats`);
}

export async function completeActivity(xpEarned: number) {
	return axios.post(`${ip3}/users/me/complete-activity`, { xpEarned });
}

// Ghi nhận ngày dùng app (cập nhật streak, không cộng XP). Gọi khi mở app.
export async function touchActivity() {
	return axios.post(`${ip3}/users/me/touch`);
}

export async function getLeaderboard(limit = 10) {
	return axios.get(`${ip3}/users/leaderboard`, { params: { limit } });
}

export async function openLabSession(payload: { simulationId: string; simulationTitle?: string; subject: string }) {
	return axios.post(`${ip3}/users/me/labs/open`, payload);
}

export async function completeLabSession(payload: {
	simulationId: string;
	simulationTitle?: string;
	subject: string;
	score: number;
	totalQuestions: number;
	correctAnswers: number;
	durationSeconds?: number;
}) {
	return axios.post(`${ip3}/users/me/labs/complete`, payload);
}

export async function getMyLabs() {
	return axios.get(`${ip3}/users/me/labs`);
}

export async function adminlogin(payload: { username?: string; password?: string }) {
	return axios.post(`${ip3}/auth/login`, { ...payload, platform: 'Web' });
}

export async function login(payload: { email: string; password: string }) {
	return axios.post(`${ip3}/auth/login`, payload);
}

export async function register(payload: {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
}) {
	return axios.post(`${ip3}/auth/register`, payload);
}

export async function verifyGoogleLogin(payload: { token: string }) {
	return axios.post(`${ip3}/auth/google/verify`, payload);
}

export async function initOneSignal(payload: { playerId: string }) {
	return axios.put(`${ipNotif}/one-signal/user`, payload);
}

export async function deleteOneSignal(data: { playerId: any }) {
	return axios.delete(`${ipNotif}/one-signal/user`, { data });
}

// Cài đặt

export async function getSettingByKey(key: ESettingKey, ip?: string) {
	return axios.get(`${ip ?? ip3}/setting/${key}/value`);
}

export async function putSetting(data: ISetting, ip?: string) {
	return axios.put(`${ip ?? ip3}/setting/value`, data);
}

export async function getByKey(key: ESettingKey, ip?: string) {
	return axios.get(`${ip ?? ip3}/setting/one`, { params: { condition: { key: key } } });
}

export async function updateSetting(id: string, payload: { key: ESettingKey; value: any }, ip?: string) {
	return axios.put(`${ip ?? ip3}/setting/${id}`, payload);
}

export async function createSetting(payload: { key: ESettingKey; value: any }, ip?: string) {
	return axios.post(`${ip ?? ip3}/setting`, payload);
}

// Scene API
export async function getSceneAll() {
	return axios.get(`${ip3}/scene/all`);
}
