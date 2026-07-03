# Cleaned Data RAG Comparison Report

- Baseline reports: `reports/baseline-before-cleaned-data/20260701-180456/`
- After reports: `reports/after-cleaned-data/20260701-200316/`
- Preview dataset: `data/structured/generated/all-in-one.with-cleaned-preview.learning-data.json`
- Split preview: `data/structured/generated/split-preview/`
- Runtime changes: none
- Dataset promotion: none
- Production seed: none

## DB Diagnostics

| Stage | Theory chunks | Embedded | Missing embeddings | needs_review | generated cleaned |
| --- | ---: | ---: | ---: | ---: | ---: |
| Before network embed | 4219 | 674 | 3545 | 3559 | 3545 |
| After network embed | 4219 | 4219 | 0 | 3559 | 3545 |

## Retrieval Metrics

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.6667 | 0.0000 | -0.6667 |
| Hit@3 | 0.9444 | 0.0000 | -0.9444 |
| Hit@5 | 1.0000 | 0.0000 | -1.0000 |
| Recall@5 | 0.8981 | 0.0000 | -0.8981 |
| MRR | 0.7917 | 0.0000 | -0.7917 |

Important: the after retrieval run is not comparable as a retrieval-quality metric.
It loaded 125 cases but evaluated 0 and skipped 125 because the current DB/source
does not expose expected relevant chunk ids for those cases.

## Answer Metrics

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Numeric accuracy | 0.0000 | 0.0000 | 0.0000 |
| Avg concept coverage | 0.9389 | 0.0000 | -0.9389 |
| Avg correctness | 0.0000 | 0.0000 | 0.0000 |
| Avg final answer score | 0.0000 | 0.0000 | 0.0000 |

Important: the after answer run evaluated only 5 of 125 cases and reported
`LLM enabled: false`, so these values should not be used to approve or reject
the cleaned data.

## Warnings

- Retrieval metrics appear to drop, but after retrieval metrics are not reliable because `evaluated_cases = 0`.
- Answer concept coverage appears to drop, but after answer metrics are not reliable because only 5 cases were evaluated and LLM scoring was disabled.
- Embedding count is healthy: 4219 embedded / 4219 total.
- `embeddingIndexCount = 0`; retrieval still ran with pgvector enabled, but there is no embedding index reported by diagnostics.
- Several eval report questions appear mojibake-encoded in the generated reports; inspect encoding before using these reports as final quality evidence.

## Commands Run

Run from `C2-App-107/src/backend`:

```powershell
npm run embed:theory
npm run backup:theory-embeddings -- reports\theory-embeddings-backup-after-cleaned-preview-full.jsonl
npm run eval:rag
npm run eval:answer
npm run eval:full
node node_modules\ts-node\dist\bin.js scripts\learning-data-diagnostics.ts reports\learning-data-diagnostics-after-cleaned-preview-full.json
```

## Embedding Backup

- Full backup: `reports/theory-embeddings-backup-after-cleaned-preview-full.jsonl`
- Exported embeddings: 4219
- Restore command:

```powershell
npm run restore:theory-embeddings -- reports\theory-embeddings-backup-after-cleaned-preview-full.jsonl
```

