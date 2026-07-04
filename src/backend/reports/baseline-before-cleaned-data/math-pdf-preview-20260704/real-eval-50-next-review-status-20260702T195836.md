# Real Eval 50 Next Review Status

- Run time: 2026-07-02T19:58:36+07:00
- Preview eval file: `D:\LearnSimulator\data\eval\real-eval-50.preview.json`
- Gold review JSON: `D:\LearnSimulator\data\eval\real-eval-50.gold-review.json`
- Gold review markdown: `D:\LearnSimulator\data\eval\real-eval-50.gold-review.md`
- Manual review TODO: `D:\LearnSimulator\data\eval\real-eval-50.manual-review.todo.md`
- Latest retrieval diagnostics: `reports/real-eval-50-retrieval-diagnostics-20260702T120343.json`
- Latest real eval summary: `reports/real-eval-50-summary-20260702T125715.md`

## Guardrails

- Did not promote dataset.
- Did not seed production.
- Did not overwrite the original all-in-one dataset.
- Did not modify retrieval/rerank after the gold-label review step began.
- Did not generate additional eval cases.

## Gold Review Status

| Item | Count |
| --- | ---: |
| Cases needing manual gold review | 30 |
| Fail Hit@5 cases included | 3 |
| Possible bad gold label cases | 30 |
| Gold not in top10 | 1 |
| Formula low-rank cases | 6 |
| Human decisions currently present | 0 |

`real-eval-50.reviewed.json` was not generated in this step because no real `humanDecision` entries are present yet. Reviewed retrieval eval was not run to avoid creating a fake reviewed comparison.

## Priority Manual Review Cases

| Priority | Case | Subject | Grade | Type | Gold rank | Recommendation |
| ---: | --- | --- | ---: | --- | ---: | --- |
| 1 | REAL_EVAL50_MATH_007 | math | 10 | formula | N/A | rewrite_question |
| 2 | REAL_EVAL_PHY11_SHM_EQUATION_001 | physics | 11 | formula | 6 | add_candidate_as_additional_gold |
| 3 | REAL_EVAL50_CHEM_013 | chemistry | 11 | concept | 8 | add_candidate_as_additional_gold |
| 4 | REAL_EVAL50_CHEM_012 | chemistry | 10 | formula | 5 | keep_gold |
| 5 | REAL_EVAL50_MATH_010 | math | 10 | formula | 5 | rewrite_question |
| 6 | REAL_EVAL50_PHYS_002 | physics | 12 | formula | 4 | keep_gold |
| 7 | REAL_EVAL50_PHYS_014 | physics | 12 | formula | 4 | keep_gold |
| 8 | REAL_EVAL_PHY11_SHM_VELOCITY_001 | physics | 11 | formula | 2 | keep_gold |
| 9 | REAL_EVAL_PHY11_SHM_ACCELERATION_001 | physics | 11 | formula | 3 | keep_gold |
| 10 | REAL_EVAL50_PHYS_008 | physics | 12 | formula | 2 | keep_gold |
| 11 | REAL_EVAL50_MATH_002 | math | 10 | formula | 3 | rewrite_question |
| 12 | REAL_EVAL_PHY11_WAVE_SPEED_001 | physics | 11 | calculation | 4 | rewrite_question |
| 13 | REAL_EVAL50_PHYS_015 | physics | 10 | concept | 5 | rewrite_question |
| 14 | REAL_EVAL50_CHEM_004 | chemistry | 12 | comparison | 5 | keep_gold |
| 15 | REAL_EVAL50_CHEM_005 | chemistry | 10 | cross-topic-noise | 5 | keep_gold |

## Hit@5 Fail Case Notes

- `REAL_EVAL50_MATH_007`: current gold is not in top10 and was flagged `expected_chunk_missing_question_keywords`. The query is section-generic around "mục Giải", so multiple nearby solution chunks can look better than the expected chunk. Recommended first action is to rewrite the question or manually replace/add a precise candidate after inspecting the top10.
- `REAL_EVAL_PHY11_SHM_EQUATION_001`: current gold ranks 6. Top candidates look related to the SHM equation meaning, while the expected chunk is just outside Hit@5. This looks more like an additional-gold or nearby-label issue than a rerank issue.
- `REAL_EVAL50_CHEM_013`: current gold ranks 8 and is flagged as missing question keywords. The top candidate may be a broader section/goal chunk, so review should decide whether the gold should stay, whether a candidate should be added, or whether the question should explicitly target the intended "Khái niệm" subsection.

## Retrieval Metrics On Preview

| Metric | Value |
| --- | ---: |
| Hit@1 | 0.4000 |
| Hit@3 | 0.7000 |
| Hit@5 | 0.9400 |
| Recall@5 | 0.9300 |
| MRR | 0.5898 |

Weakest remaining subject by Hit@5 is math at 0.9000, with the only gold-not-in-top10 case. Chemistry remains weakest by Hit@1 at 0.3333.

## Answer LLM Eval

Answer eval was rerun with LLM answer and LLM judge enabled.

| Setting | Value |
| --- | --- |
| Source | file |
| AI method | chat |
| LLM answer enabled | true |
| LLM answer configured | true |
| LLM judge enabled | true |
| LLM judge configured | true |
| LLM base URL | `https://api.openai.com/v1` |
| LLM model | `gpt-4o-mini` |
| Judge base URL | `https://api.openai.com/v1` |
| Judge model | `gpt-4o-mini` |

| Metric | Value |
| --- | ---: |
| Evaluated | 50 / 50 |
| Numeric accuracy | 0.6000 |
| Avg correctness | 3.7800 |
| Avg groundedness | 4.0400 |
| Avg completeness | 3.4600 |
| Avg clarity | 4.1800 |
| Avg final answer score | 3.6370 |
| Hallucination rate | 0.0000 |
| Avg latency | 3565.0200 ms |

## Next Step

Fill `humanDecision` for the priority cases in `D:\LearnSimulator\data\eval\real-eval-50.gold-review.json`, then run:

```powershell
npm run apply:real-eval-50-gold-review
```

After the reviewed file has real changes, run retrieval and answer eval with:

```powershell
$env:EVAL_CASES_PATH='D:\LearnSimulator\data\eval\real-eval-50.reviewed.json'
npm run eval:real-50
```

