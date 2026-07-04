import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type LlmChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LlmCompleteOptions = {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  responseFormat?: 'json_object';
};

export type LlmCompletionResult = {
  content: string;
  model: string;
  latencyMs: number;
};

@Injectable()
export class LlmService {
  constructor(private readonly configService: ConfigService) {}

  isConfigured() {
    return Boolean(this.readApiKey());
  }

  getModel() {
    return this.configService.get<string>('LLM_MODEL') ?? 'gpt-4o-mini';
  }

  async complete(messages: LlmChatMessage[], options: LlmCompleteOptions = {}) {
    const result = await this.completeWithMetadata(messages, options);
    return result?.content;
  }

  async completeWithMetadata(
    messages: LlmChatMessage[],
    options: LlmCompleteOptions = {},
  ): Promise<LlmCompletionResult | undefined> {
    const apiKey = this.readApiKey();

    if (!apiKey) {
      return undefined;
    }

    const baseUrl = this.trimTrailingSlash(
      this.configService.get<string>('LLM_BASE_URL') ??
        'https://api.openai.com/v1',
    );
    const model = this.getModel();
    const temperature = Number(
      options.temperature ??
        this.configService.get<string>('LLM_TEMPERATURE') ??
        0.2,
    );

    const maxTokens = Number(
      options.maxTokens ??
        this.configService.get<string>('LLM_MAX_TOKENS') ??
        700,
    );
    const timeoutMs = Number(
      options.timeoutMs ??
        this.configService.get<string>('LLM_TIMEOUT_MS') ??
        30000,
    );
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = Date.now();

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          ...(options.responseFormat
            ? { response_format: { type: options.responseFormat } }
            : {}),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`LLM request failed: ${response.status} ${body}`);
      }

      const json = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = json.choices?.[0]?.message?.content?.trim();

      return content
        ? {
            content,
            model,
            latencyMs: Date.now() - startedAt,
          }
        : undefined;
    } finally {
      clearTimeout(timeout);
    }
  }

  private trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, '');
  }

  private readApiKey() {
    return (
      this.configService.get<string>('LLM_API_KEY') ??
      this.configService.get<string>('OPENAI_API_KEY')
    );
  }
}
