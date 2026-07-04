import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiUsageService } from './ai-usage.service';

type EmbeddingApiResponse = {
  data?: Array<{ embedding?: unknown }>;
  usage?: { prompt_tokens?: number; total_tokens?: number };
};

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly aiUsageService: AiUsageService,
  ) {}

  get model() {
    return (
      this.configService.get<string>('EMBEDDING_MODEL') ??
      'text-embedding-3-small'
    );
  }

  get dimension() {
    const configuredDimension = Number(
      this.configService.get<string>('EMBEDDING_DIMENSION') ?? 1536,
    );

    if (!Number.isInteger(configuredDimension) || configuredDimension <= 0) {
      throw new Error('EMBEDDING_DIMENSION must be a positive integer.');
    }

    return configuredDimension;
  }

  isConfigured() {
    return Boolean(this.configService.get<string>('EMBEDDING_API_KEY'));
  }

  get baseUrl() {
    return this.trimTrailingSlash(
      this.configService.get<string>('EMBEDDING_BASE_URL') ??
        'https://api.openai.com/v1',
    );
  }

  get endpoint() {
    return `${this.baseUrl}/embeddings`;
  }

  getDiagnostics() {
    return {
      baseUrl: this.baseUrl,
      endpoint: this.endpoint,
      model: this.model,
      dimension: this.dimension,
      hasApiKey: this.isConfigured(),
      hasGlobalFetch: typeof fetch === 'function',
    };
  }

  async embedText(text: string): Promise<number[]> {
    const [embedding] = await this.embedBatch([text]);
    return embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const apiKey = this.configService.get<string>('EMBEDDING_API_KEY');
    if (!apiKey) {
      throw new Error('Vector retrieval disabled: missing EMBEDDING_API_KEY.');
    }

    const diagnostics = this.getDiagnostics();
    this.logger.debug(
      `Embedding request endpoint=${diagnostics.endpoint} model=${diagnostics.model} dimension=${diagnostics.dimension} hasApiKey=${diagnostics.hasApiKey} hasGlobalFetch=${diagnostics.hasGlobalFetch}`,
    );

    let response: Response;

    try {
      response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          input: texts,
          // OpenAI supports controlling output dimensions; Mistral and others do not.
          ...(this.baseUrl.includes('openai.com')
            ? { dimensions: this.dimension }
            : {}),
        }),
      });
    } catch (error) {
      const detail = this.formatFetchError(error);
      throw new Error(
        `Embedding request failed before response: endpoint=${this.endpoint} model=${this.model} dimension=${this.dimension} ${detail}`,
      );
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Embedding request failed: status=${response.status} body=${this.truncate(body)}`,
      );
    }

    const json = (await response.json()) as EmbeddingApiResponse;
    if (!Array.isArray(json.data) || json.data.length !== texts.length) {
      throw new Error(
        `Embedding response shape invalid: expected data[${texts.length}], got ${json.data?.length ?? 0}.`,
      );
    }

    if (json.usage) {
      void this.aiUsageService.log({
        model: this.model,
        promptTokens: json.usage.prompt_tokens ?? 0,
        completionTokens: 0,
        kind: 'embedding',
      });
    }

    return json.data.map((item, index) =>
      this.validateEmbedding(item.embedding, index),
    );
  }

  private validateEmbedding(value: unknown, index: number) {
    if (
      !Array.isArray(value) ||
      value.length !== this.dimension ||
      !value.every((item) => typeof item === 'number' && Number.isFinite(item))
    ) {
      throw new Error(
        `Embedding ${index} must contain ${this.dimension} finite numeric values.`,
      );
    }

    return value;
  }

  private trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, '');
  }

  private formatFetchError(error: unknown) {
    if (!(error instanceof Error)) {
      return `error=${String(error)}`;
    }

    const cause =
      'cause' in error && error.cause
        ? ` cause=${this.truncate(String(error.cause))}`
        : '';

    return `name=${error.name} message=${this.truncate(error.message)}${cause}`;
  }

  private truncate(value: string, maxLength = 500) {
    const normalized = value.replace(/\s+/g, ' ').trim();

    return normalized.length <= maxLength
      ? normalized
      : `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
  }
}
