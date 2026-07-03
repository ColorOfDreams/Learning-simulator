# AI/RAG Evaluation Report

## 1. Run Information

- Run time: 2026-07-01T11:08:13.723Z
- Eval source: database
- Retrieval run: ok
- Answer run: ok
- Total cases: retrieval 125; answer 125
- Evaluated cases: retrieval 0; answer 5
- Skipped cases: retrieval 125; answer 120
- Failed cases: retrieval 0; answer 0

### Vector Retrieval Diagnostics

- Vector retrieval enabled: true
- Embedding API key present: true
- Embedding base URL: https://api.openai.com/v1
- Embedding endpoint: https://api.openai.com/v1/embeddings
- Embedding model: text-embedding-3-small
- Embedding dimension: 1536
- Node global fetch available: true
- pgvector extension enabled: true
- Theory chunks total: 4219
- Theory chunks with embedding: 674
- Theory chunks missing embedding: 3545
- Embedding dimensions in DB: 1536
- Embedding index count: 0
- Cases with hybrid results: 0
- Cases with vector results: 0
- Cases fallback keyword only: 0

### Blocking Details

- Checked: eval scripts exist and were executed via npm scripts.
- Commands to rerun after DB/env is ready:
  - npm run eval:rag
  - npm run eval:answer
  - npm run eval:full
  - EVAL_SOURCE=smoke npm run eval:rag

## 2. Before vs After RAG Comparison

| Metric | Before: keyword-only baseline | After: hybrid/vector RAG | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.0000 | 0.0000 | +0.0000 |
| Hit@3 | 0.0000 | 0.0000 | +0.0000 |
| Hit@5 | 0.0000 | 0.0000 | +0.0000 |
| Recall@5 | 0.0000 | 0.0000 | +0.0000 |
| Precision@5 | 0.0000 | 0.0000 | +0.0000 |
| MRR | 0.0000 | 0.0000 | +0.0000 |

## 3. Retrieval / RAG Metrics

| Metric | Score |
| --- | ---: |
| Hit@1 | 0.0000 |
| Hit@3 | 0.0000 |
| Hit@5 | 0.0000 |
| Recall@5 | 0.0000 |
| Precision@5 | 0.0000 |
| MRR | 0.0000 |

## 4. Retrieval Interpretation

- Hit@5 < 0.75: retrieval needs improvement.
- MRR < 0.5: ranking quality is not good enough.
- Recall@5 < 0.65: retrieved context may be incomplete.

## 5. LLM Answer Metrics

| Metric | Score |
| --- | ---: |
| Numeric Accuracy | N/A |
| Avg Concept Coverage | 0.0000 |
| Avg Rule-based Score | 0.0000 |
| Model | N/A |
| Avg Latency Ms | N/A |
| Avg Correctness | N/A |
| Avg Groundedness | N/A |
| Avg Completeness | N/A |
| Avg Clarity | N/A |
| Avg Citation Usage | N/A |
| Avg Final Answer Score | N/A |
| Hallucination Rate | N/A |

## Error Analysis

### Retrieval

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| no_expected_chunks | 125 | Add gold relevant_chunk_ids to the eval case |

### Answer

No error patterns detected.

## 6. Weak Cases

| Case ID | Question | Expected Chunk IDs | Retrieved Chunk IDs | Retrieval Issue | Answer Issue |
| --- | --- | --- | --- | --- | --- |
| GOLD_DRAFT_CAPACITOR_001 | Một tụ điện có điện dung C = 2 μF được đặt vào hiệu điện thế U = 10 V. Tính điện tích của tụ. | - | - | - | Low rule-based score |
| GOLD_DRAFT_OHM_001 | Một điện trở R = 10 Ω được đặt vào hiệu điện thế U = 5 V. Tính cường độ dòng điện. | - | - | - | Low rule-based score |
| GOLD_DRAFT_SHM_PERIOD_001 | Một vật dao động điều hòa có ω = 4π rad/s. Tính chu kì T. | - | - | - | Low rule-based score |
| GOLD_DRAFT_SHM_POSITION_001 | Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Tính li độ tại t = 2 s. | - | - | - | Low rule-based score |
| GOLD_DRAFT_WAVE_SPEED_001 | Một sóng có tần số f = 5 Hz và tốc độ truyền sóng v = 2 m/s. Tính bước sóng. | - | - | - | Low rule-based score |

## 7. Conclusion

- RAG MVP status: not passed minimum benchmark.
- LLM Answer MVP status: not passed minimum benchmark.
- Top 3 priorities:

  - Hit@5 is low: inspect embeddings, query rewrite, or chunk data.
  - Recall@5 is low: retrieved context may miss relevant chunks.
  - MRR is low: ranking does not place relevant chunks high enough.

