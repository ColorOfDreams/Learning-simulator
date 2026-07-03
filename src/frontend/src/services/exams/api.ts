import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function getExams(params?: { subject?: string; grade?: number }) {
  return axios.get(`${ip3}/exams`, { params });
}

export async function getExamById(id: string) {
  return axios.get(`${ip3}/exams/${id}`);
}

export async function getExamWithQuestions(id: string) {
  return axios.get(`${ip3}/exams/${id}/questions`);
}

export async function createExam(data: any) {
  return axios.post(`${ip3}/exams`, data);
}

export async function aiGenerateExam(data: {
  subject: string; grade: number; topic?: string;
  description?: string; duration?: number;
  difficulty?: number; sections?: { type: string; count: number; maxScore: number; title?: string }[];
}) {
  return axios.post(`${ip3}/exams/ai-generate`, data);
}

export async function updateExam(id: string, data: any) {
  return axios.put(`${ip3}/exams/${id}`, data);
}

export async function deleteExam(id: string) {
  return axios.delete(`${ip3}/exams/${id}`);
}
