import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function getQuestions(params?: {
  subject?: string; grade?: number; type?: string;
  topic?: string; difficulty?: number; search?: string;
}) {
  return axios.get(`${ip3}/question-bank`, { params });
}

export async function getQuestionById(id: string) {
  return axios.get(`${ip3}/question-bank/${id}`);
}

export async function createQuestion(data: any) {
  return axios.post(`${ip3}/question-bank`, data);
}

export async function updateQuestion(id: string, data: any) {
  return axios.put(`${ip3}/question-bank/${id}`, data);
}

export async function deleteQuestion(id: string) {
  return axios.delete(`${ip3}/question-bank/${id}`);
}

export async function bulkImportQuestions(data: { questions: any[] }) {
  return axios.post(`${ip3}/question-bank/bulk`, data);
}

export async function aiGenerateQuestions(data: {
  subject: string; grade: number; topic?: string;
  type?: string; count?: number; difficulty?: number;
}) {
  return axios.post(`${ip3}/question-bank/ai-generate`, data);
}
