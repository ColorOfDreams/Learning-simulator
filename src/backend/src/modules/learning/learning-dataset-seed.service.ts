import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { Repository } from 'typeorm';
import {
  parseLearningDatasetFile,
  validateLearningDataset,
} from './learning-data.schema';
import { AiTestCaseEntity } from './ai-test-case/ai-test-case.entity';
import { LearningItemEntity } from './learning-item/learning-item.entity';
import { MediaAssetEntity } from './media-asset/media-asset.entity';
import { ProblemPatternEntity } from './problem-pattern/problem-pattern.entity';
import { SimulationTemplateEntity } from './simulation-template/simulation-template.entity';
import { TheoryChunkEntity } from './theory-chunk/theory-chunk.entity';

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
    @InjectRepository(AiTestCaseEntity)
    private readonly aiTestCaseRepo: Repository<AiTestCaseEntity>,
    @InjectRepository(MediaAssetEntity)
    private readonly mediaAssetRepo: Repository<MediaAssetEntity>,
  ) {}

  async seedLearningDataset(configuredPath?: string) {
    const datasetPath = this.resolveDatasetPath(configuredPath);
    const parsed = parseLearningDatasetFile(datasetPath);
    const validation = parsed.issues.length
      ? { issues: parsed.issues }
      : validateLearningDataset(parsed.value);

    if (validation.issues.length > 0 || !validation.data) {
      throw new BadRequestException({
        message: 'Learning dataset validation failed; no rows were seeded.',
        issues: validation.issues,
      });
    }

    const dataset = validation.data;
    await this.simulationTemplateRepo.upsert(
      dataset.simulationTemplates.map((item) =>
        this.simulationTemplateRepo.create(
          this.normalizeSimulationTemplate(item),
        ),
      ),
      ['simulationId'],
    );
    await this.problemPatternRepo.upsert(
      dataset.problemPatterns.map((item) =>
        this.problemPatternRepo.create(this.normalizeProblemPattern(item)),
      ),
      ['patternId'],
    );
    await this.theoryChunkRepo.upsert(
      dataset.theoryChunks.map((item) =>
        this.theoryChunkRepo.create(this.normalizeTheoryChunk(item)),
      ),
      ['id'],
    );
    await this.learningItemRepo.upsert(
      dataset.learningItems.map((item) =>
        this.learningItemRepo.create(this.normalizeLearningItem(item)),
      ),
      ['id'],
    );
    await this.aiTestCaseRepo.upsert(
      dataset.aiTestCases.map((item) =>
        this.aiTestCaseRepo.create({
          id: item.id,
          input: item.input,
          expected: item.expected ?? {},
          sourceLearningItemId: item.sourceLearningItemId,
          evaluationFocus: this.ensureArray(item.evaluationFocus),
          validationStatus: item.validationStatus,
          sourceData: item,
        }),
      ),
      ['id'],
    );
    await this.mediaAssetRepo.upsert(
      dataset.mediaAssets.map((item) =>
        this.mediaAssetRepo.create({
          id: item.id,
          subject: item.subject ?? 'physics',
          grade: item.grade ?? 11,
          chapter: item.chapter,
          lessonId: item.lessonId,
          title: item.title,
          type: item.type,
          path: item.path,
          altText: item.altText,
          validationStatus: item.validationStatus,
          sourceData: item,
        }),
      ),
      ['id'],
    );

    return {
      message: 'Learning dataset seeded successfully',
      datasetPath,
      datasetId: dataset.manifest?.datasetId,
      counts: {
        theoryChunks: dataset.theoryChunks.length,
        problemPatterns: dataset.problemPatterns.length,
        learningItems: dataset.learningItems.length,
        aiTestCases: dataset.aiTestCases.length,
        simulationTemplates: dataset.simulationTemplates.length,
        mediaAssets: dataset.mediaAssets.length,
      },
    };
  }

  // Kept for the existing /learning/seed/chapter1 route.
  seedChapterOneDataset() {
    return this.seedLearningDataset();
  }

  private resolveDatasetPath(configuredPath?: string) {
    const configured =
      configuredPath ??
      this.configService.get<string>('LEARNING_DATASET_PATH') ??
      '../database/data/11/all-in-one.learning-data.json';
    const candidates = [
      configured,
      resolve(process.cwd(), configured),
      resolve(
        process.cwd(),
        '../database/data/11/all-in-one.learning-data.json',
      ),
      resolve(process.cwd(), '../database/data/all-in-one.learning-data.json'),
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
      `Learning dataset not found. Set LEARNING_DATASET_PATH; checked ${candidates.join(', ')}`,
    );
  }

  private normalizeTheoryChunk(item: Record<string, any>) {
    return {
      id: item.id,
      subject: item.subject ?? 'physics',
      grade: item.grade ?? 11,
      chapter: item.chapter,
      lessonId: item.lessonId,
      lessonTitle: item.lessonTitle,
      topic: item.topic,
      title: item.title,
      type: item.type,
      text: item.text,
      keywords: this.ensureArray(item.keywords),
      source: item.source,
      metadata: {
        formulaKeys: this.ensureArray(item.formulaKeys),
        conceptKeys: this.ensureArray(item.conceptKeys),
      },
      validationStatus: item.validationStatus,
      sourceData: item,
      isActive: item.isActive ?? true,
    };
  }

  private normalizeProblemPattern(item: Record<string, any>) {
    const difficultyRange = this.ensureArray(item.difficultyRange);
    return {
      patternId: item.id,
      subject: item.subject ?? 'physics',
      grade: item.grade ?? 11,
      chapter: item.chapter ?? item.topic,
      topic: item.topic,
      name: item.title,
      description: item.description,
      mainFormula: this.ensureArray(item.formulaKeys)[0] ?? item.solverKey,
      requiredParameters: this.ensureArray(item.requiredParameters),
      optionalParameters: this.ensureArray(item.optionalParameters),
      target: this.ensureArray(item.target),
      simulationId: item.simulationId,
      levels: difficultyRange.map((level) => ({
        level,
        description: `Dataset difficulty: ${level}`,
        generationInstruction: '',
      })),
      examples: [],
      metadata: {
        formulaKeys: this.ensureArray(item.formulaKeys),
        solverKey: item.solverKey,
      },
      validationStatus: item.validationStatus,
      sourceData: item,
      isActive: item.isActive ?? true,
    };
  }

  private normalizeLearningItem(item: Record<string, any>) {
    return {
      id: item.id,
      subject: item.subject ?? 'physics',
      grade: item.grade ?? 11,
      chapter: item.chapter,
      lessonId: item.lessonId,
      lessonTitle: item.lessonTitle,
      topic: item.topic,
      patternId: item.patternId,
      simulationId: item.simulationId,
      title: item.title,
      text: item.text,
      parameters: this.normalizeParameters(item.parameters),
      target: this.normalizeTargets(item.target),
      answer: {
        short: item.answer?.short ?? item.answer?.text ?? '',
        steps: this.ensureArray(item.answer?.steps).map((step, index) => ({
          step: typeof step === 'object' ? (step.step ?? index + 1) : index + 1,
          content:
            typeof step === 'object'
              ? (step.content ?? String(step))
              : String(step),
        })),
      },
      difficulty: item.difficulty ?? 'recognition',
      concepts: this.ensureArray(item.concepts),
      skills: this.ensureArray(item.skills),
      source: item.source,
      validationStatus: item.validationStatus,
      sourceData: item,
      isActive: item.isActive ?? true,
    };
  }

  private normalizeSimulationTemplate(item: Record<string, any>) {
    return {
      simulationId: item.id,
      subject: item.subject ?? 'physics',
      topic: item.topic,
      engine: item.engine,
      sceneType: item.sceneType,
      title: item.title,
      description: item.description,
      requiredParameters: this.ensureArray(item.parameterSchema)
        .filter((parameter) => parameter.required)
        .map((parameter) => parameter.key),
      defaultParameters: this.normalizeParameters(item.defaultState),
      outputs: this.ensureArray(item.outputs),
      parameterSchema: this.ensureArray(item.parameterSchema),
      supportedActions: this.ensureArray(item.supportedActions),
      validationStatus: item.validationStatus,
      sourceData: item,
      isActive: item.isActive ?? true,
    };
  }

  private normalizeParameters(value: unknown) {
    if (Array.isArray(value)) {
      return value.map((item) => ({ ...item, label: item.label ?? item.key }));
    }
    if (value && typeof value === 'object') {
      return Object.entries(value).map(([key, parameterValue]) => ({
        key,
        label: key,
        value: parameterValue as string | number,
      }));
    }
    return [];
  }

  private normalizeTargets(value: unknown) {
    return this.ensureArray(value).map((target) =>
      typeof target === 'string'
        ? { key: target, label: target }
        : { key: target.key, label: target.label ?? target.key },
    );
  }

  private ensureArray(value: unknown): any[] {
    return Array.isArray(value) ? value : [];
  }
}
