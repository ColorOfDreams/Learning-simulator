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
  disableVector?: boolean;
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

export type RagVectorDiagnostics = {
  vectorEnabled: boolean;
  embeddingConfigured: boolean;
  embeddingBaseUrl: string;
  embeddingEndpoint: string;
  embeddingModel: string;
  embeddingDimension: number;
  embeddingApiKeyPresent: boolean;
  hasGlobalFetch: boolean;
  pgvectorExtensionEnabled: boolean;
  theoryChunksTotal: number;
  theoryChunksWithEmbedding: number;
  theoryChunksMissingEmbedding: number;
  embeddingDimensionsInDb: number[];
  embeddingIndexCount: number;
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

    if (!input.disableVector) {
      try {
        vectorResults = await this.vectorSearch(normalizedInput);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        if (reason.includes('missing EMBEDDING_API_KEY')) {
          this.logger.warn(reason);
        } else {
          this.logger.warn(`Vector retrieval fallback to keyword: ${reason}`);
        }
      }
    } else {
      this.logger.debug('Vector retrieval disabled for keyword-only baseline.');
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
    try {
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
    } catch (error) {
      throw new Error(`Vector SQL failed: ${this.formatDatabaseError(error)}`);
    }
  }

  async getVectorDiagnostics(): Promise<RagVectorDiagnostics> {
    const embeddingDiagnostics = this.embeddingService.getDiagnostics();
    const [countRow] = (await this.dataSource.query(`
      SELECT
        COUNT(*)::int AS "theoryChunksTotal",
        COUNT(embedding)::int AS "theoryChunksWithEmbedding",
        (COUNT(*) - COUNT(embedding))::int AS "theoryChunksMissingEmbedding"
      FROM theory_chunks
    `)) as Array<{
      theoryChunksTotal: number;
      theoryChunksWithEmbedding: number;
      theoryChunksMissingEmbedding: number;
    }>;
    const dimensionRows = (await this.dataSource.query(`
      SELECT vector_dims(embedding)::int AS dimension
      FROM theory_chunks
      WHERE embedding IS NOT NULL
      GROUP BY vector_dims(embedding)
      ORDER BY dimension ASC
    `)) as Array<{ dimension: number }>;
    const [extensionRow] = (await this.dataSource.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) AS enabled
    `)) as Array<{ enabled: boolean }>;
    const [indexRow] = (await this.dataSource.query(`
      SELECT COUNT(*)::int AS count
      FROM pg_indexes
      WHERE tablename = 'theory_chunks'
        AND indexdef ILIKE '%embedding%'
    `)) as Array<{ count: number }>;

    const embeddingDimensionsInDb = dimensionRows
      .map((row) => Number(row.dimension))
      .filter((value) => Number.isFinite(value));
    const pgvectorExtensionEnabled = Boolean(extensionRow?.enabled);
    const theoryChunksWithEmbedding =
      Number(countRow?.theoryChunksWithEmbedding) || 0;
    const dimensionMatches =
      embeddingDimensionsInDb.length === 1 &&
      embeddingDimensionsInDb[0] === embeddingDiagnostics.dimension;

    return {
      vectorEnabled:
        embeddingDiagnostics.hasApiKey &&
        embeddingDiagnostics.hasGlobalFetch &&
        pgvectorExtensionEnabled &&
        theoryChunksWithEmbedding > 0 &&
        dimensionMatches,
      embeddingConfigured: embeddingDiagnostics.hasApiKey,
      embeddingBaseUrl: embeddingDiagnostics.baseUrl,
      embeddingEndpoint: embeddingDiagnostics.endpoint,
      embeddingModel: embeddingDiagnostics.model,
      embeddingDimension: embeddingDiagnostics.dimension,
      embeddingApiKeyPresent: embeddingDiagnostics.hasApiKey,
      hasGlobalFetch: embeddingDiagnostics.hasGlobalFetch,
      pgvectorExtensionEnabled,
      theoryChunksTotal: Number(countRow?.theoryChunksTotal) || 0,
      theoryChunksWithEmbedding,
      theoryChunksMissingEmbedding:
        Number(countRow?.theoryChunksMissingEmbedding) || 0,
      embeddingDimensionsInDb,
      embeddingIndexCount: Number(indexRow?.count) || 0,
    };
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

  private formatDatabaseError(error: unknown) {
    if (!(error instanceof Error)) {
      return String(error);
    }

    const fields = error as Error & {
      code?: string;
      detail?: string;
      hint?: string;
    };
    const parts = [
      `name=${error.name}`,
      `message=${error.message}`,
      fields.code ? `code=${fields.code}` : '',
      fields.detail ? `detail=${fields.detail}` : '',
      fields.hint ? `hint=${fields.hint}` : '',
    ].filter(Boolean);

    return parts.join(' ');
  }
}
