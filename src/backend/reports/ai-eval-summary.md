# AI/RAG Evaluation Report

## 1. Run Information

- Run time: 2026-06-27T10:11:40.877Z
- Eval source: smoke
- Retrieval run: ok
- Answer run: ok
- Total cases: retrieval 18; answer 18
- Evaluated cases: retrieval 18; answer 0
- Skipped cases: retrieval 0; answer 18
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
- Cases with hybrid results: 6
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
| Hit@1 | 0.1667 | 0.1667 | +0.0000 |
| Hit@3 | 0.3333 | 0.5000 | +0.1667 |
| Hit@5 | 0.3333 | 0.6667 | +0.3333 |
| Recall@5 | 0.2222 | 0.6389 | +0.4167 |
| Precision@5 | 0.0667 | 0.1778 | +0.1111 |
| MRR | 0.2500 | 0.3537 | +0.1037 |

## 3. Retrieval / RAG Metrics

| Metric | Score |
| --- | ---: |
| Hit@1 | 0.1667 |
| Hit@3 | 0.5000 |
| Hit@5 | 0.6667 |
| Recall@5 | 0.6389 |
| Precision@5 | 0.1778 |
| MRR | 0.3537 |

## 4. Retrieval Interpretation

- Hit@5 < 0.75: retrieval needs improvement.
- MRR < 0.5: ranking quality is not good enough.
- Recall@5 < 0.65: retrieved context may be incomplete.

## 5. LLM Answer Metrics

Answer evaluation produced a report, but no case was evaluated.

Likely reason: test cases are missing expected answer data.

## Error Analysis

### Retrieval

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| expected_not_in_top5 | 6 | Improve embedding/chunk metadata/hybrid weights |
| relevant_found_but_rank_low | 6 | Tune reranking, hybrid weights, or increase topK |

### Answer

No error patterns detected.

## 6. Weak Cases

| Case ID | Question | Expected Chunk IDs | Retrieved Chunk IDs | Retrieval Issue | Answer Issue |
| --- | --- | --- | --- | --- | --- |
| RAG_SMOKE_002 | Phương trình dao động điều hòa x = A cos(omega t + phi) có ý nghĩa như thế nào? | TH_PHY11_C01_L01_006 | th_shm_002, TH_PHY11_C01_L04_004, TH_PHY11_C01_L04_003, TH_PHY11_C01_L01_017, TH_PHY11_C01_L01_014 | No expected chunk found in top 5 | - |
| RAG_SMOKE_003 | Trong phương trình x = A cos(omega t + phi), A, omega và phi là các đại lượng gì? | TH_PHY11_C01_L01_006, TH_PHY11_C01_L02_003 | TH_PHY11_C01_L04_003, th_shm_002, TH_PHY11_C01_L04_004, TH_PHY11_C01_L04_002, TH_PHY11_C01_L02_020 | No expected chunk found in top 5 | - |
| RAG_SMOKE_004 | Biên độ dao động điều hòa được định nghĩa như thế nào? | TH_PHY11_C01_L02_003 | TH_PHY11_C01_L01_010, TH_PHY11_C01_L01_006, th_shm_001, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_004 | No expected chunk found in top 5 | - |
| RAG_SMOKE_008 | Pha ban đầu trong dao động điều hòa cho biết điều gì? | TH_PHY11_C01_L02_008 | TH_PHY11_C01_L01_006, TH_PHY11_C01_L01_014, TH_PHY11_C01_L01_017, TH_PHY11_C01_L01_007, TH_PHY11_C01_L02_030 | No expected chunk found in top 5 | - |
| RAG_SMOKE_011 | Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào? | TH_PHY11_C01_L03_011 | TH_PHY11_C01_L03_021, TH_PHY11_C01_L03_001, TH_PHY11_C01_L03_002, TH_PHY11_C01_L03_010, TH_PHY11_C01_L04_011 | No expected chunk found in top 5 | - |
| RAG_SMOKE_015 | Thế năng của vật dao động điều hòa được tính theo li độ x bằng công thức nào? | TH_PHY11_C01_L05_004, TH_PHY11_C01_L05_025 | TH_PHY11_C01_L05_002, TH_PHY11_C01_L05_010, TH_PHY11_C01_L07_025, TH_PHY11_C01_L07_001, TH_PHY11_C01_L05_008 | No expected chunk found in top 5 | - |
| RAG_SMOKE_016 | Cơ năng trong dao động điều hòa có biểu thức và tính chất bảo toàn như thế nào? | TH_PHY11_C01_L05_008, TH_PHY11_C01_L05_025 | TH_PHY11_C01_L07_001, TH_PHY11_C01_L05_008, TH_PHY11_C01_L07_025, TH_PHY11_C01_L05_026, TH_PHY11_C01_L05_001 | Some expected chunks missing from top 5 | - |

## 7. Conclusion

- RAG MVP status: not passed minimum benchmark.
- LLM Answer MVP status: not passed minimum benchmark.
- Top 3 priorities:

  - Hit@5 is low: inspect embeddings, query rewrite, or chunk data.
  - Recall@5 is low: retrieved context may miss relevant chunks.
  - MRR is low: ranking does not place relevant chunks high enough.

