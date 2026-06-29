import { useState, useCallback, useRef } from 'react';
import { chatSessionApi } from '@/services/ai/api';

export interface LogEntry { id: string; text: string; icon: string; }

export interface SessionItem {
  id: string; title: string; subject: string; sceneId?: string;
  createdAt: string; updatedAt: string;
}

interface ChatMessage {
  id: string; sender: 'ai' | 'user' | 'guidance';
  text: string; aiResult?: Ai.IRecord; metadata?: Record<string, unknown>;
}

const LOG_POOL = [
  { text: 'Đang đọc câu hỏi...', icon: 'file-text' },
  { text: 'Phân tích ngữ nghĩa...', icon: 'scan' },
  { text: 'Xác định ý định...', icon: 'aim' },
  { text: 'Nhận diện môn học...', icon: 'book' },
  { text: 'Phát hiện chủ đề...', icon: 'tag' },
  { text: 'Trích xuất tham số...', icon: 'calculator' },
  { text: 'Đã tìm thấy dữ kiện', icon: 'check-circle' },
  { text: 'Tra cứu cơ sở dữ liệu...', icon: 'database' },
  { text: 'Đối chiếu dạng bài...', icon: 'file-search' },
  { text: 'Đã khớp 1 dạng bài mẫu', icon: 'check-circle' },
  { text: 'Truy xuất lý thuyết...', icon: 'book' },
  { text: 'Đã tải tài liệu tham khảo', icon: 'check-circle' },
  { text: 'Đang tạo câu trả lời...', icon: 'bulb' },
  { text: 'Đang kiểm tra công thức...', icon: 'experiment' },
  { text: 'Đang soạn lời giải...', icon: 'edit' },
  { text: 'Đang định dạng kết quả...', icon: 'code' },
  { text: 'Sắp xong rồi...', icon: 'thunderbolt' },
];

function pickRandomLogs(count: number): LogEntry[] {
  const shuffled = [...LOG_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((item) => ({
    ...item, id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  }));
}

export default function useAIChatBotModel() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const streamActiveRef = useRef(false);

  const openChatbot = useCallback(async (sub?: string, scene?: Scene.IRecord) => {
    setSubject(sub || 'physics');
    setOpen(true);
    try {
      const res = await chatSessionApi.create({
        subject: sub || 'physics', sceneId: scene?.id, title: scene?.name || 'Thí nghiệm mới',
      });
      const sid = (res.data as any).data?.id || (res.data as any).id;
      setSessionId(sid);
      if (scene && sid) {
        setLoading(true);
        streamActiveRef.current = true;
        startLogStream(3000);
        const g = await chatSessionApi.guidance(sid, scene);
        const gData = (g.data as any).data ?? g.data;
        setMessages([{ id: gData.id || Date.now().toString(), sender: 'guidance', text: gData.content || '', metadata: gData.metadata }]);
        streamActiveRef.current = false;
        setLoading(false);
        setLogs([]);
      }
    } catch { /* fallback */ }
  }, []);

  const closeChatbot = useCallback(() => setOpen(false), []);

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort(); abortRef.current = null;
    streamActiveRef.current = false;
    setLoading(false); setLogs([]);
  }, []);

  const listSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await chatSessionApi.list();
      const data = ((res.data as any).data || []) as SessionItem[];
      setSessions(data);
      return data;
    } catch { return []; }
    finally { setLoadingSessions(false); }
  }, []);

  const loadSession = useCallback(async (sid: string) => {
    setLoading(true);
    try {
      const res = await chatSessionApi.getMessages(sid);
      const msgs: ChatMessage[] = ((res.data as any).data || []).map((m: any) => ({
        id: m.id, sender: m.role, text: m.content, metadata: m.metadata,
      }));
      const session = await chatSessionApi.get(sid);
      const sdata = (session.data as any).data || session.data;
      setSessionId(sid);
      setSubject(sdata.subject || 'physics');
      setMessages(msgs);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const deleteSession = useCallback(async (sid: string) => {
    try {
      await chatSessionApi.delete(sid);
      setSessions((prev) => prev.filter((s) => s.id !== sid));
      if (sessionId === sid) { resetChat(); }
    } catch { /* ignore */ }
  }, [sessionId]);

  const deleteAllSessions = useCallback(async () => {
    try {
      await chatSessionApi.deleteAll();
      setSessions([]);
      resetChat();
    } catch { /* ignore */ }
  }, []);

  const newSession = useCallback(() => {
    resetChat();
    setSessionId(null);
  }, []);

  const startLogStream = useCallback((duration: number) => {
    streamActiveRef.current = true;
    const entries = pickRandomLogs(5 + Math.floor(Math.random() * 4));
    let index = 0;
    const interval = duration / entries.length;
    const addNext = () => {
      if (!streamActiveRef.current || index >= entries.length) return;
      setLogs((prev) => [...prev.slice(-6), entries[index]]);
      index++;
      if (index < entries.length) setTimeout(addNext, interval);
    };
    addNext();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true); setLogs([]); streamActiveRef.current = false;
    const abort = new AbortController(); abortRef.current = abort;
    startLogStream(3000 + Math.random() * 3000);

    try {
      let responseText = '';
      if (sessionId) {
        const res = await chatSessionApi.sendMessage(sessionId, { message: text, subject });
        const payload = (res.data as any).data ?? res.data;
        responseText = payload.aiMessage?.content ?? payload.answer ?? '';
      } else {
        const res = await chatSessionApi.create({ subject: subject || 'physics', title: text.slice(0, 50) });
        const sid = (res.data as any).data?.id || (res.data as any).id;
        setSessionId(sid);
        const msgRes = await chatSessionApi.sendMessage(sid, { message: text, subject });
        const payload = (msgRes.data as any).data ?? msgRes.data;
        responseText = payload.aiMessage?.content ?? payload.answer ?? '';
      }
      setMessages((prev) => [...prev, {
        id: Date.now().toString(), sender: 'ai',
        text: responseText || 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
      }]);
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;
      setMessages((prev) => [...prev, {
        id: Date.now().toString(), sender: 'ai',
        text: 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
      }]);
    } finally {
      streamActiveRef.current = false; abortRef.current = null;
      setLoading(false); setLogs([]);
    }
  }, [subject, sessionId, startLogStream]);

  const requestGuidance = useCallback(async (scene: Scene.IRecord) => {
    if (!sessionId) return;
    setLoading(true); setLogs([]); streamActiveRef.current = false;
    startLogStream(2500);
    try {
      const g = await chatSessionApi.guidance(sessionId, scene);
      const gData = (g.data as any).data ?? g.data;
      setMessages((prev) => [...prev, { id: gData.id || Date.now().toString(), sender: 'guidance', text: gData.content || '', metadata: gData.metadata }]);
    } catch { /* ignore */ }
    streamActiveRef.current = false;
    setLoading(false); setLogs([]);
  }, [sessionId, startLogStream]);

  const resetChat = useCallback(() => { setMessages([]); setSessionId(null); }, []);

  return {
    open, subject, sessionId, messages, loading, logs, sessions, loadingSessions,
    setSubject, openChatbot, closeChatbot, sendMessage, resetChat, requestGuidance, stopGenerating,
    listSessions, loadSession, deleteSession, deleteAllSessions, newSession,
  };
}
