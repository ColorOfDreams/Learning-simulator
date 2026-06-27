# AI/RAG Retrieval Evaluation Summary

- Run time: 2026-06-27T10:11:05.137Z

## Cases

- Total: 18
- Evaluated: 18
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
- Theory chunks total: 674
- Theory chunks with embedding: 674
- Theory chunks missing embedding: 0
- Embedding dimensions in DB: 1536
- Embedding index count: 0
- Cases with hybrid results: 6
- Cases with vector results: 18
- Cases fallback keyword only: 0

## Before vs After RAG Comparison

| Metric | Before: keyword-only baseline | After: hybrid/vector RAG | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.1667 | 0.1667 | +0.0000 |
| Hit@3 | 0.3333 | 0.5000 | +0.1667 |
| Hit@5 | 0.3333 | 0.6667 | +0.3333 |
| Recall@5 | 0.2222 | 0.6389 | +0.4167 |
| Precision@5 | 0.0667 | 0.1778 | +0.1111 |
| MRR | 0.2500 | 0.3537 | +0.1037 |

## Metrics

| Metric | Value |
| --- | ---: |
| Hit@1 | 0.1667 |
| Hit@3 | 0.5000 |
| Hit@5 | 0.6667 |
| Recall@5 | 0.6389 |
| Precision@5 | 0.1778 |
| MRR | 0.3537 |

## Benchmark Comparison

| Metric | Score | Benchmark | Status |
| --- | ---: | --- | --- |
| Hit@1 | 0.1667 | Tracking only; no fixed threshold yet | TRACK |
| Hit@3 | 0.5000 | Tracking only; no fixed threshold yet | TRACK |
| Hit@5 | 0.6667 | >= 0.85 good; 0.75-0.85 acceptable; < 0.75 needs improvement | FAIL |
| Recall@5 | 0.6389 | >= 0.65 required to reduce missing-context risk | FAIL |
| Precision@5 | 0.1778 | Tracking only; affected by number of gold chunks | TRACK |
| MRR | 0.3537 | >= 0.50 required for acceptable ranking quality | FAIL |

## Automatic Notes

- Hit@5: needs improvement.
- MRR < 0.5: ranking quality is not good enough.
- Recall@5 < 0.65: retrieved context may be incomplete.

## Error Analysis

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| expected_not_in_top5 | 6 | Improve embedding/chunk metadata/hybrid weights |
| relevant_found_but_rank_low | 6 | Tune reranking, hybrid weights, or increase topK |

## Top 10 Weak Or Failed Cases

| Case ID | Question | Expected IDs | Retrieved IDs | Reason |
| --- | --- | --- | --- | --- |
| RAG_SMOKE_002 | Phương trình dao động điều hòa x = A cos(omega t + phi) có ý nghĩa như thế nào? | TH_PHY11_C01_L01_006 | th_shm_002, TH_PHY11_C01_L04_004, TH_PHY11_C01_L04_003, TH_PHY11_C01_L01_017, TH_PHY11_C01_L01_014 | No expected chunk retrieved in top 5 |
| RAG_SMOKE_003 | Trong phương trình x = A cos(omega t + phi), A, omega và phi là các đại lượng gì? | TH_PHY11_C01_L01_006, TH_PHY11_C01_L02_003 | TH_PHY11_C01_L04_003, th_shm_002, TH_PHY11_C01_L04_004, TH_PHY11_C01_L04_002, TH_PHY11_C01_L02_020 | No expected chunk retrieved in top 5 |
| RAG_SMOKE_004 | Biên độ dao động điều hòa được định nghĩa như thế nào? | TH_PHY11_C01_L02_003 | TH_PHY11_C01_L01_010, TH_PHY11_C01_L01_006, th_shm_001, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_004 | No expected chunk retrieved in top 5 |
| RAG_SMOKE_008 | Pha ban đầu trong dao động điều hòa cho biết điều gì? | TH_PHY11_C01_L02_008 | TH_PHY11_C01_L01_006, TH_PHY11_C01_L01_014, TH_PHY11_C01_L01_017, TH_PHY11_C01_L01_007, TH_PHY11_C01_L02_030 | No expected chunk retrieved in top 5 |
| RAG_SMOKE_011 | Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào? | TH_PHY11_C01_L03_011 | TH_PHY11_C01_L03_021, TH_PHY11_C01_L03_001, TH_PHY11_C01_L03_002, TH_PHY11_C01_L03_010, TH_PHY11_C01_L04_011 | No expected chunk retrieved in top 5 |
| RAG_SMOKE_015 | Thế năng của vật dao động điều hòa được tính theo li độ x bằng công thức nào? | TH_PHY11_C01_L05_004, TH_PHY11_C01_L05_025 | TH_PHY11_C01_L05_002, TH_PHY11_C01_L05_010, TH_PHY11_C01_L07_025, TH_PHY11_C01_L07_001, TH_PHY11_C01_L05_008 | No expected chunk retrieved in top 5 |
| RAG_SMOKE_016 | Cơ năng trong dao động điều hòa có biểu thức và tính chất bảo toàn như thế nào? | TH_PHY11_C01_L05_008, TH_PHY11_C01_L05_025 | TH_PHY11_C01_L07_001, TH_PHY11_C01_L05_008, TH_PHY11_C01_L07_025, TH_PHY11_C01_L05_026, TH_PHY11_C01_L05_001 | Low Recall@5 |
| RAG_SMOKE_005 | Chu kì dao động là gì và đơn vị của chu kì là gì? | TH_PHY11_C01_L02_003, TH_PHY11_C01_L02_029 | TH_PHY11_C01_L01_014, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_029, TH_PHY11_C01_L02_003, TH_PHY11_C02_L10_002 | Relevant chunk ranked too low |
| RAG_SMOKE_007 | Tần số góc omega liên hệ với chu kì T và tần số f như thế nào? | TH_PHY11_C01_L02_029 | TH_PHY11_C01_L01_014, th_shm_003, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_029, TH_PHY11_C01_L02_005 | Relevant chunk ranked too low |
| RAG_SMOKE_010 | Từ x = A cos(omega t + phi), phương trình vận tốc của vật dao động điều hòa là gì? | TH_PHY11_C01_L03_004 | TH_PHY11_C01_L03_011, TH_PHY11_C01_L04_011, TH_PHY11_C01_L02_005, TH_PHY11_C01_L03_004, TH_PHY11_C01_L03_021 | Relevant chunk ranked too low |

