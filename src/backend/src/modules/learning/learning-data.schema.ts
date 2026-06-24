import { readFileSync } from 'node:fs';

export const VALIDATION_STATUSES = [
  'draft',
  'ai_generated',
  'needs_review',
  'solver_verified',
  'human_verified',
  'gold',
] as const;

export type ValidationStatus = (typeof VALIDATION_STATUSES)[number];

export type DatasetIssue = {
  path: string;
  message: string;
};

export type LearningDataset = {
  manifest?: Record<string, unknown>;
  theoryChunks: Record<string, any>[];
  problemPatterns: Record<string, any>[];
  learningItems: Record<string, any>[];
  aiTestCases: Record<string, any>[];
  simulationTemplates: Record<string, any>[];
  mediaAssets: Record<string, any>[];
};

const COLLECTIONS = [
  'theoryChunks',
  'problemPatterns',
  'learningItems',
  'aiTestCases',
  'simulationTemplates',
  'mediaAssets',
] as const;

const REQUIRED_FIELDS: Record<(typeof COLLECTIONS)[number], string[]> = {
  theoryChunks: [
    'id',
    'subject',
    'grade',
    'chapter',
    'lessonId',
    'topic',
    'type',
    'title',
    'text',
    'validationStatus',
  ],
  problemPatterns: [
    'id',
    'subject',
    'grade',
    'topic',
    'title',
    'description',
    'validationStatus',
  ],
  learningItems: [
    'id',
    'subject',
    'grade',
    'chapter',
    'lessonId',
    'topic',
    'title',
    'text',
    'patternId',
    'validationStatus',
  ],
  aiTestCases: [
    'id',
    'input',
    'expected',
    'validationStatus',
  ],
  simulationTemplates: [
    'id',
    'subject',
    'grade',
    'topic',
    'title',
    'engine',
    'sceneType',
    'validationStatus',
  ],
  mediaAssets: [
    'id',
    'subject',
    'grade',
    'chapter',
    'lessonId',
    'title',
    'type',
    'path',
    'validationStatus',
  ],
};

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasValue(value: unknown) {
  return value !== undefined && value !== null && value !== '';
}

function addDuplicateIdIssues(
  collectionName: string,
  rows: Record<string, any>[],
  issues: DatasetIssue[],
) {
  const ids = new Set<string>();
  rows.forEach((row, index) => {
    const id = row.id;
    if (typeof id !== 'string' || !id.trim()) {
      return;
    }
    if (ids.has(id)) {
      issues.push({
        path: `${collectionName}[${index}].id`,
        message: `Duplicate id: ${id}`,
      });
      return;
    }
    ids.add(id);
  });
}

function addRecordIssues(
  collectionName: (typeof COLLECTIONS)[number],
  rows: Record<string, any>[],
  issues: DatasetIssue[],
) {
  rows.forEach((row, index) => {
    REQUIRED_FIELDS[collectionName].forEach((field) => {
      if (!hasValue(row[field])) {
        issues.push({
          path: `${collectionName}[${index}].${field}`,
          message: 'Required field is missing',
        });
      }
    });

    if (!VALIDATION_STATUSES.includes(row.validationStatus)) {
      issues.push({
        path: `${collectionName}[${index}].validationStatus`,
        message: `Unsupported validationStatus: ${String(row.validationStatus)}`,
      });
    }
  });
}

export function validateLearningDataset(value: unknown): {
  data?: LearningDataset;
  issues: DatasetIssue[];
} {
  const issues: DatasetIssue[] = [];

  if (!isRecord(value)) {
    return {
      issues: [{ path: '$', message: 'Dataset root must be a JSON object' }],
    };
  }

  const data = value as Partial<LearningDataset>;
  for (const collectionName of COLLECTIONS) {
    if (!Array.isArray(data[collectionName])) {
      issues.push({
        path: collectionName,
        message: 'Expected an array',
      });
      continue;
    }
    if (data[collectionName].some((row) => !isRecord(row))) {
      issues.push({
        path: collectionName,
        message: 'Every collection item must be an object',
      });
    }
  }

  if (issues.length > 0) {
    return { issues };
  }

  const dataset = data as LearningDataset;
  for (const collectionName of COLLECTIONS) {
    addDuplicateIdIssues(collectionName, dataset[collectionName], issues);
    addRecordIssues(collectionName, dataset[collectionName], issues);
  }

  const patternIds = new Set(dataset.problemPatterns.map((item) => item.id));
  const simulationIds = new Set(dataset.simulationTemplates.map((item) => item.id));
  const learningItemIds = new Set(dataset.learningItems.map((item) => item.id));

  dataset.learningItems.forEach((item, index) => {
    if (!patternIds.has(item.patternId)) {
      issues.push({
        path: `learningItems[${index}].patternId`,
        message: `Unknown ProblemPattern id: ${String(item.patternId)}`,
      });
    }
    if (item.simulationId && !simulationIds.has(item.simulationId)) {
      issues.push({
        path: `learningItems[${index}].simulationId`,
        message: `Unknown SimulationTemplate id: ${String(item.simulationId)}`,
      });
    }
  });

  dataset.problemPatterns.forEach((item, index) => {
    if (item.simulationId && !simulationIds.has(item.simulationId)) {
      issues.push({
        path: `problemPatterns[${index}].simulationId`,
        message: `Unknown SimulationTemplate id: ${String(item.simulationId)}`,
      });
    }
  });

  dataset.aiTestCases.forEach((item, index) => {
    const patternId = item.expected?.patternId;
    if (patternId && !patternIds.has(patternId)) {
      issues.push({
        path: `aiTestCases[${index}].expected.patternId`,
        message: `Unknown ProblemPattern id: ${String(patternId)}`,
      });
    }
    if (
      item.sourceLearningItemId &&
      !learningItemIds.has(item.sourceLearningItemId)
    ) {
      issues.push({
        path: `aiTestCases[${index}].sourceLearningItemId`,
        message: `Unknown LearningItem id: ${String(item.sourceLearningItemId)}`,
      });
    }
  });

  return { data: dataset, issues };
}

export function parseLearningDatasetFile(path: string) {
  try {
    return {
      value: JSON.parse(readFileSync(path, 'utf8')) as unknown,
      issues: [] as DatasetIssue[],
    };
  } catch (error) {
    return {
      value: undefined,
      issues: [
        {
          path,
          message: `Cannot parse JSON: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
