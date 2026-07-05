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
  subject?: string;
  grade?: number;
  chapter?: string;
  lessonId?: string;
  lessonTitle?: string;
  topic?: string;
  source?: string;
  metadata?: object;
  keywords?: string[];
  validationStatus?: string;
  score?: number;
  finalScore?: number;
  vectorScore?: number;
  keywordScore?: number;
  conceptScore?: number;
  conceptBoost?: number;
  titleBoost?: number;
  metadataBoost?: number;
  formulaBoost?: number;
  textBoost?: number;
  topicBoost?: number;
  subjectBoost?: number;
  gradeBoost?: number;
  chapterBoost?: number;
  lessonBoost?: number;
  sectionBoost?: number;
  validationBoost?: number;
  retrievalType?: 'vector' | 'keyword' | 'hybrid';
};

export type RetrieveTheoryChunksInput = {
  message: string;
  subject?: string;
  grade?: number;
  chapter?: string;
  lessonId?: string;
  questionType?: string;
  topic?: string;
  simulationId?: string;
  topK?: number;
  disableVector?: boolean;
};

type VectorSearchRow = {
  id: string;
  title: string | null;
  text: string;
  subject: string;
  grade: number;
  chapter: string;
  lessonId: string | null;
  lessonTitle: string | null;
  topic: string;
  source: unknown;
  metadata: unknown;
  keywords: unknown;
  validationStatus: string | null;
  vectorScore: number | string;
};

type RagRetrievalConfig = {
  vectorCandidates: number;
  keywordCandidates: number;
  finalTopK: number;
  vectorWeight: number;
  keywordWeight: number;
  conceptBoostWeight: number;
};

type ConceptGroup = {
  name: string;
  aliases: string[];
};

const PHYSICS_CONCEPT_GROUPS: ConceptGroup[] = [
  { name: 'period', aliases: ['chu kì', 'chu kỳ', 'T'] },
  {
    name: 'angular_frequency',
    aliases: ['omega', 'ω', 'tần số góc', 'rad/s'],
  },
  { name: 'initial_phase', aliases: ['phi', 'φ', 'pha ban đầu'] },
  {
    name: 'amplitude',
    aliases: ['biên độ', 'A', 'li độ cực đại', 'độ lệch cực đại'],
  },
  { name: 'displacement', aliases: ['li độ', 'x', 'vị trí cân bằng'] },
  { name: 'phase_difference', aliases: ['độ lệch pha', 'lệch pha'] },
  { name: 'potential_energy', aliases: ['thế năng', 'Wt', '1/2 kx^2'] },
  {
    name: 'mechanical_energy',
    aliases: ['cơ năng', 'W', '1/2 kA^2', 'bảo toàn'],
  },
  { name: 'acceleration', aliases: ['gia tốc', 'a', '-ω²x'] },
  { name: 'velocity', aliases: ['vận tốc', 'v', 'vmax', 'ωA'] },
  {
    name: 'spring_period',
    aliases: ['con lắc lò xo', 'khối lượng', 'độ cứng', 'm', 'k'],
  },
];

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
    const config = this.readConfig();
    const topK = this.normalizeTopK(input.topK, config);
    const topic = input.topic === 'unknown' ? undefined : input.topic;
    const normalizedInput = { ...input, topic };
    const expandedInput = {
      ...normalizedInput,
      message: this.expandQuery(input.message),
    };

    this.logger.debug(
      `Retrieve topic=${topic ?? 'any'} subject=${input.subject ?? 'any'} grade=${input.grade ?? 'any'} simulationId=${input.simulationId ?? 'none'} topK=${topK} vectorCandidates=${config.vectorCandidates} keywordCandidates=${config.keywordCandidates}`,
    );

    const keywordResults = await this.keywordSearch(expandedInput, config);
    let vectorResults: RagReference[] = [];

    if (!input.disableVector) {
      try {
        vectorResults = await this.vectorSearch(expandedInput, config);
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

    const results = this.mergeAndRank(
      vectorResults,
      keywordResults,
      normalizedInput,
      topK,
      config,
    );
    this.logger.debug(
      `Retrieve results vector=${vectorResults.length} keyword=${keywordResults.length} final=${results.length}`,
    );

    return results;
  }

  private async vectorSearch(
    input: RetrieveTheoryChunksInput,
    config: RagRetrievalConfig,
  ): Promise<RagReference[]> {
    const embedding = await this.embeddingService.embedText(input.message);
    let rows = await this.queryVectorRows(embedding, input, config);

    if (rows.length === 0 && input.topic) {
      this.logger.debug(
        `Vector retrieval found no chunks for topic=${input.topic}; retrying without topic filter`,
      );
      rows = await this.queryVectorRows(
        embedding,
        {
          ...input,
          topic: undefined,
        },
        config,
      );
    }

    if (rows.length === 0 && input.grade !== undefined) {
      this.logger.debug(
        `Vector retrieval found no chunks for grade=${input.grade}; retrying without grade filter`,
      );
      rows = await this.queryVectorRows(
        embedding,
        {
          ...input,
          grade: undefined,
        },
        config,
      );
    }

    if (rows.length === 0 && input.topic && input.grade !== undefined) {
      this.logger.debug(
        'Vector retrieval still empty; retrying without topic and grade filters',
      );
      rows = await this.queryVectorRows(
        embedding,
        {
          ...input,
          topic: undefined,
          grade: undefined,
        },
        config,
      );
    }

    return rows.map((row) => ({
      id: row.id,
      title: row.title ?? row.id,
      text: row.text,
      subject: row.subject,
      grade: row.grade,
      chapter: row.chapter,
      ...(row.lessonId ? { lessonId: row.lessonId } : {}),
      ...(row.lessonTitle ? { lessonTitle: row.lessonTitle } : {}),
      topic: row.topic,
      ...(this.sourceName(row.source)
        ? { source: this.sourceName(row.source) }
        : {}),
      ...(this.asMetadata(row.metadata)
        ? { metadata: this.asMetadata(row.metadata) }
        : {}),
      keywords: this.asStringArray(row.keywords),
      ...(row.validationStatus
        ? { validationStatus: row.validationStatus }
        : {}),
      vectorScore: this.normalizeScore(Number(row.vectorScore)),
      retrievalType: 'vector' as const,
    }));
  }

  private async queryVectorRows(
    embedding: number[],
    input: RetrieveTheoryChunksInput,
    config: RagRetrievalConfig,
  ): Promise<VectorSearchRow[]> {
    try {
      return (await this.dataSource.query(
        `
          SELECT
            id,
            title,
            text,
            subject,
            grade,
            chapter,
            lesson_id AS "lessonId",
            lesson_title AS "lessonTitle",
            topic,
            source,
            metadata,
            keywords,
            validation_status AS "validationStatus",
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
          config.vectorCandidates,
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
    config: RagRetrievalConfig,
  ): Promise<RagReference[]> {
    const chunks = await this.theoryChunkService.findAll();

    const rank = (grade: number | undefined) =>
      chunks
        .filter(
          (chunk) =>
            (!input.subject || chunk.subject === input.subject) &&
            (grade === undefined || chunk.grade === grade),
        )
        .map((chunk) => ({
          chunk,
          score: this.keywordScore(chunk, input.message),
          topicMatched: Boolean(input.topic && chunk.topic === input.topic),
        }))
        .filter((item) => item.score > 0)
        .sort((left, right) => {
          if (left.topicMatched !== right.topicMatched) {
            return left.topicMatched ? -1 : 1;
          }

          if (right.score !== left.score) {
            return right.score - left.score;
          }

          return left.chunk.id.localeCompare(right.chunk.id);
        })
        .slice(0, config.keywordCandidates)
        .map((item) => item.chunk);

    let rankedChunks = rank(input.grade);

    if (rankedChunks.length === 0 && input.grade !== undefined) {
      this.logger.debug(
        `Keyword retrieval found no chunks for grade=${input.grade}; retrying without grade filter`,
      );
      rankedChunks = rank(undefined);
    }

    return rankedChunks.map((chunk) => this.fromTheoryChunk(chunk, input.message));
  }

  private mergeAndRank(
    vectorResults: RagReference[],
    keywordResults: RagReference[],
    input: RetrieveTheoryChunksInput,
    topK: number,
    config: RagRetrievalConfig,
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
        const boosts = this.fieldAwareBoosts(reference, input);
        const conceptScore = boosts.conceptBoost;
        const score =
          (hasVector ? config.vectorWeight * reference.vectorScore! : 0) +
          (hasKeyword ? config.keywordWeight * reference.keywordScore! : 0) +
          config.conceptBoostWeight * boosts.totalBoost;

        return {
          ...reference,
          score,
          finalScore: score,
          conceptScore,
          conceptBoost: boosts.conceptBoost,
          titleBoost: boosts.titleBoost,
          metadataBoost: boosts.metadataBoost,
          formulaBoost: boosts.formulaBoost,
          textBoost: boosts.textBoost,
          topicBoost: boosts.topicBoost,
          subjectBoost: boosts.subjectBoost,
          gradeBoost: boosts.gradeBoost,
          chapterBoost: boosts.chapterBoost,
          lessonBoost: boosts.lessonBoost,
          sectionBoost: boosts.sectionBoost,
          validationBoost: boosts.validationBoost,
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
      subject: chunk.subject,
      grade: chunk.grade,
      chapter: chunk.chapter,
      ...(chunk.lessonId ? { lessonId: chunk.lessonId } : {}),
      ...(chunk.lessonTitle ? { lessonTitle: chunk.lessonTitle } : {}),
      topic: chunk.topic,
      ...(source ? { source } : {}),
      ...(chunk.metadata ? { metadata: chunk.metadata } : {}),
      keywords: chunk.keywords ?? [],
      ...(chunk.validationStatus
        ? { validationStatus: chunk.validationStatus }
        : {}),
      keywordScore: this.keywordScore(chunk, message),
      retrievalType: 'keyword',
    };
  }

  private keywordScore(chunk: TheoryChunkEntity, message: string) {
    const tokens = this.searchTokens(message);
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

  private fieldAwareBoosts(
    reference: RagReference,
    input: RetrieveTheoryChunksInput,
  ) {
    const activeConcepts = this.activeConceptGroups(input.message);
    const activeAliases = activeConcepts.flatMap((group) =>
      group.aliases.map((alias) => this.normalizeAlias(alias)),
    );
    const normalizedTitle = this.normalize(reference.title);
    const normalizedText = this.normalize(reference.text);
    const normalizedMetadata = this.normalize(
      [
        reference.topic,
        reference.metadata ? JSON.stringify(reference.metadata) : '',
        ...(reference.keywords ?? []),
      ]
        .filter(Boolean)
        .join(' '),
    );
    const conceptBoost = this.conceptScore(reference, input) * 0.2;
    const titleBoost = this.normalizedAliasMatch(
      normalizedTitle,
      activeAliases,
      0.25,
    );
    const metadataBoost = this.normalizedAliasMatch(
      normalizedMetadata,
      activeAliases,
      0.25,
    );
    const formulaBoost = this.normalizedAliasMatch(
      [normalizedTitle, normalizedText, normalizedMetadata].join(' '),
      this.formulaAliases(input.message, activeAliases),
      0.1,
    );
    const formulaQueryBoost = this.formulaQueryBoost(reference, input);
    const definitionBoost =
      this.isDefinitionQuestion(input.message) &&
      this.hasDefinitionPattern(normalizedText, activeAliases)
        ? 0.25
        : 0;
    const textBoost = Math.min(
      0.35,
      this.normalizedAliasMatch(normalizedText, activeAliases, 0.15) +
        definitionBoost,
    );
    const topicBoost = input.topic && reference.topic === input.topic ? 0.05 : 0;
    const subjectBoost =
      input.subject && reference.subject === input.subject ? 0.03 : 0;
    const gradeBoost =
      input.grade !== undefined && reference.grade === input.grade ? 0.03 : 0;
    const chapterBoost =
      input.chapter && reference.chapter === input.chapter ? 0.06 : 0;
    const lessonBoost =
      input.lessonId && reference.lessonId === input.lessonId ? 0.12 : 0;
    const sectionBoost = this.sectionCueBoost(reference, input.message);
    const validationBoost = this.validationStatusBoost(
      reference.validationStatus,
    );
    const finalFormulaBoost = Math.max(formulaBoost, formulaQueryBoost);
    const totalBoost = this.clampBoost(
      conceptBoost +
        titleBoost +
        metadataBoost +
        finalFormulaBoost +
        textBoost +
        topicBoost +
        subjectBoost +
        gradeBoost +
        chapterBoost +
        lessonBoost +
        sectionBoost +
        validationBoost,
    );

    return {
      conceptBoost,
      titleBoost,
      metadataBoost,
      formulaBoost: finalFormulaBoost,
      textBoost,
      topicBoost,
      subjectBoost,
      gradeBoost,
      chapterBoost,
      lessonBoost,
      sectionBoost,
      validationBoost,
      totalBoost,
    };
  }

  private conceptScore(
    reference: RagReference,
    input: RetrieveTheoryChunksInput,
  ) {
    const activeConcepts = this.activeConceptGroups(input.message);
    if (activeConcepts.length === 0) {
      return input.topic && reference.topic === input.topic ? 0.2 : 0;
    }

    const normalizedTitle = this.normalize(reference.title);
    const normalizedText = this.normalize(reference.text);
    const normalizedMetadata = this.normalize(
      [
        reference.topic,
        reference.metadata ? JSON.stringify(reference.metadata) : '',
        ...(reference.keywords ?? []),
      ]
        .filter(Boolean)
        .join(' '),
    );
    let score = 0;

    for (const group of activeConcepts) {
      const aliases = group.aliases.map((alias) => this.normalizeAlias(alias));
      const titleMatched = aliases.some((alias) =>
        this.hasExactAlias(normalizedTitle, alias),
      );
      const textMatched = aliases.some((alias) =>
        this.hasExactAlias(normalizedText, alias),
      );
      const metadataMatched = aliases.some((alias) =>
        this.hasExactAlias(normalizedMetadata, alias),
      );

      if (titleMatched) {
        score += 0.45;
      }
      if (textMatched) {
        score += 0.35;
      }
      if (metadataMatched) {
        score += 0.15;
      }
    }

    if (input.topic && reference.topic === input.topic) {
      score += 0.2;
    }

    return this.normalizeScore(score / Math.max(1, activeConcepts.length));
  }

  private expandQuery(message: string) {
    const activeGroups = this.activeConceptGroups(message);
    const aliases = activeGroups.flatMap((group) => group.aliases);

    return aliases.length === 0 ? message : [message, ...aliases].join(' ');
  }

  private activeConceptGroups(message: string) {
    const normalizedMessage = this.normalize(message);

    return PHYSICS_CONCEPT_GROUPS.filter((group) =>
      group.aliases
        .map((alias) => this.normalizeAlias(alias))
        .some((alias) => this.hasExactAlias(normalizedMessage, alias)),
    );
  }

  private searchTokens(message: string) {
    const tokens = this.normalize(message)
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2 || this.isPhysicsSymbol(token));

    return [...new Set(tokens)];
  }

  private normalizeAlias(alias: string) {
    return this.normalize(alias).trim();
  }

  private hasExactAlias(haystack: string, alias: string) {
    if (!alias) {
      return false;
    }

    if (/^[a-z0-9]$/i.test(alias)) {
      return new RegExp(
        `(^|[^a-z0-9])${this.escapeRegex(alias)}([^a-z0-9]|$)`,
      ).test(haystack);
    }

    return haystack.includes(alias);
  }

  private normalizedAliasMatch(
    haystack: string,
    aliases: string[],
    maxScore: number,
  ) {
    const uniqueAliases = [...new Set(aliases.filter(Boolean))];
    if (uniqueAliases.length === 0) {
      return 0;
    }

    const matchedCount = uniqueAliases.filter((alias) =>
      this.hasExactAlias(haystack, alias),
    ).length;

    return Math.min(maxScore, (matchedCount / uniqueAliases.length) * maxScore);
  }

  private formulaAliases(message: string, conceptAliases: string[]) {
    const normalizedMessage = this.normalize(message);
    const symbolAliases = conceptAliases.filter(
      (alias) =>
        /^[a-z0-9]$/i.test(alias) ||
        alias.includes('/') ||
        alias.includes('omega') ||
        alias.includes('phi') ||
        alias.includes('1/2'),
    );
    const querySymbols = this.searchTokens(normalizedMessage).filter((token) =>
      this.isPhysicsSymbol(token),
    );

    return [...new Set([...symbolAliases, ...querySymbols])];
  }

  private isDefinitionQuestion(message: string) {
    const normalizedMessage = this.normalize(message);

    return [
      'dinh nghia',
      'la gi',
      'duoc hieu',
      'cho biet',
      'la cac dai luong gi',
    ].some((phrase) => normalizedMessage.includes(phrase));
  }

  private hasDefinitionPattern(haystack: string, aliases: string[]) {
    return aliases.some((alias) => {
      if (!alias || /^[a-z0-9]$/i.test(alias)) {
        return false;
      }

      const escaped = this.escapeRegex(alias);
      return new RegExp(`${escaped}.{0,40}(^|\\s)la(\\s|$)`).test(haystack);
    });
  }

  private formulaQueryBoost(
    reference: RagReference,
    input: RetrieveTheoryChunksInput,
  ) {
    if (!this.isFormulaAwareQuery(input)) {
      return 0;
    }

    const haystack = this.decodeMojibake(
      [
        reference.title,
        reference.text,
        reference.metadata ? JSON.stringify(reference.metadata) : '',
      ]
        .filter(Boolean)
        .join(' '),
    );
    const hasFormula = this.hasFormulaSyntax(haystack);
    const querySymbols = this.mathSymbols(input.message);
    const referenceSymbols = new Set(this.mathSymbols(haystack));
    const matchedSymbols = querySymbols.filter((symbol) =>
      referenceSymbols.has(symbol),
    ).length;
    const symbolBoost =
      querySymbols.length > 0
        ? Math.min(0.12, (matchedSymbols / querySymbols.length) * 0.12)
        : 0;

    return (hasFormula ? 0.12 : 0) + symbolBoost;
  }

  private sectionCueBoost(reference: RagReference, message: string) {
    const cues = this.sectionCues(message);
    if (cues.length === 0) {
      return 0;
    }

    const title = this.normalize(reference.title);
    const text = this.normalize(reference.text);
    const metadata = this.normalize(
      [
        reference.topic,
        reference.lessonTitle,
        reference.metadata ? JSON.stringify(reference.metadata) : '',
        ...(reference.keywords ?? []),
      ]
        .filter(Boolean)
        .join(' '),
    );
    let score = 0;

    for (const cue of cues) {
      if (this.hasExactAlias(title, cue)) {
        score = Math.max(score, 0.55);
      } else if (
        text.startsWith(cue) ||
        text.startsWith(`**${cue}`) ||
        this.hasExactAlias(metadata, cue)
      ) {
        score = Math.max(score, 0.35);
      } else if (this.hasExactAlias(text, cue)) {
        score = Math.max(score, 0.2);
      }
    }

    return score;
  }

  private sectionCues(message: string) {
    const normalized = this.normalize(message);
    const cues: string[] = [];
    const directCues = [
      'giai',
      'van dung',
      'an dung',
      'chu y',
      'de bai',
      'nhan xet',
      'kien thuc',
    ];

    for (const cue of directCues) {
      if (normalized.includes(cue)) {
        cues.push(cue);
      }
    }

    for (const match of normalized.matchAll(/\bhd\s*(\d+)\b/g)) {
      cues.push(`hd${match[1]}`);
    }
    for (const match of normalized.matchAll(/\bluyen tap\s*(\d+)\b/g)) {
      cues.push(`luyen tap ${match[1]}`);
    }
    for (const match of normalized.matchAll(/\bbuoc\s*(\d+)\b/g)) {
      cues.push(`buoc ${match[1]}`);
    }

    return [...new Set(cues)];
  }

  private validationStatusBoost(status: string | undefined) {
    const normalized = this.normalize(status ?? '');
    if (
      ['reviewed', 'verified', 'solver verified', 'solver_verified'].includes(
        normalized,
      )
    ) {
      return 0.08;
    }
    if (normalized === 'ai generated' || normalized === 'ai_generated') {
      return 0.02;
    }
    if (normalized === 'needs review' || normalized === 'needs_review') {
      return -0.02;
    }

    return 0;
  }

  private isFormulaAwareQuery(input: RetrieveTheoryChunksInput) {
    return (
      input.questionType === 'formula' ||
      input.questionType === 'calculation' ||
      this.hasFormulaSyntax(input.message)
    );
  }

  private hasFormulaSyntax(value: string) {
    return /[$=<>≤≥+\-*/^]|\\frac|\\sqrt|\\begin|omega|lambda|pi|sin|cos|tan|log|[πλµωφΩ]/i.test(
      this.decodeMojibake(value),
    );
  }

  private mathSymbols(value: string) {
    const decoded = this.decodeMojibake(value)
      .toLowerCase()
      .replace(/\\omega|ω/g, ' omega ')
      .replace(/\\varphi|φ/g, ' phi ')
      .replace(/\\lambda|λ/g, ' lambda ')
      .replace(/\\pi|π/g, ' pi ');
    const symbols = decoded.match(
      /\b(?:omega|phi|lambda|pi|sin|cos|tan|log|sqrt|frac)\b|[=<>≤≥+\-*/^]|\b[a-z]\b/g,
    );

    return [...new Set(symbols ?? [])];
  }

  private isPhysicsSymbol(token: string) {
    return ['a', 'f', 'k', 'm', 't', 'v', 'w', 'x'].includes(token);
  }

  private normalize(value: string) {
    return this.decodeMojibake(value)
      .toLowerCase()
      .replace(/ω/g, ' omega ')
      .replace(/φ/g, ' phi ')
      .replace(/²/g, '2')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/ð/g, 'd')
      .replace(/[^a-z0-9/+\-.]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeScore(value: number) {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(1, value));
  }

  private clampBoost(value: number) {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(-0.25, Math.min(1, value));
  }

  private normalizeTopK(value: number | undefined, config: RagRetrievalConfig) {
    if (!Number.isInteger(value) || !value || value < 1) {
      return config.finalTopK;
    }

    return Math.min(value, 10);
  }

  private readConfig(): RagRetrievalConfig {
    return {
      vectorCandidates: this.readIntegerEnv('RAG_VECTOR_CANDIDATES', 30, 1, 100),
      keywordCandidates: this.readIntegerEnv('RAG_KEYWORD_CANDIDATES', 30, 1, 100),
      finalTopK: this.readIntegerEnv('RAG_FINAL_TOP_K', 5, 1, 10),
      vectorWeight: this.readNumberEnv('RAG_VECTOR_WEIGHT', 0.65, 0, 1),
      keywordWeight: this.readNumberEnv('RAG_KEYWORD_WEIGHT', 0.25, 0, 1),
      conceptBoostWeight: this.readNumberEnv(
        'RAG_CONCEPT_BOOST_WEIGHT',
        0.1,
        0,
        1,
      ),
    };
  }

  private readIntegerEnv(
    name: string,
    fallback: number,
    min: number,
    max: number,
  ) {
    const parsed = Number.parseInt(process.env[name] ?? '', 10);

    if (!Number.isInteger(parsed)) {
      return fallback;
    }

    return Math.max(min, Math.min(max, parsed));
  }

  private readNumberEnv(
    name: string,
    fallback: number,
    min: number,
    max: number,
  ) {
    const parsed = Number.parseFloat(process.env[name] ?? '');

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.max(min, Math.min(max, parsed));
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

  private asStringArray(value: unknown): string[] {
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : [];
  }

  private decodeMojibake(value: string) {
    if (!/[ÃÄÆÂ]|á[º»]/.test(value)) {
      return value;
    }

    return Buffer.from(value, 'latin1').toString('utf8');
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
