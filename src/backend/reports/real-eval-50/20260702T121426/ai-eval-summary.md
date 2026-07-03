# AI/RAG Evaluation Report

## 1. Run Information

- Run time: 2026-07-02T12:14:26.570Z
- Eval source: file (D:\LearnSimulator\data\eval\real-eval-50.preview.json)
- Retrieval run: ok
- Answer run: ok
- Total cases: retrieval 50; answer 50
- Evaluated cases: retrieval 50; answer 50
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
- Theory chunks total: 4219
- Theory chunks with embedding: 4219
- Theory chunks missing embedding: 0
- Embedding dimensions in DB: 1536
- Embedding index count: 0
- Cases with hybrid results: 50
- Cases with vector results: 50
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
| Hit@1 | 0.3800 | 0.4000 | +0.0200 |
| Hit@3 | 0.6000 | 0.7000 | +0.1000 |
| Hit@5 | 0.6600 | 0.9400 | +0.2800 |
| Recall@5 | 0.6600 | 0.9300 | +0.2700 |
| Precision@5 | 0.1320 | 0.1880 | +0.0560 |
| MRR | 0.5252 | 0.5898 | +0.0647 |

## 3. Retrieval / RAG Metrics

| Metric | Score |
| --- | ---: |
| Hit@1 | 0.4000 |
| Hit@3 | 0.7000 |
| Hit@5 | 0.9400 |
| Recall@5 | 0.9300 |
| Precision@5 | 0.1880 |
| MRR | 0.5898 |

## 4. Retrieval Interpretation

- Hit@5 >= 0.85: good retrieval quality.
- MRR >= 0.5: relevant chunks usually appear reasonably high.
- Recall@5 >= 0.65: missing-context risk is acceptable.

## 5. LLM Answer Metrics

| Metric | Score |
| --- | ---: |
| Numeric Accuracy | 0.2000 |
| Avg Concept Coverage | 0.3000 |
| Avg Rule-based Score | 0.2967 |
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
| keyword_vector_disagreement | 13 | Tune hybrid scoring or normalize vector/keyword scores |
| relevant_found_but_rank_low | 12 | Tune reranking, hybrid weights, or increase topK |
| expected_not_in_top5 | 3 | Improve embedding/chunk metadata/hybrid weights |

### Answer

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| missing_required_concepts | 37 | Improve answer generation or required concept coverage |
| numeric_wrong | 4 | Improve calculation prompt and numeric extraction checks |

## 6. Weak Cases

| Case ID | Question | Expected Chunk IDs | Retrieved Chunk IDs | Retrieval Issue | Answer Issue |
| --- | --- | --- | --- | --- | --- |
| REAL_EVAL_PHY11_SHM_EQUATION_001 | Trong phương trình dao động điều hòa x = A cos(ωt + φ), x, A, ω và φ có ý nghĩa gì? | TH_PHY11_C01_L01_006 | th_shm_002, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_008, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_005, TH_PHY11_C01_L01_006, TH_PHY11_C01_L04_007, TH_PHY11_C01_L04_002, TH_PHY11_C01_L02_025, TH_PHY11_C01_L04_014 | No expected chunk found in top 5 | - |
| REAL_EVAL50_CHEM_013 | Trình bày ý chính của mục Khái niệm. | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S003_P01 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S001_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S017_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S005_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S018_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S022_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S014_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S007_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S003_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S013_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S011_P01 | No expected chunk found in top 5 | - |
| REAL_EVAL50_MATH_007 | Nêu công thức hoặc quan hệ chính được trình bày trong mục Giải. | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S018_P01 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S012_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S016_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S013_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S010_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S015_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S005_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S002_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S007_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S019_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S022_P01 | No expected chunk found in top 5 | - |
| REAL_EVAL_PHY11_SHM_POSITION_001 | Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Tính li độ tại t = 2 s. | TH_PHY11_C01_L01_007, TH_PHY11_C01_L01_006 | TH_PHY11_C01_L04_014, TH_PHY11_C01_L01_007, TH_PHY11_C01_L04_002, TH_PHY11_C01_L04_015, TH_PHY11_C01_L02_008, TH_PHY11_C01_L02_005, TH_PHY11_C01_L02_025, TH_PHY11_C01_L02_026, TH_PHY11_C01_L01_017, TH_PHY11_C01_L01_006 | Some expected chunks missing from top 5 | - |
| REAL_EVAL_PHY11_OHM_001 | Một điện trở R = 10 Ω được đặt vào hiệu điện thế U = 5 V. Tính cường độ dòng điện. | - | - | - | Numeric answer mismatch |
| REAL_EVAL50_PHYS_001 | Theo học liệu, Hiện tượng cộng hưởng trong đời sống là gì? | - | - | - | Low concept coverage |
| REAL_EVAL50_PHYS_002 | Nêu công thức hoặc quan hệ chính được trình bày trong mục Độ phóng xạ. | - | - | - | Low concept coverage |
| REAL_EVAL50_PHYS_005 | Mô tả hiện tượng hoặc thí nghiệm được nêu trong mục Hiện tượng cộng hưởng trong đời sống. | - | - | - | Low concept coverage |
| REAL_EVAL50_PHYS_006 | So sánh các khái niệm hoặc đại lượng chính được nêu trong mục Tác dụng của $N$ phân tử khí lên thành bình. | - | - | - | Low concept coverage |
| REAL_EVAL50_PHYS_007 | Bỏ qua các từ gây nhiễu như dao động, acid, phương trình bậc hai; theo đúng mục Giải, nội dung chính là gì? | - | - | - | Low concept coverage |

## 7. Conclusion

- RAG MVP status: passed minimum benchmark.
- LLM Answer MVP status: not passed minimum benchmark.
- Top 3 priorities:

  - Rule-based answer score is low: add expected answers or improve answer prompt.

