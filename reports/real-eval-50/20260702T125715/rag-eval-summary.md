# AI/RAG Retrieval Evaluation Summary

- Run time: 2026-07-02T12:48:51.172Z

## Cases

- Total: 50
- Evaluated: 50
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
- Cases with hybrid results: 50
- Cases with vector results: 50
- Cases fallback keyword only: 0

## Before vs After RAG Comparison

| Metric | Before: keyword-only baseline | After: hybrid/vector RAG | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.3800 | 0.4000 | +0.0200 |
| Hit@3 | 0.6000 | 0.7000 | +0.1000 |
| Hit@5 | 0.6600 | 0.9400 | +0.2800 |
| Recall@5 | 0.6600 | 0.9300 | +0.2700 |
| Precision@5 | 0.1320 | 0.1880 | +0.0560 |
| MRR | 0.5252 | 0.5898 | +0.0647 |

## Metrics

| Metric | Value |
| --- | ---: |
| Hit@1 | 0.4000 |
| Hit@3 | 0.7000 |
| Hit@5 | 0.9400 |
| Recall@5 | 0.9300 |
| Precision@5 | 0.1880 |
| MRR | 0.5898 |

## Benchmark Comparison

| Metric | Score | Benchmark | Status |
| --- | ---: | --- | --- |
| Hit@1 | 0.4000 | Tracking only; no fixed threshold yet | TRACK |
| Hit@3 | 0.7000 | Tracking only; no fixed threshold yet | TRACK |
| Hit@5 | 0.9400 | >= 0.85 good; 0.75-0.85 acceptable; < 0.75 needs improvement | PASS |
| Recall@5 | 0.9300 | >= 0.65 required to reduce missing-context risk | PASS |
| Precision@5 | 0.1880 | Tracking only; affected by number of gold chunks | TRACK |
| MRR | 0.5898 | >= 0.50 required for acceptable ranking quality | PASS |

## Automatic Notes

- Hit@5: good.

## Error Analysis

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| keyword_vector_disagreement | 13 | Tune hybrid scoring or normalize vector/keyword scores |
| relevant_found_but_rank_low | 12 | Tune reranking, hybrid weights, or increase topK |
| expected_not_in_top5 | 3 | Improve embedding/chunk metadata/hybrid weights |

## Top 10 Weak Or Failed Cases

| Case ID | Question | Expected IDs | Retrieved IDs | Reason |
| --- | --- | --- | --- | --- |
| REAL_EVAL_PHY11_SHM_EQUATION_001 | Trong phương trình dao động điều hòa x = A cos(ωt + φ), x, A, ω và φ có ý nghĩa gì? | TH_PHY11_C01_L01_006 | th_shm_002, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_008, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_005, TH_PHY11_C01_L01_006, TH_PHY11_C01_L04_007, TH_PHY11_C01_L04_002, TH_PHY11_C01_L02_025, TH_PHY11_C01_L04_014 | No expected chunk retrieved in top 5 |
| REAL_EVAL50_CHEM_013 | Trình bày ý chính của mục Khái niệm. | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S003_P01 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S001_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S017_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S005_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S018_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S022_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S014_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S007_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S003_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S013_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S011_P01 | No expected chunk retrieved in top 5 |
| REAL_EVAL50_MATH_007 | Nêu công thức hoặc quan hệ chính được trình bày trong mục Giải. | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S018_P01 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S012_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S016_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S013_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S010_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S015_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S005_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S002_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S007_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S019_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S022_P01 | No expected chunk retrieved in top 5 |
| REAL_EVAL_PHY11_SHM_POSITION_001 | Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Tính li độ tại t = 2 s. | TH_PHY11_C01_L01_007, TH_PHY11_C01_L01_006 | TH_PHY11_C01_L04_014, TH_PHY11_C01_L01_007, TH_PHY11_C01_L04_002, TH_PHY11_C01_L04_015, TH_PHY11_C01_L02_008, TH_PHY11_C01_L02_005, TH_PHY11_C01_L02_025, TH_PHY11_C01_L02_026, TH_PHY11_C01_L01_017, TH_PHY11_C01_L01_006 | Low Recall@5 |
| REAL_EVAL_PHY11_SHM_ACCELERATION_001 | Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào? | TH_PHY11_C01_L03_011 | TH_PHY11_C01_L03_021, TH_PHY11_C01_L03_010, TH_PHY11_C01_L03_011, TH_PHY11_C01_L04_011, TH_PHY11_C01_L03_002, TH_PHY11_C01_L03_018, TH_PHY11_C01_L03_004, TH_PHY11_C01_L03_001, TH_PHY11_C01_L03_015, TH_PHY11_C01_L04_006 | Relevant chunk ranked too low |
| REAL_EVAL_PHY11_WAVE_SPEED_001 | Một sóng có tần số f = 5 Hz và tốc độ truyền sóng v = 2 m/s. Tính bước sóng. | TH_PHY11_C02_L14_004 | TH_PHY11_C02_L14_009, TH_PHY11_C02_L14_010, TH_PHY11_C02_L14_003, TH_PHY11_C02_L14_004, TH_PHY11_C02_L08_010, TH_PHY11_C02_L14_005, TH_PHY11_C02_L08_009, TH_PHY11_C02_L08_007, TH_PHY11_C02_L08_023, TH_PHY11_C02_L08_008 | Relevant chunk ranked too low |
| REAL_EVAL50_PHYS_002 | Nêu công thức hoặc quan hệ chính được trình bày trong mục Độ phóng xạ. | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S023_P01 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S044_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S039_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S019_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S023_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S028_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S017_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S003_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S014_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S043_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S033_P01 | Relevant chunk ranked too low |
| REAL_EVAL50_PHYS_005 | Mô tả hiện tượng hoặc thí nghiệm được nêu trong mục Hiện tượng cộng hưởng trong đời sống. | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S019_P01 | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S016_P01, GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S022_P01, GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S019_P01, GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S014_P01, GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S017_P01, GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S021_P01, GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S009_P01, GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S015_P01, GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S005_P01, GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S004_P01 | Relevant chunk ranked too low |
| REAL_EVAL50_PHYS_011 | Trong mục Phương trình Clapeyron, bài hoặc công thức đang yêu cầu xác định đại lượng nào và dựa trên quan hệ nào? | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S009_P01 | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S002_P01, GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S016_P01, GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S009_P01, GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S001_P01, GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S004_P01, GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S003_P01, GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S008_P01, GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S010_P01, GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S015_P01, GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S012_P01 | Relevant chunk ranked too low |
| REAL_EVAL50_PHYS_013 | So sánh các khái niệm hoặc đại lượng chính được nêu trong mục Phản ứng tổng hợp hạt nhân. | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S031_P01 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S033_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S007_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S010_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S031_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S034_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S014_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S013_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S035_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S005_P01, GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S003_P01 | Relevant chunk ranked too low |

