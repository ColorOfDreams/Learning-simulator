import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function analyzeAiPrompt(payload: Ai.AnalyzeRequest) {
  return axios.post<{ data: Ai.IRecord }>(`${ip3}/ai/analyze`, payload);
}

export async function chatWithAiPrompt(payload: {
  message: string;
  subject?: string;
  grade?: number;
  simulationId?: string;
  context?: { role: 'user' | 'assistant'; content: string }[];
}) {
  return axios.post<{ data: { answer: string } }>(`${ip3}/ai/chat`, payload);
}

export async function generateAiQuiz(payload: {
  simulationId: string;
  subject?: string;
  count: number;
}) {
  return axios.post<{
    data: {
      simulationId: string;
      count: number;
      questions: Array<{
        q: string;
        opts: Array<{ k: string; t: string }>;
        correct: string;
        explanation: string;
      }>;
      used_llm: boolean;
    };
  }>(`${ip3}/ai/quiz/generate`, payload);
}

