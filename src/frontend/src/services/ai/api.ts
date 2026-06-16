import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function analyzeAiPrompt(payload: Ai.AnalyzeRequest) {
  return axios.post<{ data: Ai.IRecord }>(`${ip3}/ai/analyze`, payload);
}
