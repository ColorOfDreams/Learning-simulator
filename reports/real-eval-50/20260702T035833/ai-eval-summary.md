# AI/RAG Evaluation Report

## 1. Run Information

- Run time: 2026-07-02T03:58:33.276Z
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
| Hit@1 | 0.2200 | 0.3600 | +0.1400 |
| Hit@3 | 0.4000 | 0.6600 | +0.2600 |
| Hit@5 | 0.4800 | 0.8400 | +0.3600 |
| Recall@5 | 0.4800 | 0.8300 | +0.3500 |
| Precision@5 | 0.0960 | 0.1680 | +0.0720 |
| MRR | 0.3544 | 0.5462 | +0.1919 |

## 3. Retrieval / RAG Metrics

| Metric | Score |
| --- | ---: |
| Hit@1 | 0.3600 |
| Hit@3 | 0.6600 |
| Hit@5 | 0.8400 |
| Recall@5 | 0.8300 |
| Precision@5 | 0.1680 |
| MRR | 0.5462 |

## 4. Retrieval Interpretation

- Hit@5 is from 0.75 to below 0.85: acceptable for MVP.
- MRR >= 0.5: relevant chunks usually appear reasonably high.
- Recall@5 >= 0.65: missing-context risk is acceptable.

## 5. LLM Answer Metrics

| Metric | Score |
| --- | ---: |
| Numeric Accuracy | 0.6000 |
| Avg Concept Coverage | 0.3333 |
| Avg Rule-based Score | 0.3300 |
| Model | gpt-4o-mini |
| Avg Latency Ms | 3367.9200 |
| Avg Correctness | 3.6400 |
| Avg Groundedness | 3.8600 |
| Avg Completeness | 3.3800 |
| Avg Clarity | 4.1200 |
| Avg Citation Usage | 0.1000 |
| Avg Final Answer Score | 3.5140 |
| Hallucination Rate | 0.0200 |

## Error Analysis

### Retrieval

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| keyword_vector_disagreement | 13 | Tune hybrid scoring or normalize vector/keyword scores |
| relevant_found_but_rank_low | 9 | Tune reranking, hybrid weights, or increase topK |
| expected_not_in_top5 | 8 | Improve embedding/chunk metadata/hybrid weights |

### Answer

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| missing_required_concepts | 33 | Improve answer generation or required concept coverage |
| low_groundedness | 9 | Require answer to cite and use retrieved context |
| numeric_wrong | 2 | Improve calculation prompt and numeric extraction checks |
| hallucination | 1 | Constrain answer to references and reject unsupported claims |

## 6. Weak Cases

| Case ID | Question | Expected Chunk IDs | Retrieved Chunk IDs | Retrieval Issue | Answer Issue |
| --- | --- | --- | --- | --- | --- |
| REAL_EVAL_PHY11_SHM_EQUATION_001 | Trong phương trình dao động điều hòa x = A cos(ωt + φ), x, A, ω và φ có ý nghĩa gì? | TH_PHY11_C01_L01_006 | th_shm_002, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_008, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_005, TH_PHY11_C01_L01_006, TH_PHY11_C01_L04_007, TH_PHY11_C01_L04_002, TH_PHY11_C01_L02_025, TH_PHY11_C01_L04_014 | No expected chunk found in top 5 | - |
| REAL_EVAL50_CHEM_013 | Trình bày ý chính của mục Khái niệm. | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S003_P01 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S001_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S017_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S005_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S018_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S022_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S014_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S007_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S003_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S013_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S011_P01 | No expected chunk found in top 5 | Câu trả lời đề cập đến các khái niệm trong hóa học hữu cơ nhưng không cụ thể về khái niệm carboxylic acid và nhóm –COOH như trong context yêu cầu. Thông tin không hoàn toàn chính xác và thiếu chi tiết cần thiết. |
| REAL_EVAL50_MATH_002 | Nêu công thức hoặc quan hệ chính được trình bày trong mục Giải. | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S023_P01 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S006_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S005_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S027_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S010_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S018_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S015_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S001_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S009_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S023_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S020_P01 | No expected chunk found in top 5 | - |
| REAL_EVAL50_MATH_004 | Trong mục Giải, bài hoặc công thức đang yêu cầu xác định đại lượng nào và dựa trên quan hệ nào? | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S012_P01 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S010_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S013_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S016_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S009_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S015_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S012_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S019_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S005_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S025_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S024_P01 | No expected chunk found in top 5 | Câu trả lời chỉ ra rằng không đủ dữ liệu để xác định đại lượng và quan hệ, nhưng không dựa trên CONTEXT đã cung cấp, dẫn đến groundedness thấp. |
| REAL_EVAL50_MATH_007 | Nêu công thức hoặc quan hệ chính được trình bày trong mục Giải. | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S018_P01 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S016_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S013_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S010_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S015_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S005_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S012_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S019_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S002_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S022_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S024_P01 | No expected chunk found in top 5 | - |
| REAL_EVAL50_MATH_008 | Trình bày ý chính của mục ận dụng. | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S022_P01 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S012_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S014_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S024_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S015_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S009_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S011_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S016_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S020_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S013_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S019_P01 | No expected chunk found in top 5 | - |
| REAL_EVAL50_MATH_009 | Theo học liệu, Luyện tập 1 là gì? | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S009_P01 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S001_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S023_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S003_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S047_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S039_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S008_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S009_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S028_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S040_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S027_P01 | No expected chunk found in top 5 | Câu trả lời đúng về mục đích của Luyện tập 1 nhưng không đề cập đến nội dung cụ thể của bài tập như trong CONTEXT. |
| REAL_EVAL50_MATH_010 | Nêu công thức hoặc quan hệ chính được trình bày trong mục Giải. | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S020_P01 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S006_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S005_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S027_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S010_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S018_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S015_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S001_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S009_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S023_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S020_P01 | No expected chunk found in top 5 | - |
| REAL_EVAL_PHY11_SHM_POSITION_001 | Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Tính li độ tại t = 2 s. | TH_PHY11_C01_L01_007, TH_PHY11_C01_L01_006 | TH_PHY11_C01_L04_014, TH_PHY11_C01_L01_007, TH_PHY11_C01_L04_002, TH_PHY11_C01_L04_015, TH_PHY11_C01_L02_008, TH_PHY11_C01_L02_005, TH_PHY11_C01_L02_025, TH_PHY11_C01_L02_026, TH_PHY11_C01_L01_017, TH_PHY11_C01_L01_006 | Some expected chunks missing from top 5 | - |
| REAL_EVAL50_CHEM_002 | Nêu công thức hoặc quan hệ chính được trình bày trong mục Một số vật liệu polymer phổ biến. | - | - | - | Câu trả lời chỉ nêu rằng chưa đủ dữ kiện mà không cung cấp thông tin cụ thể nào về các vật liệu polymer, thành phần, nguồn gốc hay tính chất của chúng như yêu cầu trong câu hỏi. |

## 7. Conclusion

- RAG MVP status: passed minimum benchmark.
- LLM Answer MVP status: not passed minimum benchmark.
- Top 3 priorities:

  - Rule-based answer score is low: add expected answers or improve answer prompt.

