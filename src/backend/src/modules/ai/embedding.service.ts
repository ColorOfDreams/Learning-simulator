import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type EmbeddingApiResponse = {
  data?: Array<{ embedding?: unknown }>;
};

@Injectable()
export class EmbeddingService {
  constructor(private readonly configService: ConfigService) {}

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
      throw new Error(
        'EMBEDDING_API_KEY is required to create TheoryChunk embeddings.',
      );
    }

    const baseUrl = this.trimTrailingSlash(
      this.configService.get<string>('EMBEDDING_BASE_URL') ??
        'https://api.openai.com/v1',
    );
    const response = await fetch(`${baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
        // OpenAI supports controlling output dimensions; Mistral and others do not
        ...(baseUrl.includes('openai.com')
          ? { dimensions: this.dimension }
          : {}),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Embedding request failed: ${response.status} ${body}`);
    }

    const json = (await response.json()) as EmbeddingApiResponse;
    if (!Array.isArray(json.data) || json.data.length !== texts.length) {
      throw new Error(
        `Embedding response returned ${json.data?.length ?? 0} vectors for ${texts.length} inputs.`,
      );
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
}
