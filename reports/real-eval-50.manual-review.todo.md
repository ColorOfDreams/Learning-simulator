# Real Eval 50 Manual Review TODO

- Run time: 2026-07-02T12:42:05.565Z
- Fill `humanDecision` in `data/eval/real-eval-50.gold-review.json`, then run `npm run apply:real-eval-50-gold-review` from `src/backend`.
- Allowed actions: `keep_gold`, `replace_gold_with_candidate`, `add_candidate_as_additional_gold`, `rewrite_question`, `drop_case`.

## Priority Cases

| Priority | Case | Subject | Grade | Type | Gold rank | Recommendation | Why |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | REAL_EVAL50_MATH_007 | math | 10 | formula | N/A | rewrite_question | gold_not_in_top10, possible_bad_gold_label, expected_chunk_missing_question_keywords |
| 2 | REAL_EVAL_PHY11_SHM_EQUATION_001 | physics | 11 | formula | 6 | add_candidate_as_additional_gold | gold_low_rank, possible_bad_gold_label, candidate_may_be_better_than_gold |
| 3 | REAL_EVAL50_CHEM_013 | chemistry | 11 | concept | 8 | add_candidate_as_additional_gold | gold_low_rank, possible_bad_gold_label, expected_chunk_missing_question_keywords, candidate_may_be_better_than_gold |
| 4 | REAL_EVAL50_CHEM_012 | chemistry | 10 | formula | 5 | keep_gold | success_top5, possible_bad_gold_label, candidate_may_be_better_than_gold |
| 5 | REAL_EVAL50_MATH_010 | math | 10 | formula | 5 | rewrite_question | success_top5, possible_bad_gold_label, expected_chunk_missing_question_keywords |
| 6 | REAL_EVAL50_PHYS_002 | physics | 12 | formula | 4 | keep_gold | success_top5, possible_bad_gold_label, candidate_may_be_better_than_gold |
| 7 | REAL_EVAL50_PHYS_014 | physics | 12 | formula | 4 | keep_gold | success_top5, possible_bad_gold_label, candidate_may_be_better_than_gold |
| 8 | REAL_EVAL_PHY11_SHM_VELOCITY_001 | physics | 11 | formula | 2 | keep_gold | success_top3, success_top5, possible_bad_gold_label, candidate_may_be_better_than_gold |
| 9 | REAL_EVAL_PHY11_SHM_ACCELERATION_001 | physics | 11 | formula | 3 | keep_gold | success_top3, success_top5, possible_bad_gold_label, candidate_may_be_better_than_gold |
| 10 | REAL_EVAL50_PHYS_008 | physics | 12 | formula | 2 | keep_gold | success_top3, success_top5, possible_bad_gold_label, candidate_may_be_better_than_gold |
| 11 | REAL_EVAL50_MATH_002 | math | 10 | formula | 3 | rewrite_question | success_top3, success_top5, possible_bad_gold_label, expected_chunk_missing_question_keywords |
| 12 | REAL_EVAL_PHY11_WAVE_SPEED_001 | physics | 11 | calculation | 4 | rewrite_question | success_top5, possible_bad_gold_label, expected_chunk_too_short_or_noisy, expected_chunk_missing_question_keywords, candidate_may_be_better_than_gold |
| 13 | REAL_EVAL50_PHYS_015 | physics | 10 | concept | 5 | rewrite_question | success_top5, possible_bad_gold_label, expected_chunk_missing_question_keywords |
| 14 | REAL_EVAL50_CHEM_004 | chemistry | 12 | comparison | 5 | keep_gold | success_top5, possible_bad_gold_label, candidate_may_be_better_than_gold |
| 15 | REAL_EVAL50_CHEM_005 | chemistry | 10 | cross-topic-noise | 5 | keep_gold | success_top5, possible_bad_gold_label, candidate_may_be_better_than_gold |

## Decision Template

```json
{
  "humanDecision": {
    "action": "add_candidate_as_additional_gold",
    "candidateChunkIds": [
      "CHUNK_ID_TO_ADD"
    ],
    "rationale": "short human reason"
  }
}
```
