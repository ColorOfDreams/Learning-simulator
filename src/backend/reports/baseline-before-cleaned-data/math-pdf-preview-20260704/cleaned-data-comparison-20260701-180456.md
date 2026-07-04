# Cleaned Data RAG Comparison Report

- Baseline reports: `C2-App-107\src\backend\reports\baseline-before-cleaned-data\20260701-180456`
- After reports: `C2-App-107\src\backend\reports\after-cleaned-data\20260701-180456`
- Preview dataset: `data\structured\generated\all-in-one.with-cleaned-preview.learning-data.json`
- Status: completed

## DB Diagnostics

| Stage | Theory chunks | Embedded | Missing embeddings | needs_review | generated cleaned |
| --- | ---: | ---: | ---: | ---: | ---: |
| before | 4219 | 674 | 3545 | 3559 | 3545 |
| after_seed | 4219 | 674 | 3545 | 3559 | 3545 |
| after_embed | 4219 | 674 | 3545 | 3559 | 3545 |

## Retrieval Metrics

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.6667 | 0.0000 | -0.6667 |
| Hit@3 | 0.9444 | 0.0000 | -0.9444 |
| Hit@5 | 1.0000 | 0.0000 | -1.0000 |
| Recall@5 | 0.8981 | 0.0000 | -0.8981 |
| MRR | 0.7917 | 0.0000 | -0.7917 |

## Answer Metrics

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Numeric accuracy | 0.0000 | 0.0000 | 0.0000 |
| Avg concept coverage | 0.9389 | 0.0000 | -0.9389 |
| Avg correctness | 0.0000 | 0.0000 | 0.0000 |
| Avg final answer score | 0.0000 | 0.0000 | 0.0000 |

## Warnings

- Hit@1 dropped from 0.6667 to 0.0000.
- Hit@3 dropped from 0.9444 to 0.0000.
- Hit@5 dropped from 1.0000 to 0.0000.
- Recall@5 dropped from 0.8981 to 0.0000.
- MRR dropped from 0.7917 to 0.0000.
- Answer avg concept coverage dropped from 0.9389 to 0.0000.
- Embedding count is lower than theoryChunks count: 674 embedded / 4219 total.

## Commands

| Step | Return code | Command | Logs |
| --- | ---: | --- | --- |
| validate-preview | 0 | `node node_modules\ts-node\dist\bin.js scripts/validate-learning-data.ts D:\LearnSimulator\data\structured\generated\all-in-one.with-cleaned-preview.learning-data.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\validate-preview.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\validate-preview.stderr.log` |
| diagnostics-before | 0 | `node node_modules\ts-node\dist\bin.js scripts/learning-data-diagnostics.ts reports\cleaned-data-run-logs\20260701-180456\learning-data-diagnostics-before.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\diagnostics-before.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\diagnostics-before.stderr.log` |
| seed-preview | 0 | `node node_modules\ts-node\dist\bin.js scripts/seed-learning-data.ts D:\LearnSimulator\data\structured\generated\all-in-one.with-cleaned-preview.learning-data.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\seed-preview.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\seed-preview.stderr.log` |
| diagnostics-after-seed | 0 | `node node_modules\ts-node\dist\bin.js scripts/learning-data-diagnostics.ts reports\cleaned-data-run-logs\20260701-180456\learning-data-diagnostics-after-seed.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\diagnostics-after-seed.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\diagnostics-after-seed.stderr.log` |
| npm-run-embed:theory | 0 | `npm.cmd run embed:theory` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\npm-run-embed:theory.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\npm-run-embed:theory.stderr.log` |
| diagnostics-after-embed | 0 | `node node_modules\ts-node\dist\bin.js scripts/learning-data-diagnostics.ts reports\cleaned-data-run-logs\20260701-180456\learning-data-diagnostics-after-embed.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\diagnostics-after-embed.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\diagnostics-after-embed.stderr.log` |
| npm-run-eval:rag | 0 | `npm.cmd run eval:rag` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\npm-run-eval:rag.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\npm-run-eval:rag.stderr.log` |
| npm-run-eval:answer | 0 | `npm.cmd run eval:answer` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\npm-run-eval:answer.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\npm-run-eval:answer.stderr.log` |
| npm-run-eval:full | 0 | `npm.cmd run eval:full` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\npm-run-eval:full.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180456\npm-run-eval:full.stderr.log` |

## Manual Commands

Run from `C2-App-107/src/backend`:

```powershell
node node_modules\ts-node\dist\bin.js scripts\validate-learning-data.ts ..\..\..\data\structured\generated\all-in-one.with-cleaned-preview.learning-data.json
node node_modules\ts-node\dist\bin.js scripts\seed-learning-data.ts ..\..\..\data\structured\generated\all-in-one.with-cleaned-preview.learning-data.json
npm run embed:theory
npm run eval:rag
npm run eval:answer
npm run eval:full
```
