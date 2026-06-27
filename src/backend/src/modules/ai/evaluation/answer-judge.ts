import type { ExpectedEvaluationAnswer } from './eval-types';

export type AnswerJudgeReference = {
  id?: string;
  title?: string;
  topic?: string;
  source?: string;
  text?: string;
};

export type AnswerJudgeInput = {
  question: string;
  references: AnswerJudgeReference[];
  expectedAnswer?: ExpectedEvaluationAnswer;
  aiAnswer: string;
};

export type AnswerJudgeScores = {
  correctness: number;
  groundedness: number;
  completeness: number;
  clarity: number;
  citationUsage: number;
  hallucination: boolean;
  reason: string;
};

export type AnswerJudgeResult =
  | {
      enabled: true;
      configured: true;
      scores: AnswerJudgeScores;
      finalAnswerScore: number;
    }
  | {
      enabled: boolean;
      configured: boolean;
      error?: string;
    };

type ChatCompletionResponse = {
  choices?: { message?: { content?: string } }[];
};

export async function judgeAnswerWithLlm(
  input: AnswerJudgeInput,
): Promise<AnswerJudgeResult> {
  const config = readAnswerJudgeConfig();

  if (!config.enabled || !config.apiKey) {
    return {
      enabled: config.enabled,
      configured: Boolean(config.apiKey),
      ...(config.enabled ? { error: 'ANSWER_JUDGE_API_KEY/LLM_API_KEY is missing' } : {}),
    };
  }

  try {
    const response = await fetch(`${trimTrailingSlash(config.baseUrl)}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: buildJudgeSystemPrompt(),
          },
          {
            role: 'user',
            content: buildJudgeUserPrompt(input),
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        enabled: true,
        configured: true,
        error: `Judge request failed: ${response.status} ${body}`,
      };
    }

    const json = (await response.json()) as ChatCompletionResponse;
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      return {
        enabled: true,
        configured: true,
        error: 'Judge response was empty',
      };
    }

    const scores = parseJudgeScores(content);

    return {
      enabled: true,
      configured: true,
      scores,
      finalAnswerScore: computeFinalAnswerScore(scores),
    };
  } catch (error) {
    return {
      enabled: true,
      configured: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function computeFinalAnswerScore(scores: AnswerJudgeScores) {
  return (
    0.4 * scores.correctness +
    0.25 * scores.groundedness +
    0.2 * scores.completeness +
    0.1 * scores.clarity +
    0.05 * scores.citationUsage
  );
}

export function isAnswerJudgeEnabled() {
  return process.env.ANSWER_JUDGE_ENABLED === 'true';
}

function readAnswerJudgeConfig() {
  return {
    enabled: isAnswerJudgeEnabled(),
    apiKey:
      process.env.ANSWER_JUDGE_API_KEY ??
      process.env.LLM_API_KEY ??
      process.env.OPENAI_API_KEY,
    baseUrl:
      process.env.ANSWER_JUDGE_BASE_URL ??
      process.env.LLM_BASE_URL ??
      'https://api.openai.com/v1',
    model:
      process.env.ANSWER_JUDGE_MODEL ??
      process.env.LLM_MODEL ??
      'gpt-4o-mini',
  };
}

function buildJudgeSystemPrompt() {
  return [
    'Bạn là giám khảo Vật lí 11 chấm câu trả lời của hệ thống AI.',
    'Chấm nghiêm, không dễ dãi.',
    'Nếu câu trả lời đúng nhưng không dựa vào CONTEXT được cung cấp thì groundedness phải thấp.',
    'Nếu câu trả lời bịa kiến thức ngoài CONTEXT hoặc khẳng định không có căn cứ thì hallucination=true.',
    'Chỉ trả JSON hợp lệ, không markdown, không giải thích ngoài JSON.',
    'Schema bắt buộc:',
    '{"correctness":0-5,"groundedness":0-5,"completeness":0-5,"clarity":0-5,"citationUsage":0-5,"hallucination":true/false,"reason":"..."}',
  ].join('\n');
}

function buildJudgeUserPrompt(input: AnswerJudgeInput) {
  return [
    'QUESTION:',
    input.question,
    '',
    'CONTEXT:',
    formatReferences(input.references),
    '',
    'EXPECTED ANSWER / REQUIRED CONCEPTS:',
    JSON.stringify(input.expectedAnswer ?? {}, null, 2),
    '',
    'AI ANSWER:',
    input.aiAnswer || '(empty)',
  ].join('\n');
}

function formatReferences(references: AnswerJudgeReference[]) {
  if (references.length === 0) {
    return '(No retrieved context provided.)';
  }

  return references
    .slice(0, 5)
    .map((reference, index) =>
      [
        `[${index + 1}] ${reference.id ?? 'unknown'} - ${reference.title ?? ''}`,
        reference.topic ? `topic: ${reference.topic}` : '',
        reference.source ? `source: ${reference.source}` : '',
        truncate(reference.text ?? '', 800),
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n\n');
}

function parseJudgeScores(value: string): AnswerJudgeScores {
  const parsed = JSON.parse(stripJsonEnvelope(value)) as Record<string, unknown>;

  return {
    correctness: clampScore(parsed.correctness),
    groundedness: clampScore(parsed.groundedness),
    completeness: clampScore(parsed.completeness),
    clarity: clampScore(parsed.clarity),
    citationUsage: clampScore(parsed.citationUsage),
    hallucination: Boolean(parsed.hallucination),
    reason: typeof parsed.reason === 'string' ? parsed.reason : '',
  };
}

function stripJsonEnvelope(value: string) {
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

function clampScore(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(5, number));
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function truncate(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();

  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}
