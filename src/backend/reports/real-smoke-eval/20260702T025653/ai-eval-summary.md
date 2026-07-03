# AI/RAG Evaluation Report

## 1. Run Information

- Run time: 2026-07-02T02:56:53.717Z
- Eval source: smoke
- Retrieval run: ok
- Answer run: ok
- Total cases: retrieval 10; answer 10
- Evaluated cases: retrieval 10; answer 10
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
- Cases with hybrid results: 10
- Cases with vector results: 10
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
| Hit@1 | 0.1000 | 0.4000 | +0.3000 |
| Hit@3 | 0.4000 | 0.8000 | +0.4000 |
| Hit@5 | 0.6000 | 0.9000 | +0.3000 |
| Recall@5 | 0.6000 | 0.8500 | +0.2500 |
| Precision@5 | 0.1200 | 0.1800 | +0.0600 |
| MRR | 0.2833 | 0.6083 | +0.3250 |

## 3. Retrieval / RAG Metrics

| Metric | Score |
| --- | ---: |
| Hit@1 | 0.4000 |
| Hit@3 | 0.8000 |
| Hit@5 | 0.9000 |
| Recall@5 | 0.8500 |
| Precision@5 | 0.1800 |
| MRR | 0.6083 |

## 4. Retrieval Interpretation

- Hit@5 >= 0.85: good retrieval quality.
- MRR >= 0.5: relevant chunks usually appear reasonably high.
- Recall@5 >= 0.65: missing-context risk is acceptable.

## 5. LLM Answer Metrics

| Metric | Score |
| --- | ---: |
| Numeric Accuracy | 0.2000 |
| Avg Concept Coverage | 0.5333 |
| Avg Rule-based Score | 0.5167 |
| Model | N/A |
| Avg Latency Ms | N/A |
| Avg Correctness | 3.3000 |
| Avg Groundedness | 3.7000 |
| Avg Completeness | 3.3000 |
| Avg Clarity | 3.5000 |
| Avg Citation Usage | 1.6000 |
| Avg Final Answer Score | 3.3350 |
| Hallucination Rate | 0.3000 |

## Error Analysis

### Retrieval

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| relevant_found_but_rank_low | 2 | Tune reranking, hybrid weights, or increase topK |
| keyword_vector_disagreement | 2 | Tune hybrid scoring or normalize vector/keyword scores |
| expected_not_in_top5 | 1 | Improve embedding/chunk metadata/hybrid weights |

### Answer

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| missing_required_concepts | 3 | Improve answer generation or required concept coverage |
| hallucination | 3 | Constrain answer to references and reject unsupported claims |
| numeric_wrong | 1 | Improve calculation prompt and numeric extraction checks |

## 6. Weak Cases

| Case ID | Question | Expected Chunk IDs | Retrieved Chunk IDs | Retrieval Issue | Answer Issue |
| --- | --- | --- | --- | --- | --- |
| REAL_EVAL_PHY11_SHM_EQUATION_001 | Trong phương trình dao động điều hòa x = A cos(ωt + φ), x, A, ω và φ có ý nghĩa gì? | TH_PHY11_C01_L01_006 | th_shm_002, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_008, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_005 | No expected chunk found in top 5 | - |
| REAL_EVAL_PHY11_SHM_POSITION_001 | Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Tính li độ tại t = 2 s. | TH_PHY11_C01_L01_007, TH_PHY11_C01_L01_006 | TH_PHY11_C01_L04_014, TH_PHY11_C01_L01_007, TH_PHY11_C01_L04_002, TH_PHY11_C01_L04_015, TH_PHY11_C01_L02_008 | Some expected chunks missing from top 5 | Câu trả lời không tính toán li độ tại t = 2 s mà chỉ lặp lại câu hỏi và không sử dụng phương trình đúng trong CONTEXT. Phương trình trong câu trả lời không khớp với phương trình đã cho trong CONTEXT. |
| REAL_EVAL_PHY11_WAVE_SPEED_001 | Một sóng có tần số f = 5 Hz và tốc độ truyền sóng v = 2 m/s. Tính bước sóng. | - | - | - | Câu trả lời không liên quan đến câu hỏi về bước sóng với tần số và tốc độ đã cho, mà lại lặp lại thông tin từ một ví dụ không liên quan. |
| REAL_EVAL_PHY11_OHM_001 | Một điện trở R = 10 Ω được đặt vào hiệu điện thế U = 5 V. Tính cường độ dòng điện. | - | - | - | Câu trả lời không liên quan đến câu hỏi về cường độ dòng điện và không sử dụng thông tin từ CONTEXT. |
| REAL_EVAL_PHY11_CAPACITOR_001 | Một tụ điện có điện dung C = 2 μF được đặt vào hiệu điện thế U = 10 V. Tính điện tích của tụ. | - | - | - | Câu trả lời cung cấp công thức Q = CU và giải thích các đại lượng liên quan, nhưng không thực hiện phép tính cụ thể để tìm giá trị điện tích Q. Do đó, độ chính xác và độ hoàn chỉnh của câu trả lời không cao. |
| REAL_EVAL_PHY11_SHM_PERIOD_001 | Một vật dao động điều hòa có ω = 4π rad/s. Tính chu kì T. | - | - | - | Câu trả lời đúng, dựa vào CONTEXT cung cấp và giải thích rõ ràng cách tính chu kì T từ tần số góc ω. |
| REAL_EVAL_PHY11_SHM_ACCELERATION_001 | Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào? | - | - | - | Câu trả lời đúng và dựa vào thông tin trong CONTEXT, cung cấp công thức gia tốc và các thông tin liên quan đến dao động điều hòa. |
| REAL_EVAL_PHY11_STANDING_WAVE_001 | Điều kiện để có sóng dừng trên dây có hai đầu cố định là gì? | - | - | - | Câu trả lời hoàn toàn chính xác, dựa trên thông tin trong CONTEXT và cung cấp đầy đủ các điều kiện cần thiết để có sóng dừng trên dây có hai đầu cố định. |

## 7. Conclusion

- RAG MVP status: passed minimum benchmark.
- LLM Answer MVP status: not passed minimum benchmark.
- Top 3 priorities:

  - Rule-based answer score is low: add expected answers or improve answer prompt.
  - Judge final score is low: improve correctness, completeness, or groundedness.
  - Hallucination rate is high: make answers rely on context and citations more clearly.

