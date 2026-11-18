import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiUsageService } from './ai-usage.service';
import {
  LlmKeyPool,
  LlmPoolError,
  parseLlmKeys,
  retryAfterMs,
} from './llm-key-pool';

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
  private readonly pool: LlmKeyPool;
  private readonly logger = new Logger(LlmService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly aiUsageService: AiUsageService,
  ) {
    this.pool = new LlmKeyPool(
      parseLlmKeys(
        this.readApiKey(),
        configService.get<string>('LLM_API_KEYS'),
      ),
      {
        maxConcurrent: this.readLimit('LLM_MAX_CONCURRENT', 8),
        perKeyConcurrent: this.readLimit('LLM_KEY_MAX_CONCURRENT', 2),
        maxQueue: this.readLimit('LLM_MAX_QUEUE', 32),
        queueTimeoutMs: this.readLimit('LLM_QUEUE_TIMEOUT_MS', 3000),
        requestsPerMinute: this.readLimit('LLM_MAX_REQUESTS_PER_MINUTE', 30),
      },
    );
    this.logger.log(
      `LLM pool configured with ${this.pool.getStatus().configured} credentials; admission limits are per API process`,
    );
  }

  isConfigured() {
    return this.pool.getStatus().configured > 0;
  }

  getPoolStatus() {
    return this.pool.getStatus();
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
    if (!this.isConfigured()) {
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
    const startedAt = Date.now();
    const deadline = startedAt + Math.max(1, timeoutMs);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const lease = await this.pool.acquire(deadline);
      const controller = new AbortController();
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        lease.release();
        throw new LlmPoolError('LLM request deadline exceeded');
      }
      const timeout = setTimeout(() => controller.abort(), remaining);
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${lease.key}`,
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
          if (response.status === 401 || response.status === 403) {
            this.pool.disable(lease.slot);
            if (attempt === 0) {
              await response.body?.cancel();
              continue;
            }
          } else if (response.status === 429) {
            this.pool.pauseProvider(
              retryAfterMs(response.headers.get('retry-after')),
            );
          } else if (response.status >= 500) {
            this.pool.pauseProvider(2000);
          }
          await response.body?.cancel();
          throw new LlmPoolError(
            `LLM upstream rejected request (${response.status})`,
          );
        }

        const json = (await response.json()) as {
          choices?: { message?: { content?: string } }[];
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        const content = json.choices?.[0]?.message?.content?.trim();

        if (json.usage) {
          void this.aiUsageService.log({
            model,
            promptTokens: json.usage.prompt_tokens ?? 0,
            completionTokens: json.usage.completion_tokens ?? 0,
          });
        }

        return content
          ? {
              content,
              model,
              latencyMs: Date.now() - startedAt,
            }
          : undefined;
      } catch (error) {
        if (error instanceof LlmPoolError) throw error;
        this.pool.pauseProvider(2000);
        throw new LlmPoolError(
          controller.signal.aborted
            ? 'LLM request deadline exceeded'
            : 'LLM upstream unavailable',
        );
      } finally {
        clearTimeout(timeout);
        lease.release();
      }
    }
    throw new LlmPoolError('No usable LLM credentials');
  }

  private readLimit(name: string, fallback: number) {
    const value = Number(this.configService.get<string>(name) ?? fallback);
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new LlmPoolError(`${name} must be a positive integer`);
    }
    return value;
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
