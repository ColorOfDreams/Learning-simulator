import { mkdir, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { LlmService } from './llm.service';
import type { LlmChatMessage } from './llm.service';
import type { RagReference } from './rag-retrieval.service';

export type LlmAnswerIntent =
  | 'concept_explain'
  | 'formula_explain'
  | 'solve_problem'
  | 'simulation_guidance'
  | 'follow_up'
  | 'unknown';

export type LlmAnswerDetected = {
  intent: LlmAnswerIntent;
  subject: string;
  grade: number;
  topic: string;
  difficulty: 'basic' | 'medium' | 'advanced';
};

export type LlmAnswerSimulation = {
  simulationId?: string;
  available: boolean;
  templateTitle?: string;
  parameters?: Record<string, unknown>;
};

export type LlmAnswerUserContext = {
  session_id?: string;
  student_level?: string;
  preferred_style?: 'short_clear' | 'step_by_step' | 'exam_focused';
  recent_messages?: { role: 'user' | 'assistant'; content: string }[];
};

export type NormalizedLlmAnswer = {
  answer: string;
  steps: string[];
  formulae: string[];
  simulation_hint?: string;
  used_reference_ids: string[];
  confidence: 'high' | 'medium' | 'low';
  needs_more_context: boolean;
  safety_notes: string[];
  metadata: {
    llmEnabled: boolean;
    model?: string;
    retrievalTopK: number;
    promptTokensApprox: number;
    latencyMs: number;
    parseFallback?: boolean;
    error?: string;
  };
};

export type GenerateLlmAnswerInput = {
  question: string;
  detected: LlmAnswerDetected;
  references: RagReference[];
  simulation?: LlmAnswerSimulation;
  userContext?: LlmAnswerUserContext;
};

type RawLlmAnswer = {
  answer?: unknown;
  steps?: unknown;
  formulae?: unknown;
  simulation_hint?: unknown;
  used_reference_ids?: unknown;
  confidence?: unknown;
  needs_more_context?: unknown;
  safety_notes?: unknown;
};

@Injectable()
export class LlmAnswerService {
  constructor(private readonly llmService: LlmService) {}

  isConfigured() {
    return this.llmService.isConfigured();
  }

  getModel() {
    return this.llmService.getModel();
  }

  async logLocalFallback(input: GenerateLlmAnswerInput, answerText: string) {
    await this.writeInteractionLog(input, {
      answer: answerText,
      steps: [],
      formulae: [],
      used_reference_ids: [],
      confidence: 'medium',
      needs_more_context: false,
      safety_notes: [],
      metadata: {
        llmEnabled: false,
        model: this.llmService.getModel(),
        retrievalTopK: input.references.length,
        promptTokensApprox: 0,
        latencyMs: 0,
      },
    });
  }

  async generate(input: GenerateLlmAnswerInput): Promise<NormalizedLlmAnswer | undefined> {
    if (!this.llmService.isConfigured()) {
      return undefined;
    }

    const promptInput = this.buildPromptInput(input);
    const messages = this.buildMessages(promptInput);
    const promptTokensApprox = this.approximateTokens(messages);
    const startedAt = Date.now();
    let lastError: string | undefined;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const completion = await this.llmService.completeWithMetadata(messages, {
          temperature: 0.2,
          maxTokens: 700,
          timeoutMs: 30000,
          responseFormat: 'json_object',
        });

        if (!completion?.content) {
          lastError = 'LLM response was empty';
          continue;
        }

        const normalized = this.normalizeAnswer(
          completion.content,
          input.references,
          {
            model: completion.model,
            latencyMs: completion.latencyMs,
            retrievalTopK: input.references.length,
            promptTokensApprox,
          },
        );

        await this.writeInteractionLog(input, normalized);

        return normalized;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    const fallback: NormalizedLlmAnswer = {
      answer:
        'Mình chưa tạo được câu trả lời bằng LLM trong lần này. Hãy thử lại sau hoặc hỏi ngắn hơn để hệ thống dùng phần kiến thức đã truy hồi.',
      steps: [],
      formulae: [],
      used_reference_ids: [],
      confidence: 'low',
      needs_more_context: true,
      safety_notes: ['LLM request failed'],
      metadata: {
        llmEnabled: true,
        model: this.llmService.getModel(),
        retrievalTopK: input.references.length,
        promptTokensApprox,
        latencyMs: Date.now() - startedAt,
        error: lastError,
      },
    };

    await this.writeInteractionLog(input, fallback);

    return fallback;
  }

  private buildPromptInput(input: GenerateLlmAnswerInput) {
    return {
      question: input.question,
      detected: input.detected,
      rag: {
        topK: input.references.length,
        references: input.references.slice(0, 5).map((reference) => ({
          id: reference.id,
          title: reference.title,
          text: this.truncate(reference.text, 1200),
          topic: reference.topic,
          source: reference.source,
          score: reference.finalScore ?? reference.score,
          vectorScore: reference.vectorScore,
          keywordScore: reference.keywordScore,
          retrievalType: reference.retrievalType,
        })),
      },
      simulation: input.simulation,
      user_context: {
        session_id: input.userContext?.session_id,
        student_level: input.userContext?.student_level ?? `grade_${input.detected.grade}`,
        preferred_style: input.userContext?.preferred_style ?? 'short_clear',
        recent_messages: (input.userContext?.recent_messages ?? [])
          .slice(-6)
          .map((message) => ({
            role: message.role,
            content: this.truncate(message.content, 500),
          })),
      },
      answer_policy: {
        language: 'vi',
        max_length: 'short',
        must_use_references: true,
        avoid_hallucination: true,
        include_simulation_hint: Boolean(input.simulation?.simulationId),
      },
    };
  }

  private buildMessages(promptInput: ReturnType<LlmAnswerService['buildPromptInput']>): LlmChatMessage[] {
    return [
      {
        role: 'system',
        content: [
          'Bạn là trợ lý AI cho học sinh lớp 11 trong AI Study Simulator.',
          'Nhiệm vụ: trả lời ngắn gọn, đúng Vật lí phổ thông, ưu tiên nội dung trong RAG references.',
          'Nếu câu hỏi là khái niệm: nêu định nghĩa, ý nghĩa vật lí, ví dụ hoặc hình dung đơn giản khi phù hợp.',
          'Nếu câu hỏi là công thức/kí hiệu: nêu công thức, giải thích từng đại lượng, đơn vị nếu có, điều kiện áp dụng nếu cần.',
          'Nếu câu hỏi là bài tính ngắn: tóm tắt dữ kiện, công thức dùng, thay số, kết quả có đơn vị.',
          'Nếu có simulationId: thêm một gợi ý thao tác mô phỏng ngắn, không viết hướng dẫn UI dài.',
          'Nếu context không đủ: nói rõ chưa đủ dữ liệu trong học liệu hiện tại; chỉ thêm kiến thức nền khi chắc và không bịa nguồn.',
          'Không dùng markdown phức tạp. Không trả lời quá dài. Không nhắc máy móc "theo context được cung cấp" trong mọi câu.',
          'Chỉ trả JSON hợp lệ, không markdown, không văn bản ngoài JSON.',
          'Schema bắt buộc: {"answer":"...","steps":["..."],"formulae":["..."],"simulation_hint":"...","used_reference_ids":["..."],"confidence":"high|medium|low","needs_more_context":false,"safety_notes":[]}',
          'used_reference_ids chỉ được chứa id có trong rag.references.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: JSON.stringify(promptInput, null, 2),
      },
    ];
  }

  private normalizeAnswer(
    content: string,
    references: RagReference[],
    metadata: {
      model: string;
      latencyMs: number;
      retrievalTopK: number;
      promptTokensApprox: number;
    },
  ): NormalizedLlmAnswer {
    const allowedReferenceIds = new Set(references.map((reference) => reference.id));
    const parsed = this.parseJson(content);
    const raw = parsed.value;
    const answer = typeof raw.answer === 'string' && raw.answer.trim()
      ? raw.answer.trim()
      : this.stripJsonEnvelope(content).trim();
    const usedReferenceIds = this.asStringArray(raw.used_reference_ids).filter((id) =>
      allowedReferenceIds.has(id),
    );
    const confidence = this.asConfidence(raw.confidence);
    const loweredConfidence =
      references.length > 0 && usedReferenceIds.length === 0 && confidence === 'high'
        ? 'medium'
        : confidence;

    return {
      answer,
      steps: this.asStringArray(raw.steps).slice(0, 5),
      formulae: this.asStringArray(raw.formulae).slice(0, 6),
      ...(typeof raw.simulation_hint === 'string' && raw.simulation_hint.trim()
        ? { simulation_hint: raw.simulation_hint.trim() }
        : {}),
      used_reference_ids: usedReferenceIds,
      confidence: loweredConfidence,
      needs_more_context:
        typeof raw.needs_more_context === 'boolean'
          ? raw.needs_more_context
          : loweredConfidence === 'low',
      safety_notes: this.asStringArray(raw.safety_notes).slice(0, 5),
      metadata: {
        llmEnabled: true,
        model: metadata.model,
        retrievalTopK: metadata.retrievalTopK,
        promptTokensApprox: metadata.promptTokensApprox,
        latencyMs: metadata.latencyMs,
        ...(parsed.fallback ? { parseFallback: true } : {}),
      },
    };
  }

  private parseJson(content: string): { value: RawLlmAnswer; fallback: boolean } {
    try {
      return {
        value: JSON.parse(this.stripJsonEnvelope(content)) as RawLlmAnswer,
        fallback: false,
      };
    } catch {
      return {
        value: {
          answer: content,
          confidence: 'low',
          needs_more_context: true,
          used_reference_ids: [],
          safety_notes: ['LLM returned non-JSON content'],
        },
        fallback: true,
      };
    }
  }

  private stripJsonEnvelope(value: string) {
    const trimmed = value.trim();
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    const candidate = fenced?.[1]?.trim() ?? trimmed;
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');

    if (start >= 0 && end > start) {
      return candidate.slice(start, end + 1);
    }

    return candidate;
  }

  private asStringArray(value: unknown) {
    return Array.isArray(value)
      ? value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }

  private asConfidence(value: unknown): 'high' | 'medium' | 'low' {
    return value === 'high' || value === 'medium' || value === 'low'
      ? value
      : 'medium';
  }

  private approximateTokens(messages: LlmChatMessage[]) {
    const chars = messages.reduce((sum, message) => sum + message.content.length, 0);
    return Math.ceil(chars / 4);
  }

  private async writeInteractionLog(
    input: GenerateLlmAnswerInput,
    answer: NormalizedLlmAnswer,
  ) {
    const reportsDir = join(process.cwd(), 'reports');
    const path = join(reportsDir, 'ai-interaction-log.jsonl');
    const row = {
      session_id: input.userContext?.session_id,
      question: this.truncate(input.question, 1000),
      detected: input.detected,
      retrieved_reference_ids: input.references.map((reference) => reference.id),
      used_reference_ids: answer.used_reference_ids,
      answer: this.truncate(answer.answer, 1600),
      confidence: answer.confidence,
      llm_model: answer.metadata.model,
      latency_ms: answer.metadata.latencyMs,
      error: answer.metadata.error,
      created_at: new Date().toISOString(),
    };

    await mkdir(reportsDir, { recursive: true });
    await appendFile(path, `${JSON.stringify(row)}\n`, 'utf8');
  }

  private truncate(value: string, maxLength: number) {
    const normalized = value.replace(/\s+/g, ' ').trim();

    return normalized.length <= maxLength
      ? normalized
      : `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
  }
}
