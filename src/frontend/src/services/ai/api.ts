import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export const chatSessionApi = {
	create: (data: { title?: string; subject?: string; sceneId?: string }) => axios.post(`${ip3}/ai/chat/sessions`, data),
	list: () => axios.get(`${ip3}/ai/chat/sessions`),
	get: (id: string) => axios.get(`${ip3}/ai/chat/sessions/${id}`),
	delete: (id: string) => axios.delete(`${ip3}/ai/chat/sessions/${id}`),
	deleteAll: () => axios.delete(`${ip3}/ai/chat/sessions`),
	getMessages: (id: string) => axios.get(`${ip3}/ai/chat/sessions/${id}/messages`),
	sendMessage: (id: string, data: { message: string; subject?: string; grade?: number }) =>
		axios.post(`${ip3}/ai/chat/sessions/${id}/messages`, data),
	guidance: (id: string, sceneGraph: any) => axios.post(`${ip3}/ai/chat/sessions/${id}/guidance`, { sceneGraph }),
	generateExperiment: (message: string) => axios.post(`${ip3}/ai/chat/generate-experiment`, { message }),
	experimentChat: (id: string, message: string, subject?: string) =>
		axios.post(`${ip3}/ai/chat/sessions/${id}/experiment-chat`, { message, subject }),
};

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
	return axios.post<{
		data: {
			answer: string;
			options?: string[];
			selection_type?: 'single' | 'multiple';
		};
	}>(`${ip3}/ai/chat`, payload);
}

export async function generateAiQuiz(payload: { simulationId: string; subject?: string; count: number }) {
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
