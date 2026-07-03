# Cleaned Data RAG Comparison Report

- Baseline reports: `C2-App-107\src\backend\reports\baseline-before-cleaned-data\20260701-180156`
- After reports: not created
- Preview dataset: `data\structured\generated\all-in-one.with-cleaned-preview.learning-data.json`
- Status: stopped
- Stop reason: Command failed: seed-preview. See C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180156\seed-preview.stdout.log and C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180156\seed-preview.stderr.log

## DB Diagnostics

DB diagnostics unavailable.

## Retrieval Metrics

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.6667 | N/A | N/A |
| Hit@3 | 0.9444 | N/A | N/A |
| Hit@5 | 1.0000 | N/A | N/A |
| Recall@5 | 0.8981 | N/A | N/A |
| MRR | 0.7917 | N/A | N/A |

## Answer Metrics

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Numeric accuracy | 0.0000 | N/A | N/A |
| Avg concept coverage | 0.9389 | N/A | N/A |
| Avg correctness | 0.0000 | N/A | N/A |
| Avg final answer score | 0.0000 | N/A | N/A |

## Warnings

No metric regression or embedding warning detected from available reports.

## Commands

| Step | Return code | Command | Logs |
| --- | ---: | --- | --- |
| validate-preview | 0 | `node node_modules\ts-node\dist\bin.js scripts/validate-learning-data.ts D:\LearnSimulator\data\structured\generated\all-in-one.with-cleaned-preview.learning-data.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180156\validate-preview.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180156\validate-preview.stderr.log` |
| diagnostics-before | 0 | `node node_modules\ts-node\dist\bin.js scripts/learning-data-diagnostics.ts reports\cleaned-data-run-logs\20260701-180156\learning-data-diagnostics-before.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180156\diagnostics-before.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180156\diagnostics-before.stderr.log` |
| seed-preview | 1 | `node node_modules\ts-node\dist\bin.js scripts/seed-learning-data.ts D:\LearnSimulator\data\structured\generated\all-in-one.with-cleaned-preview.learning-data.json` | `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180156\seed-preview.stdout.log`, `C2-App-107\src\backend\reports\cleaned-data-run-logs\20260701-180156\seed-preview.stderr.log` |

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
