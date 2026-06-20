import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  parseLearningDatasetFile,
  validateLearningDataset,
} from '../src/modules/learning/learning-data.schema';

const defaultPath = '../database/data/11/all-in-one.learning-data.json';
const candidates = [
  process.argv[2],
  process.env.LEARNING_DATASET_PATH,
  defaultPath,
  '../database/data/all-in-one.learning-data.json',
]
  .filter((path): path is string => Boolean(path))
  .map((path) => resolve(process.cwd(), path));
const datasetPath = candidates.find(existsSync);

if (!datasetPath) {
  console.error(`Dataset not found. Checked: ${candidates.join(', ')}`);
  process.exitCode = 1;
} else {
  const parsed = parseLearningDatasetFile(datasetPath);
  const result = parsed.issues.length
    ? { issues: parsed.issues }
    : validateLearningDataset(parsed.value);

  if (result.issues.length > 0) {
    console.error(`Learning-data validation failed: ${result.issues.length} issue(s)`);
    result.issues.forEach((issue) =>
      console.error(`- ${issue.path}: ${issue.message}`),
    );
    process.exitCode = 1;
  } else if (result.data) {
    console.log('Learning-data validation passed');
    console.table(
      Object.entries(result.data)
        .filter(([, value]) => Array.isArray(value))
        .map(([name, value]) => ({ collection: name, count: value.length })),
    );
  }
}
