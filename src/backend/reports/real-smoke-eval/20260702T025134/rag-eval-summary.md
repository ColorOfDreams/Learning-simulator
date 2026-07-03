# AI/RAG Retrieval Evaluation Summary

- Run time: 2026-07-02T02:50:34.854Z

## Cases

- Total: 10
- Evaluated: 10
- Skipped: 0
- Failed: 0

## Vector Retrieval Diagnostics

- Vector retrieval enabled: true
- Embedding API key present: true
- Embedding base URL: https://api.openai.com/v1
- Embedding endpoint: https://api.openai.com/v1/embeddings
- Embedding model: text-embedding-3-small
- Embedding dimension: 1536
- Node global fetch available: true
- pgvector extension enabled: true
- Theory chunks total: 4219
- Theory chunks with embedding: 4219
- Theory chunks missing embedding: 0
- Embedding dimensions in DB: 1536
- Embedding index count: 0
- Cases with hybrid results: 10
- Cases with vector results: 10
- Cases fallback keyword only: 0

## Before vs After RAG Comparison

| Metric | Before: keyword-only baseline | After: hybrid/vector RAG | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.1000 | 0.4000 | +0.3000 |
| Hit@3 | 0.4000 | 0.8000 | +0.4000 |
| Hit@5 | 0.6000 | 0.9000 | +0.3000 |
| Recall@5 | 0.6000 | 0.8500 | +0.2500 |
| Precision@5 | 0.1200 | 0.1800 | +0.0600 |
| MRR | 0.2833 | 0.6083 | +0.3250 |

## Metrics

| Metric | Value |
| --- | ---: |
| Hit@1 | 0.4000 |
| Hit@3 | 0.8000 |
| Hit@5 | 0.9000 |
| Recall@5 | 0.8500 |
| Precision@5 | 0.1800 |
| MRR | 0.6083 |

## Benchmark Comparison

| Metric | Score | Benchmark | Status |
| --- | ---: | --- | --- |
| Hit@1 | 0.4000 | Tracking only; no fixed threshold yet | TRACK |
| Hit@3 | 0.8000 | Tracking only; no fixed threshold yet | TRACK |
| Hit@5 | 0.9000 | >= 0.85 good; 0.75-0.85 acceptable; < 0.75 needs improvement | PASS |
| Recall@5 | 0.8500 | >= 0.65 required to reduce missing-context risk | PASS |
| Precision@5 | 0.1800 | Tracking only; affected by number of gold chunks | TRACK |
| MRR | 0.6083 | >= 0.50 required for acceptable ranking quality | PASS |

## Automatic Notes

- Hit@5: good.

## Error Analysis

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| relevant_found_but_rank_low | 2 | Tune reranking, hybrid weights, or increase topK |
| keyword_vector_disagreement | 2 | Tune hybrid scoring or normalize vector/keyword scores |
| expected_not_in_top5 | 1 | Improve embedding/chunk metadata/hybrid weights |

## Top 10 Weak Or Failed Cases

| Case ID | Question | Expected IDs | Retrieved IDs | Reason |
| --- | --- | --- | --- | --- |
| REAL_EVAL_PHY11_SHM_EQUATION_001 | Trong phương trình dao động điều hòa x = A cos(ωt + φ), x, A, ω và φ có ý nghĩa gì? | TH_PHY11_C01_L01_006 | th_shm_002, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_008, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_005 | No expected chunk retrieved in top 5 |
| REAL_EVAL_PHY11_SHM_POSITION_001 | Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Tính li độ tại t = 2 s. | TH_PHY11_C01_L01_007, TH_PHY11_C01_L01_006 | TH_PHY11_C01_L04_014, TH_PHY11_C01_L01_007, TH_PHY11_C01_L04_002, TH_PHY11_C01_L04_015, TH_PHY11_C01_L02_008 | Low Recall@5 |
| REAL_EVAL_PHY11_SHM_ACCELERATION_001 | Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào? | TH_PHY11_C01_L03_011 | TH_PHY11_C01_L03_021, TH_PHY11_C01_L03_010, TH_PHY11_C01_L03_011, TH_PHY11_C01_L04_011, TH_PHY11_C01_L03_002 | Relevant chunk ranked too low |
| REAL_EVAL_PHY11_WAVE_SPEED_001 | Một sóng có tần số f = 5 Hz và tốc độ truyền sóng v = 2 m/s. Tính bước sóng. | TH_PHY11_C02_L14_004 | TH_PHY11_C02_L14_009, TH_PHY11_C02_L14_003, TH_PHY11_C02_L14_010, TH_PHY11_C02_L14_004, TH_PHY11_C02_L14_005 | Relevant chunk ranked too low |

