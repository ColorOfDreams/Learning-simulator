import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';
import type { AiAnalyzeOutput, AiAnalyzeRequest } from './typing';

export async function analyzeAiPrompt(payload: AiAnalyzeRequest) {
	return axios.post<{ data: AiAnalyzeOutput }>(`${ip3}/api/ai/analyze`, payload);
}
