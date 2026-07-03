# AI Test Cases Diagnostic

- Generated at: 2026-07-01T13:27:35.273Z
- Eval source inspected: database
- Report path: `reports/ai-test-cases-diagnostic.md`

## Evaluator Contract

- `eval-rag.ts` loads DB cases by default unless `EVAL_SOURCE=smoke`.
- It reads the question from `input`, `question`, `message`, or `prompt`.
- It resolves expected data from `expected`, `expectedOutput`, `metadata.expected`, then `metadata.evaluation`.
- Retrieval gold labels are read only from `relevant_chunk_ids` or `relevantChunkIds` inside that expected object.
- The normalized value is exposed as `expected.relevant_chunk_ids`; if its length is 0, retrieval metrics mark the case skipped with `No expected relevant chunk ids`.
- `validationStatus` is not filtered by the retrieval evaluator. All statuses returned by the repository are included.

## Dataset Counts

| Source | aiTestCases | theoryChunks | embeddings |
| --- | ---: | ---: | ---: |
| DB dev | 125 | 4219 | 4219 |
| split preview | 125 | 4215 | N/A |
| all-in-one preview | 125 | 4215 | N/A |

## Evaluation Readiness

| Metric | Count |
| --- | ---: |
| Total aiTestCases inspected | 125 |
| Evaluator-evaluable cases | 0 |
| Strictly evaluable cases with existing theory chunk ids | 0 |
| Cases skipped by current evaluator contract | 125 |

## Skip Reasons

| Reason | Count |
| --- | ---: |
| missing expected chunk ids | 125 |

## Validation Status

| validationStatus | Count |
| --- | ---: |
| draft | 74 |
| needs_review | 51 |

Evaluator note: validationStatus does not cause skip in retrieval eval.

## Fields Present

Root fields:

| Field | Count |
| --- | ---: |
| id | 125 |
| input | 125 |
| expected | 125 |
| sourceLearningItemId | 125 |
| evaluationFocus | 125 |
| validationStatus | 125 |
| sourceData | 125 |
| createdAt | 125 |
| updatedAt | 125 |

`expected` fields:

| Field | Count |
| --- | ---: |
| topic | 125 |
| intent | 125 |
| target | 125 |
| patternId | 125 |
| parameters | 125 |
| simulationId | 125 |
| answer | 5 |

Fields present but not used as retrieval gold labels:

| Field | Count |
| --- | ---: |
| root.sourceLearningItemId | 125 |
| root.evaluationFocus | 125 |
| root.validationStatus | 125 |
| root.sourceData | 125 |
| root.createdAt | 125 |
| root.updatedAt | 125 |
| expected.topic | 125 |
| expected.intent | 125 |
| expected.target | 125 |
| expected.patternId | 125 |
| expected.parameters | 125 |
| expected.simulationId | 125 |
| expected.answer | 5 |

## Top 20 Problem Cases

| Case id | Reason | validationStatus | sourceLearningItemId | expected fields | Details |
| --- | --- | --- | --- | --- | --- |
| AI_TEST_PHY11_001 | missing expected chunk ids | draft | LI_PHY11_C01_L01_001 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_002 | missing expected chunk ids | draft | LI_PHY11_C01_L01_002 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_003 | missing expected chunk ids | needs_review | LI_PHY11_C01_L01_003 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_004 | missing expected chunk ids | needs_review | LI_PHY11_C01_L02_001 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_005 | missing expected chunk ids | needs_review | LI_PHY11_C01_L02_002 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_006 | missing expected chunk ids | needs_review | LI_PHY11_C01_L02_003 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_007 | missing expected chunk ids | needs_review | LI_PHY11_C01_L02_004 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_008 | missing expected chunk ids | draft | LI_PHY11_C01_L02_005 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_009 | missing expected chunk ids | needs_review | LI_PHY11_C01_L02_006 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_010 | missing expected chunk ids | needs_review | LI_PHY11_C01_L02_007 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_011 | missing expected chunk ids | draft | LI_PHY11_C01_L02_008 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_012 | missing expected chunk ids | needs_review | LI_PHY11_C01_L02_009 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_013 | missing expected chunk ids | draft | LI_PHY11_C01_L02_010 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_014 | missing expected chunk ids | needs_review | LI_PHY11_C01_L02_011 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_015 | missing expected chunk ids | draft | LI_PHY11_C01_L02_012 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_016 | missing expected chunk ids | needs_review | LI_PHY11_C01_L03_001 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_017 | missing expected chunk ids | needs_review | LI_PHY11_C01_L03_002 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_018 | missing expected chunk ids | needs_review | LI_PHY11_C01_L03_003 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_019 | missing expected chunk ids | needs_review | LI_PHY11_C01_L03_004 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |
| AI_TEST_PHY11_020 | missing expected chunk ids | needs_review | LI_PHY11_C01_L04_001 | topic, intent, target, patternId, parameters, simulationId | Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds. |

## Migration Signal

| Signal | Count |
| --- | ---: |
| sourceLearningItemId present | 120 |
| sourceLearningItemId directly matches theory chunk id | 0 |
| sourceLearningItemId matches learning item id | 120 |
| Cases with lesson-level theory chunk candidates | 120 |
| Cases without lesson-level theory chunk candidates | 0 |

Lesson-level candidate count distribution from `sourceLearningItemId -> learningItem -> subject/grade/lessonId -> theoryChunks`:

| Candidate chunks per case | Count |
| --- | ---: |
| 23 | 27 |
| 26 | 13 |
| 27 | 12 |
| 30 | 12 |
| 22 | 10 |
| 18 | 8 |
| 35 | 8 |
| 39 | 8 |
| 24 | 6 |
| 44 | 5 |
| 20 | 4 |
| 19 | 3 |
| 13 | 2 |
| 28 | 2 |

## Recommendation

- The current failure is data-labeling, not embedding and not RAG runtime.
- Do not change the evaluator just to accept unrelated field names; the current contract is explicit and already supports snake_case and camelCase under expected data.
- Safe preview migration: add `expected.relevant_chunk_ids` to aiTestCases in a generated preview file only.
- Prefer curated gold labels. If bootstrapping is needed, use `sourceLearningItemId -> learningItem -> lessonId` to propose candidate theory chunks, then keep only 1-3 human-reviewed relevant chunk ids per case.
- Recommended next eval set size: start with 30 curated cases covering physics/math/chemistry and common topics; after metrics are stable, expand to 60-100. The current 125 cases can be kept, but they need gold chunk labels before retrieval metrics are meaningful.
