import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { Repository } from 'typeorm';
import { LearningItemEntity } from './learning-item/learning-item.entity';
import { ProblemPatternEntity } from './problem-pattern/problem-pattern.entity';
import { SimulationTemplateEntity } from './simulation-template/simulation-template.entity';
import { TheoryChunkEntity } from './theory-chunk/theory-chunk.entity';

type RawLearningDataset = {
  manifest?: {
    datasetId?: string;
    version?: string;
    counts?: Record<string, number>;
  };
  theoryChunks?: Record<string, any>[];
  problemPatterns?: Record<string, any>[];
  learningItems?: Record<string, any>[];
  simulationTemplates?: Record<string, any>[];
  aiTestCases?: Record<string, any>[];
  mediaAssets?: Record<string, any>[];
};

@Injectable()
export class LearningDatasetSeedService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(TheoryChunkEntity)
    private readonly theoryChunkRepo: Repository<TheoryChunkEntity>,
    @InjectRepository(ProblemPatternEntity)
    private readonly problemPatternRepo: Repository<ProblemPatternEntity>,
    @InjectRepository(LearningItemEntity)
    private readonly learningItemRepo: Repository<LearningItemEntity>,
    @InjectRepository(SimulationTemplateEntity)
    private readonly simulationTemplateRepo: Repository<SimulationTemplateEntity>,
  ) {}

  seedChapterOneDataset() {
    const datasetPath = this.resolveDatasetPath();
    const dataset = JSON.parse(
      readFileSync(datasetPath, 'utf8'),
    ) as RawLearningDataset;

    const simulationTemplates = (dataset.simulationTemplates ?? []).map((item) =>
      this.simulationTemplateRepo.create(this.normalizeSimulationTemplate(item)),
    );
    const theoryChunks = (dataset.theoryChunks ?? []).map((item) =>
      this.theoryChunkRepo.create(this.pickTheoryChunkFields(item)),
    );
    const problemPatterns = (dataset.problemPatterns ?? []).map((item) =>
      this.problemPatternRepo.create(this.normalizeProblemPattern(item)),
    );
    const learningItems = (dataset.learningItems ?? []).map((item) =>
      this.learningItemRepo.create(this.normalizeLearningItem(item)),
    );

    return this.upsertDataset({
      datasetPath,
      dataset,
      simulationTemplates,
      theoryChunks,
      problemPatterns,
      learningItems,
    });
  }

  private async upsertDataset(payload: {
    datasetPath: string;
    dataset: RawLearningDataset;
    simulationTemplates: SimulationTemplateEntity[];
    theoryChunks: TheoryChunkEntity[];
    problemPatterns: ProblemPatternEntity[];
    learningItems: LearningItemEntity[];
  }) {
    await this.simulationTemplateRepo.upsert(payload.simulationTemplates, [
      'simulationId',
    ]);
    await this.theoryChunkRepo.upsert(payload.theoryChunks, ['id']);
    await this.problemPatternRepo.upsert(payload.problemPatterns, ['patternId']);
    await this.learningItemRepo.upsert(payload.learningItems, ['id']);

    return {
      message: 'Chapter 1 learning simulator dataset seeded successfully',
      datasetPath: payload.datasetPath,
      datasetId: payload.dataset.manifest?.datasetId,
      version: payload.dataset.manifest?.version,
      counts: {
        simulationTemplates: payload.simulationTemplates.length,
        theoryChunks: payload.theoryChunks.length,
        problemPatterns: payload.problemPatterns.length,
        learningItems: payload.learningItems.length,
      },
      skipped: {
        aiTestCases:
          payload.dataset.manifest?.counts?.aiTestCases ??
          payload.dataset.aiTestCases?.length ??
          0,
        mediaAssets:
          payload.dataset.manifest?.counts?.mediaAssets ??
          payload.dataset.mediaAssets?.length ??
          0,
      },
    };
  }

  private resolveDatasetPath() {
    const configuredPath =
      this.configService.get<string>('LEARNING_DATASET_PATH') ??
      '../database/data/learning_simulator_structured_chuong1/all-in-one.learning-data.json';
    const candidates = [
      configuredPath,
      resolve(process.cwd(), configuredPath),
      resolve(
        process.cwd(),
        '../database/data/learning_simulator_structured_chuong1/all-in-one.learning-data.json',
      ),
      resolve(
        process.cwd(),
        '../../../data/learning_simulator_structured_chuong1/all-in-one.learning-data.json',
      ),
    ];

    for (const candidate of candidates) {
      const absolutePath = isAbsolute(candidate)
        ? candidate
        : resolve(process.cwd(), candidate);

      if (existsSync(absolutePath)) {
        return absolutePath;
      }
    }

    throw new NotFoundException(
      `Learning dataset not found. Set LEARNING_DATASET_PATH or place it at ${configuredPath}`,
    );
  }

  private normalizeSimulationTemplate(item: Record<string, any>) {
    return {
      simulationId: item.simulationId,
      subject: item.subject ?? 'physics',
      topic: item.topic,
      title: item.title,
      description: item.description,
      requiredParameters: this.ensureArray(item.requiredParameters),
      defaultParameters: this.normalizeParameters(item.defaultParameters),
      outputs: this.ensureArray(item.outputs),
      isActive: item.isActive ?? true,
    };
  }

  private normalizeProblemPattern(item: Record<string, any>) {
    return {
      patternId: item.patternId,
      subject: item.subject ?? 'physics',
      grade: item.grade ?? 11,
      chapter: item.chapter ?? 'oscillation',
      topic: item.topic,
      name: item.name,
      description: item.description,
      mainFormula:
        item.mainFormula ?? item.solverKey ?? 'CONCEPTUAL_EXPLANATION',
      requiredParameters: this.ensureArray(item.requiredParameters),
      optionalParameters: this.ensureArray(item.optionalParameters),
      target: this.ensureArray(item.target),
      simulationId: item.simulationId,
      levels: this.ensureArray(item.levels),
      examples: this.ensureArray(item.examples),
      metadata: {
        ...(item.metadata ?? {}),
        solverKey: item.solverKey ?? item.metadata?.solverKey,
        sourceValidationStatus: item.validationStatus,
      },
      isActive: item.isActive ?? true,
    };
  }

  private normalizeLearningItem(item: Record<string, any>) {
    return {
      id: item.id,
      subject: item.subject ?? 'physics',
      grade: item.grade ?? 11,
      chapter: item.chapter ?? 'oscillation',
      topic: item.topic,
      patternId: item.patternId,
      simulationId: item.simulationId,
      title: item.title,
      text: item.text,
      parameters: this.normalizeParameters(item.parameters),
      target: this.ensureArray(item.target),
      answer: this.normalizeAnswer(item.answer),
      difficulty: item.difficulty ?? 'recognition',
      concepts: this.ensureArray(item.concepts),
      skills: this.ensureArray(item.skills),
      isActive: item.isActive ?? true,
    };
  }

  private pickTheoryChunkFields(item: Record<string, any>) {
    return {
      id: item.id,
      subject: item.subject ?? 'physics',
      grade: item.grade ?? 11,
      chapter: item.chapter ?? 'oscillation',
      topic: item.topic,
      title: item.title,
      type: item.type,
      text: item.text,
      keywords: this.ensureArray(item.keywords),
      source: item.source,
      metadata: item.metadata,
      isActive: item.isActive ?? true,
    };
  }

  private normalizeAnswer(answer?: Record<string, any>) {
    const steps = this.ensureArray(answer?.steps).map((step, index) => {
      if (typeof step === 'string') {
        return {
          step: index + 1,
          content: step,
        };
      }

      return {
        step: step.step ?? index + 1,
        content: step.content ?? String(step),
      };
    });

    return {
      short: answer?.short ?? answer?.short_answer ?? '',
      steps,
      finalValues: this.normalizeParameters(answer?.finalValues),
    };
  }

  private normalizeParameters(value: any) {
    if (Array.isArray(value)) {
      return value.map((item) => ({
        ...item,
        label: item.label ?? item.key,
      }));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value).map(([key, parameterValue]) => ({
        key,
        label: key,
        value: parameterValue as number | string,
      }));
    }

    return [];
  }

  private ensureArray(value: any) {
    return Array.isArray(value) ? value : [];
  }
}
