# RAG Metrics Scorecard

Updated: 2026-07-04

Scope: preview/dev RAG metrics only. No production dataset promotion, no production seed, and no retriever tuning were applied.

## Dataset Snapshot

| Dataset | Theory chunks | Math | Physics | Chemistry | Needs review | Synthetic |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Base canonical | 670 | 0 | 670 | 0 | 14 | 0 |
| Cleaned preview | 4215 | 163 | 2514 | 1538 | 3559 | 0 |
| Math PDF preview | 676 | 6 | 670 | 0 | 20 | 0 |
| Math synthetic preview | 4634 | 582 | 2514 | 1538 | 3978 | 419 |

Current broad preview dataset:

```text
data/structured/generated/all-in-one.with-cleaned-and-math-synthetic-preview.learning-data.json
```

## Dev Embedding Health

| Metric | Value |
| --- | ---: |
| Dev DB theory chunks | 4644 |
| Embedded theory chunks | 4644 |
| Missing embeddings | 0 |
| `needs_review` chunks | 3984 |
| Cleaned generated chunks | 3545 |

Subject distribution in dev DB:

| Subject | Chunks |
| --- | ---: |
| Chemistry | 1538 |
| Math | 588 |
| Physics | 2518 |

## Current RAG Eval 90 After Auto-Safe Review

Eval file:

```text
data/eval/rag-eval-90.reviewed-auto-safe.json
```

Auto-safe review applied only 2 high-confidence additional gold labels:

- Replace gold: 0
- Rewrite applied: 0
- Errors: 0
- Rewrite pending: 12
- Human review pending: 24

Overall metrics:

| Metric | Value |
| --- | ---: |
| Hit@1 | 0.4000 |
| Hit@3 | 0.5111 |
| Hit@5 | 0.5556 |
| MRR | 0.4670 |

By subject:

| Subject | Hit@1 | Hit@3 | Hit@5 | MRR | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| Chemistry | 0.1333 | 0.3000 | 0.3667 | 0.2446 | Weak; needs gold/source review. |
| Math | 0.9000 | 0.9667 | 1.0000 | 0.9361 | Optimistic because of synthetic curriculum chunks. |
| Physics | 0.1667 | 0.2667 | 0.3000 | 0.2203 | Weak; needs gold/source review. |

Change from original preview to auto-safe:

| Metric | Before | After |
| --- | ---: | ---: |
| Overall Hit@5 | 0.5333 | 0.5556 |
| Overall MRR | 0.4448 | 0.4670 |
| Physics Hit@5 | 0.2333 | 0.3000 |
| Chemistry Hit@5 | 0.3667 | 0.3667 |
| Math Hit@5 | 1.0000 | 1.0000 |

## Benchmark Normalization Comparison

The current benchmark is biased toward Math synthetic curriculum format. A normalized candidate was generated so Math follows the older Physics/Chemistry-native benchmark style.

Candidate:

```text
data/eval/rag-eval-90.normalized-phys-chem-style.candidate.json
```

Comparison:

| Benchmark | Cases | Hit@1 | Hit@3 | Hit@5 | Hit@10 | MRR |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Current `rag-eval-90.preview` | 90 | 0.3778 | 0.4889 | 0.5333 | 0.6000 | 0.4448 |
| Old `real-eval-50.preview` format | 50 | 0.4000 | 0.7000 | 0.9400 | 0.9800 | 0.5898 |
| Normalized candidate 90 | 90 | 0.5778 | 0.7778 | 0.9556 | 0.9778 | 0.7049 |

By subject:

| Subject | Current Hit@5 | Old Hit@5 | Normalized Hit@5 | Current MRR | Old MRR | Normalized MRR |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Chemistry | 0.3667 | 0.9333 | 0.9667 | 0.2446 | 0.5428 | 0.6808 |
| Math | 1.0000 | 0.9000 | 0.9667 | 0.9361 | 0.5483 | 0.8022 |
| Physics | 0.2333 | 0.9600 | 0.9333 | 0.1537 | 0.6347 | 0.6317 |

By question type:

| Question type | Current Hit@5 | Old Hit@5 | Normalized Hit@5 |
| --- | ---: | ---: | ---: |
| Calculation | N/A | 1.0000 | 1.0000 |
| Comparison | 0.5000 | 1.0000 | 1.0000 |
| Concept | 0.3333 | 0.8889 | 0.9412 |
| Cross-topic-noise | N/A | 1.0000 | 1.0000 |
| Definition | 0.6731 | 1.0000 | 0.9286 |
| Formula | 0.3750 | 0.8333 | 0.9000 |
| Phenomenon/experiment | 0.3333 | 1.0000 | 1.0000 |

## Interpretation

- Current `rag-eval-90.preview.json` underestimates Physics/Chemistry because its benchmark style and gold alignment are weaker.
- Math is overestimated in the current benchmark because it is aligned to synthetic curriculum chunks.
- The normalized candidate makes Math follow the Physics/Chemistry-native style.
- The large Physics/Chemistry jump is a benchmark-style correction signal, not a reason to promote automatically.

## Review Queue

Human review is still required before finalizing any benchmark:

| Area | Status |
| --- | --- |
| Normalized candidate cases | 90 cases require review. |
| Physics/Chemistry score jumps | Suspicious but explainable; review before final. |
| Math synthetic-source cases | Must be reviewed or replaced with real source chunks later. |
| Rewrite suggestions | 12 pending from enhanced review. |
| Human review pending | 24 Physics/Chemistry cases from enhanced review. |

## Final Recommendation

Do not tune the retriever yet. First finalize the benchmark:

1. Review the normalized candidate.
2. Replace or confirm weak gold labels.
3. Reduce Math reliance on synthetic chunks when real OCR/HTML text is available.
4. Rerun top10 eval.
5. Only tune retriever after the benchmark is trusted.
