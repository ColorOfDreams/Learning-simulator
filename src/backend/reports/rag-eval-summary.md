# AI/RAG Retrieval Evaluation Summary

- Run time: 2026-06-28T12:59:08.686Z

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
- Cases with hybrid results: 18
- Cases with vector results: 18
- Cases fallback keyword only: 0

## Before vs After RAG Comparison

| Metric | Before: keyword-only baseline | After: hybrid/vector RAG | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.3889 | 0.6667 | +0.2778 |
| Hit@3 | 0.7222 | 0.9444 | +0.2222 |
| Hit@5 | 0.8889 | 1.0000 | +0.1111 |
| Recall@5 | 0.7685 | 0.8981 | +0.1296 |
| Precision@5 | 0.2222 | 0.2667 | +0.0444 |
| MRR | 0.5852 | 0.7917 | +0.2065 |

## Metrics

| Metric | Value |
| --- | ---: |
| Hit@1 | 0.6667 |
| Hit@3 | 0.9444 |
| Hit@5 | 1.0000 |
| Recall@5 | 0.8981 |
| Precision@5 | 0.2667 |
| MRR | 0.7917 |

## Benchmark Comparison

| Metric | Score | Benchmark | Status |
| --- | ---: | --- | --- |
| Hit@1 | 0.6667 | Tracking only; no fixed threshold yet | TRACK |
| Hit@3 | 0.9444 | Tracking only; no fixed threshold yet | TRACK |
| Hit@5 | 1.0000 | >= 0.85 good; 0.75-0.85 acceptable; < 0.75 needs improvement | PASS |
| Recall@5 | 0.8981 | >= 0.65 required to reduce missing-context risk | PASS |
| Precision@5 | 0.2667 | Tracking only; affected by number of gold chunks | TRACK |
| MRR | 0.7917 | >= 0.50 required for acceptable ranking quality | PASS |

## Automatic Notes

- Hit@5: good.

## Error Analysis

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| relevant_found_but_rank_low | 8 | Tune reranking, hybrid weights, or increase topK |
| keyword_vector_disagreement | 2 | Tune hybrid scoring or normalize vector/keyword scores |

## Top 10 Weak Or Failed Cases

| Case ID | Question | Expected IDs | Retrieved IDs | Reason |
| --- | --- | --- | --- | --- |
| RAG_SMOKE_002 | Phương trình dao động điều hòa x = A cos(omega t + phi) có ý nghĩa như thế nào? | TH_PHY11_C01_L01_006, th_shm_002 | th_shm_002, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_008, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_005 | Low Recall@5 |
| RAG_SMOKE_003 | Trong phương trình x = A cos(omega t + phi), A, omega và phi là các đại lượng gì? | TH_PHY11_C01_L01_006, TH_PHY11_C01_L02_003, th_shm_002 | th_shm_002, TH_PHY11_C01_L02_008, TH_PHY11_C01_L01_017, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_005 | Low Recall@5 |
| RAG_SMOKE_004 | Biên độ dao động điều hòa được định nghĩa như thế nào? | TH_PHY11_C01_L02_003 | TH_PHY11_C01_L04_021, TH_PHY11_C01_L02_030, TH_PHY11_C01_L02_005, TH_PHY11_C01_L02_003, TH_PHY11_C01_L02_025 | Relevant chunk ranked too low |
| RAG_SMOKE_010 | Từ x = A cos(omega t + phi), phương trình vận tốc của vật dao động điều hòa là gì? | TH_PHY11_C01_L03_004 | TH_PHY11_C01_L03_021, TH_PHY11_C01_L03_011, TH_PHY11_C01_L03_004, TH_PHY11_C01_L04_011, TH_PHY11_C01_L04_006 | Relevant chunk ranked too low |
| RAG_SMOKE_011 | Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào? | TH_PHY11_C01_L03_011 | TH_PHY11_C01_L03_021, TH_PHY11_C01_L03_010, TH_PHY11_C01_L03_011, TH_PHY11_C01_L04_011, TH_PHY11_C01_L03_002 | Relevant chunk ranked too low |
| RAG_SMOKE_012 | Con lắc lò xo có chu kì dao động phụ thuộc vào khối lượng và độ cứng như thế nào? | TH_PHY11_C01_L05_013 | TH_PHY11_C01_L07_010, TH_PHY11_C01_L05_022, TH_PHY11_C01_L05_013, TH_PHY11_C01_L05_014, TH_PHY11_C01_L05_024 | Relevant chunk ranked too low |

