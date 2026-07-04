# Cleaned Data RAG Comparison Report

- Baseline reports: `C2-App-107\src\backend\reports\baseline-before-cleaned-data\math-pdf-preview-20260704-db`
- After reports: `C2-App-107\src\backend\reports\after-cleaned-data\math-pdf-preview-20260704-db`
- Preview dataset: `data\structured\generated\all-in-one.with-math-pdf-preview.learning-data.json`
- Status: completed

## DB Diagnostics

| Stage | Theory chunks | Embedded | Missing embeddings | needs_review | generated cleaned |
| --- | ---: | ---: | ---: | ---: | ---: |
| before | 4219 | 4219 | 0 | 3559 | 3545 |
| after_seed | 4225 | 4219 | 6 | 3565 | 3545 |
| after_embed | 4225 | 4225 | 0 | 3565 | 3545 |

## Retrieval Metrics

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.4000 | 0.0000 | -0.4000 |
| Hit@3 | 0.7000 | 0.0000 | -0.7000 |
| Hit@5 | 0.9400 | 0.0000 | -0.9400 |
| Recall@5 | 0.9300 | 0.0000 | -0.9300 |
| MRR | 0.5898 | 0.0000 | -0.5898 |

## Answer Metrics

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Numeric accuracy | 0.6000 | 0.0000 | -0.6000 |
| Avg concept coverage | 0.3267 | 0.0000 | -0.3267 |
| Avg correctness | 3.7800 | 0.0000 | -3.7800 |
| Avg final answer score | 3.6370 | 0.0000 | -3.6370 |

## Warnings

- RAG eval did not evaluate any cases; skipped_cases=125. Metrics are not meaningful.
- Answer eval evaluated only 5 case(s); skipped_cases=120. Metrics are low-confidence.
- Hit@1 dropped from 0.4000 to 0.0000.
- Hit@3 dropped from 0.7000 to 0.0000.
- Hit@5 dropped from 0.9400 to 0.0000.
- Recall@5 dropped from 0.9300 to 0.0000.
- MRR dropped from 0.5898 to 0.0000.
- Answer avg concept coverage dropped from 0.3267 to 0.0000.

## Commands

| Step | Return code | Command | Logs |
| --- | ---: | --- | --- |
| validate-preview | 0 | `node node_modules\ts-node\dist\bin.js scripts/validate-learning-data.ts D:\LearnSimulator\data\structured\generated\all-in-one.with-math-pdf-preview.learning-data.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\validate-preview.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\validate-preview.stderr.log` |
| diagnostics-before | 0 | `node node_modules\ts-node\dist\bin.js scripts/learning-data-diagnostics.ts reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\learning-data-diagnostics-before.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\diagnostics-before.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\diagnostics-before.stderr.log` |
| seed-preview | 0 | `node node_modules\ts-node\dist\bin.js scripts/seed-learning-data.ts D:\LearnSimulator\data\structured\generated\all-in-one.with-math-pdf-preview.learning-data.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\seed-preview.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\seed-preview.stderr.log` |
| diagnostics-after-seed | 0 | `node node_modules\ts-node\dist\bin.js scripts/learning-data-diagnostics.ts reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\learning-data-diagnostics-after-seed.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\diagnostics-after-seed.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\diagnostics-after-seed.stderr.log` |
| npm-run-embed:theory | 0 | `npm.cmd run embed:theory` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\npm-run-embed_theory.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\npm-run-embed_theory.stderr.log` |
| diagnostics-after-embed | 0 | `node node_modules\ts-node\dist\bin.js scripts/learning-data-diagnostics.ts reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\learning-data-diagnostics-after-embed.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\diagnostics-after-embed.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\diagnostics-after-embed.stderr.log` |
| npm-run-eval:rag | 0 | `npm.cmd run eval:rag` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\npm-run-eval_rag.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\npm-run-eval_rag.stderr.log` |
| npm-run-eval:answer | 0 | `npm.cmd run eval:answer` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\npm-run-eval_answer.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\math-pdf-preview-20260704-db\npm-run-eval_answer.stderr.log` |

## Manual Commands

Run from `C2-App-107/src/backend`:

```powershell
node node_modules\ts-node\dist\bin.js scripts\validate-learning-data.ts ..\..\..\data\structured\generated\all-in-one.with-math-pdf-preview.learning-data.json
node node_modules\ts-node\dist\bin.js scripts\seed-learning-data.ts ..\..\..\data\structured\generated\all-in-one.with-math-pdf-preview.learning-data.json
npm run embed:theory
npm run eval:rag
npm run eval:answer
npm run eval:full
```
