import { useState, useCallback } from 'react';
import { analyzeAiPrompt } from '@/services/ai/api';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  aiResult?: Ai.IRecord;
}

export default function useAIChatBotModel() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const openChatbot = useCallback((sub?: string) => {
    setSubject(sub || 'physics');
    setOpen(true);
  }, []);

  const closeChatbot = useCallback(() => {
    setOpen(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await analyzeAiPrompt({
        message: text,
        subject: subject || 'physics',
      });
      const data = response.data.data;
      const aiText = formatAiResult(data);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'ai', text: aiText, aiResult: data },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: 'Xin lỗi, AI hiện không phản hồi. Vui lòng thử lại sau.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [subject]);

  const resetChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    open,
    subject,
    messages,
    loading,
    setSubject,
    openChatbot,
    closeChatbot,
    sendMessage,
    resetChat,
  };
}

function formatAiResult(data: Ai.IRecord): string {
  const lines: string[] = [];

  lines.push(`🎯 Phân tích: ${data.intent}  |  Độ tin cậy: ${Math.round(data.confidence * 100)}%`);
  lines.push(`📖 Chủ đề: ${data.topic}`);

  if (data.analysis.given.length > 0) {
    lines.push('');
    lines.push('📋 Dữ kiện trích xuất:');
    data.analysis.given.forEach((item) => {
      lines.push(`  • ${item.label} (${item.key}) = ${item.value} ${item.unit || ''}`);
    });
  }

  if (data.analysis.target.length > 0) {
    lines.push(`🎯 Mục tiêu: ${data.analysis.target.join(', ')}`);
  }

  if (data.answer.short_answer) {
    lines.push('');
    lines.push(`💡 Đáp án: ${data.answer.short_answer}`);
  }

  if (data.answer.steps.length > 0) {
    lines.push('');
    lines.push('📝 Các bước giải:');
    data.answer.steps.forEach((step, i) => {
      lines.push(`  ${i + 1}. ${step}`);
    });
  }

  if (data.simulation) {
    lines.push('');
    lines.push(`🔬 Mô phỏng: ${data.simulation.title}`);
    data.simulation.parameters.forEach((p) => {
      lines.push(`  • ${p.label}: ${p.value} ${p.unit || ''}`);
    });
  }

  if (data.references.length > 0) {
    lines.push('');
    lines.push(`📚 Tài liệu: ${data.references.map((r) => r.title).join(', ')}`);
  }

  return lines.join('\n');
}
