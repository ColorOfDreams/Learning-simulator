import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export const chatSessionApi = {
  create: (data: { title?: string; subject?: string; sceneId?: string }) =>
    axios.post(`${ip3}/ai/chat/sessions`, data),
  list: () => axios.get(`${ip3}/ai/chat/sessions`),
  get: (id: string) => axios.get(`${ip3}/ai/chat/sessions/${id}`),
  delete: (id: string) => axios.delete(`${ip3}/ai/chat/sessions/${id}`),
  deleteAll: () => axios.delete(`${ip3}/ai/chat/sessions`),
  getMessages: (id: string) => axios.get(`${ip3}/ai/chat/sessions/${id}/messages`),
  sendMessage: (id: string, data: { message: string; subject?: string; grade?: number }) =>
    axios.post(`${ip3}/ai/chat/sessions/${id}/messages`, data),
  guidance: (id: string, sceneGraph: any) =>
    axios.post(`${ip3}/ai/chat/sessions/${id}/guidance`, { sceneGraph }),
  generateExperiment: (message: string) => axios.post(`${ip3}/ai/chat/generate-experiment`, { message }),
};
