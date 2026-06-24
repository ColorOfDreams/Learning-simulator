import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TheoryChunkEntity } from '../learning/theory-chunk/theory-chunk.entity';
import { TheoryChunkService } from '../learning/theory-chunk/theory-chunk.service';
import { EmbeddingService } from './embedding.service';
import { toPgVector } from './vector.util';

export type RagReference = {
  id: string;
  title: string;
  text: string;
  topic?: string;
  source?: string;
  metadata?: object;
  score?: number;
  vectorScore?: number;
  keywordScore?: number;
  retrievalType?: 'vector' | 'keyword' | 'hybrid';
};

export type RetrieveTheoryChunksInput = {
  message: string;
  subject?: string;
  grade?: number;
  topic?: string;
  simulationId?: string;
  topK?: number;
};

type VectorSearchRow = {
  id: string;
  title: string | null;
  text: string;
  topic: string;
  source: unknown;
  metadata: unknown;
  vectorScore: number | string;
};

@Injectable()
export class RagRetrievalService {
  private readonly logger = new Logger(RagRetrievalService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly embeddingService: EmbeddingService,
    private readonly theoryChunkService: TheoryChunkService,
  ) {}

  async retrieveTheoryChunks(
    input: RetrieveTheoryChunksInput,
  ): Promise<RagReference[]> {
    const topK = this.normalizeTopK(input.topK);
    const topic = input.topic === 'unknown' ? undefined : input.topic;
    const normalizedInput = { ...input, topic };

    this.logger.debug(
      `Retrieve topic=${topic ?? 'any'} subject=${input.subject ?? 'any'} grade=${input.grade ?? 'any'} simulationId=${input.simulationId ?? 'none'} topK=${topK}`,
    );

    const keywordResults = await this.keywordSearch(normalizedInput);
    let vectorResults: RagReference[] = [];

    try {
      vectorResults = await this.vectorSearch(normalizedInput);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Vector retrieval fallback to keyword: ${reason}`);
    }

    const results = this.mergeAndRank(vectorResults, keywordResults, topK);
    this.logger.debug(
      `Retrieve results vector=${vectorResults.length} keyword=${keywordResults.length} final=${results.length}`,
    );

    return results;
  }

  private async vectorSearch(
    input: RetrieveTheoryChunksInput,
  ): Promise<RagReference[]> {
    const embedding = await this.embeddingService.embedText(input.message);
    let rows = await this.queryVectorRows(embedding, input);

    if (rows.length === 0 && input.topic) {
      this.logger.debug(
        `Vector retrieval found no chunks for topic=${input.topic}; retrying without topic filter`,
      );
      rows = await this.queryVectorRows(embedding, {
        ...input,
        topic: undefined,
      });
    }

    return rows.map((row) => ({
      id: row.id,
      title: row.title ?? row.id,
      text: row.text,
      topic: row.topic,
      ...(this.sourceName(row.source)
        ? { source: this.sourceName(row.source) }
        : {}),
      ...(this.asMetadata(row.metadata)
        ? { metadata: this.asMetadata(row.metadata) }
        : {}),
      vectorScore: this.normalizeScore(Number(row.vectorScore)),
      retrievalType: 'vector' as const,
    }));
  }

  private async queryVectorRows(
    embedding: number[],
    input: RetrieveTheoryChunksInput,
  ): Promise<VectorSearchRow[]> {
    return (await this.dataSource.query(
      `
        SELECT
          id,
          title,
          text,
          topic,
          source,
          metadata,
          1 - (embedding <=> $1::vector) AS "vectorScore"
        FROM theory_chunks
        WHERE embedding IS NOT NULL
          AND is_active = true
          AND ($2::text IS NULL OR subject = $2)
          AND ($3::int IS NULL OR grade = $3)
          AND ($4::text IS NULL OR topic = $4)
        ORDER BY embedding <=> $1::vector
        LIMIT $5
      `,
      [
        toPgVector(embedding),
        input.subject ?? null,
        input.grade ?? null,
        input.topic ?? null,
        10,
      ],
    )) as VectorSearchRow[];
  }

  private async keywordSearch(
    input: RetrieveTheoryChunksInput,
  ): Promise<RagReference[]> {
    const chunks = await this.theoryChunkService.searchForRag(
      input.message,
      input.topic,
    );

    return chunks.map((chunk) => this.fromTheoryChunk(chunk, input.message));
  }

  private mergeAndRank(
    vectorResults: RagReference[],
    keywordResults: RagReference[],
    topK: number,
  ): RagReference[] {
    const merged = new Map<string, RagReference>();

    for (const reference of vectorResults) {
      merged.set(reference.id, { ...reference });
    }

    for (const reference of keywordResults) {
      const existing = merged.get(reference.id);
      merged.set(
        reference.id,
        existing ? { ...existing, ...reference } : reference,
      );
    }

    return [...merged.values()]
      .map((reference) => {
        const hasVector = reference.vectorScore !== undefined;
        const hasKeyword = reference.keywordScore !== undefined;
        const score =
          hasVector && hasKeyword
            ? 0.75 * reference.vectorScore! + 0.25 * reference.keywordScore!
            : hasVector
              ? reference.vectorScore!
              : reference.keywordScore!;

        return {
          ...reference,
          score,
          retrievalType:
            hasVector && hasKeyword
              ? ('hybrid' as const)
              : hasVector
                ? ('vector' as const)
                : ('keyword' as const),
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, topK);
  }

  private fromTheoryChunk(
    chunk: TheoryChunkEntity,
    message: string,
  ): RagReference {
    const source = chunk.source?.sourceName ?? chunk.source?.fileName;

    return {
      id: chunk.id,
      title: chunk.title ?? chunk.id,
      text: chunk.text,
      topic: chunk.topic,
      ...(source ? { source } : {}),
      ...(chunk.metadata ? { metadata: chunk.metadata } : {}),
      keywordScore: this.keywordScore(chunk, message),
      retrievalType: 'keyword',
    };
  }

  private keywordScore(chunk: TheoryChunkEntity, message: string) {
    const tokens = [...new Set(this.normalize(message).split(/\s+/))].filter(
      (token) => token.length >= 2,
    );
    if (tokens.length === 0) {
      return 0;
    }

    const haystack = this.normalize(
      [chunk.title, chunk.text, chunk.topic, ...(chunk.keywords ?? [])]
        .filter(Boolean)
        .join(' '),
    );
    const matchedTokens = tokens.filter((token) => haystack.includes(token));

    return this.normalizeScore(matchedTokens.length / tokens.length);
  }

  private normalize(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }

  private normalizeScore(value: number) {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(1, value));
  }

  private normalizeTopK(value?: number) {
    if (!Number.isInteger(value) || !value || value < 1) {
      return 5;
    }

    return Math.min(value, 10);
  }

  private sourceName(source: unknown) {
    if (typeof source === 'string') {
      return source;
    }

    if (source && typeof source === 'object') {
      const value = source as { sourceName?: unknown; fileName?: unknown };
      if (typeof value.sourceName === 'string') {
        return value.sourceName;
      }
      if (typeof value.fileName === 'string') {
        return value.fileName;
      }
    }

    return undefined;
  }

  private asMetadata(value: unknown): object | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as object)
      : undefined;
  }
}
