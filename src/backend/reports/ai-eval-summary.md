# AI/RAG Evaluation Report

## 1. Run Information

- Run time: 2026-06-28T13:00:36.911Z
- Eval source: smoke
- Retrieval run: ok
- Answer run: ok
- Total cases: retrieval 18; answer 18
- Evaluated cases: retrieval 18; answer 18
- Skipped cases: retrieval 0; answer 0
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
- Theory chunks total: 674
- Theory chunks with embedding: 674
- Theory chunks missing embedding: 0
- Embedding dimensions in DB: 1536
- Embedding index count: 0
- Cases with hybrid results: 18
- Cases with vector results: 18
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
| Hit@1 | 0.3889 | 0.6667 | +0.2778 |
| Hit@3 | 0.7222 | 0.9444 | +0.2222 |
| Hit@5 | 0.8889 | 1.0000 | +0.1111 |
| Recall@5 | 0.7685 | 0.8981 | +0.1296 |
| Precision@5 | 0.2222 | 0.2667 | +0.0444 |
| MRR | 0.5852 | 0.7917 | +0.2065 |

## 3. Retrieval / RAG Metrics

| Metric | Score |
| --- | ---: |
| Hit@1 | 0.6667 |
| Hit@3 | 0.9444 |
| Hit@5 | 1.0000 |
| Recall@5 | 0.8981 |
| Precision@5 | 0.2667 |
| MRR | 0.7917 |

## 4. Retrieval Interpretation

- Hit@5 >= 0.85: good retrieval quality.
- MRR >= 0.5: relevant chunks usually appear reasonably high.
- Recall@5 >= 0.65: missing-context risk is acceptable.

## 5. LLM Answer Metrics

| Metric | Score |
| --- | ---: |
| Numeric Accuracy | N/A |
| Avg Concept Coverage | 0.9389 |
| Avg Rule-based Score | 0.9389 |
| Model | gpt-4o-mini |
| Avg Latency Ms | 3302.8333 |
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
| relevant_found_but_rank_low | 8 | Tune reranking, hybrid weights, or increase topK |
| keyword_vector_disagreement | 2 | Tune hybrid scoring or normalize vector/keyword scores |

### Answer

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| missing_required_concepts | 5 | Improve answer generation or required concept coverage |

## 6. Weak Cases

| Case ID | Question | Expected Chunk IDs | Retrieved Chunk IDs | Retrieval Issue | Answer Issue |
| --- | --- | --- | --- | --- | --- |
| RAG_SMOKE_003 | Trong phương trình x = A cos(omega t + phi), A, omega và phi là các đại lượng gì? | TH_PHY11_C01_L01_006, TH_PHY11_C01_L02_003, th_shm_002 | th_shm_002, TH_PHY11_C01_L02_008, TH_PHY11_C01_L01_017, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_005 | Some expected chunks missing from top 5 | - |
| RAG_SMOKE_002 | Phương trình dao động điều hòa x = A cos(omega t + phi) có ý nghĩa như thế nào? | TH_PHY11_C01_L01_006, th_shm_002 | th_shm_002, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_008, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_005 | Some expected chunks missing from top 5 | - |
| RAG_SMOKE_015 | Thế năng của vật dao động điều hòa được tính theo li độ x bằng công thức nào? | TH_PHY11_C01_L05_004, TH_PHY11_C01_L05_025, TH_PHY11_C01_L05_013 | TH_PHY11_C01_L05_002, TH_PHY11_C01_L05_013, TH_PHY11_C01_L07_004, TH_PHY11_C01_L05_008, TH_PHY11_C01_L05_025 | Some expected chunks missing from top 5 | - |
| RAG_SMOKE_016 | Cơ năng trong dao động điều hòa có biểu thức và tính chất bảo toàn như thế nào? | TH_PHY11_C01_L05_008, TH_PHY11_C01_L05_025, th_shm_004 | TH_PHY11_C01_L05_008, th_shm_004, TH_PHY11_C01_L07_008, TH_PHY11_C01_L05_002, TH_PHY11_C01_L05_019 | Some expected chunks missing from top 5 | - |

## 7. Conclusion

- RAG MVP status: passed minimum benchmark.
- LLM Answer MVP status: passed minimum benchmark.
- Top 3 priorities:

  - No clear priority issue detected.

