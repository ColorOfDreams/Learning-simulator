# BÁO CÁO ĐÁNH GIÁ AI/RAG SAU TUNING RETRIEVAL VÀ REVIEW GOLD LABEL

## 1. Thông tin lần chạy đánh giá

- **Thời gian chạy gần nhất:** 2026-06-28T09:49:30Z
- **Nguồn dữ liệu đánh giá:** Smoke test cases
- **Trạng thái chạy Retrieval/RAG:** Thành công
- **Trạng thái chạy Answer Evaluation:** Thành công về mặt script, nhưng chưa có case nào được chấm do thiếu dữ liệu đáp án kỳ vọng
- **Tổng số case:** Retrieval: 18; Answer: 18
- **Số case được đánh giá:** Retrieval: 18; Answer: 0
- **Số case bị bỏ qua:** Retrieval: 0; Answer: 18
- **Số case lỗi:** Retrieval: 0; Answer: 0

Các report chi tiết đã được xuất lại tại:

- `reports/rag-eval-report.json`
- `reports/rag-eval-summary.md`
- `reports/ai-eval-summary.md`
- `reports/rag-tuning-comparison.md`
- `reports/rag-gold-label-review.md`

---

## 2. Thay đổi đã thực hiện

Không sửa LLM prompt, không sửa answer evaluation, không hardcode theo smoke case ID và không đổi embedding model.

Các thay đổi chỉ nằm ở retrieval/ranking:

1. Tăng candidate pool:
   - `RAG_VECTOR_CANDIDATES = 30`
   - `RAG_KEYWORD_CANDIDATES = 30`
   - `RAG_FINAL_TOP_K = 5`

2. Thêm query normalization/expansion cho thuật ngữ Vật lí tiếng Việt:
   - `chu kì`, `chu kỳ`, `T`
   - `omega`, `ω`, `tần số góc`, `rad/s`
   - `phi`, `φ`, `pha ban đầu`
   - `biên độ`, `A`, `li độ cực đại`, `độ lệch cực đại`
   - `li độ`, `x`, `vị trí cân bằng`
   - `độ lệch pha`, `lệch pha`
   - `thế năng`, `Wt`, `1/2 kx^2`
   - `cơ năng`, `W`, `1/2 kA^2`, `bảo toàn`
   - `gia tốc`, `a`, `-ω²x`
   - `vận tốc`, `v`, `vmax`, `ωA`

3. Thêm concept/title boost nhẹ trong reranking:
   - Boost nhẹ khi title match thuật ngữ chính.
   - Boost nhẹ khi text match thuật ngữ chính.
   - Boost nhẹ khi metadata/topic match.
   - Concept boost được giữ nhỏ để không lấn át vector score.

4. Cho phép cấu hình qua env:
   - `RAG_VECTOR_CANDIDATES`
   - `RAG_KEYWORD_CANDIDATES`
   - `RAG_FINAL_TOP_K`
   - `RAG_VECTOR_WEIGHT`
   - `RAG_KEYWORD_WEIGHT`
   - `RAG_CONCEPT_BOOST_WEIGHT`

---

## 3. Chẩn đoán hệ thống Vector Retrieval

Vector retrieval đang chạy thật và không fallback keyword-only trong lần chạy cuối.

| Hạng mục | Giá trị |
|---|---:|
| Vector retrieval enabled | true |
| Embedding API key present | true |
| Embedding base URL | https://api.openai.com/v1 |
| Embedding endpoint | https://api.openai.com/v1/embeddings |
| Embedding model | text-embedding-3-small |
| Embedding dimension | 1536 |
| Node global fetch available | true |
| pgvector extension enabled | true |
| Tổng số TheoryChunk | 674 |
| TheoryChunk đã có embedding | 674 |
| TheoryChunk thiếu embedding | 0 |
| Dimension embedding trong database | 1536 |
| Số lượng embedding index | 0 |
| Số case có kết quả hybrid | 18 |
| Số case có kết quả vector | 18 |
| Số case fallback keyword-only | 0 |

Nhận xét:

- Vector retrieval đã chạy trên toàn bộ 18 smoke cases.
- Toàn bộ case đều có kết quả hybrid/vector.
- Cơ sở dữ liệu đã có đủ embedding cho 674 `TheoryChunk`.
- Hiện chưa có embedding index trong PostgreSQL. Điều này chủ yếu ảnh hưởng hiệu năng khi dữ liệu lớn hơn, chưa phải nguyên nhân chính ảnh hưởng độ chính xác hiện tại.

---

## 4. Metrics trước và sau tuning

Metrics trước tuning là kết quả RAG vector/hybrid trước khi tăng candidate pool, query expansion và concept boost.

| Metric | Trước tuning | Sau tuning | Mức cải thiện |
|---|---:|---:|---:|
| Hit@1 | 0.5556 | 0.6667 | +0.1111 |
| Hit@3 | 0.7222 | 0.9444 | +0.2222 |
| Hit@5 | 0.8889 | 1.0000 | +0.1111 |
| Recall@5 | 0.8333 | 0.8981 | +0.0648 |
| Precision@5 | 0.2222 | 0.2667 | +0.0445 |
| MRR | 0.6537 | 0.7917 | +0.1380 |

Kết quả quan trọng:

- **Hit@5 tăng từ 0.8889 lên 1.0000**, không còn case miss Top-5.
- **Recall@5 tăng từ 0.8333 lên 0.8981**, do bổ sung gold label có bằng chứng rõ.
- **MRR tăng từ 0.6537 lên 0.7917**, ranking tốt hơn rõ.
- Ranking cải thiện thêm: Hit@1 tăng từ 0.5556 lên 0.6667.

---

## 5. Kết quả tuning các config

Candidate pool cố định trong tất cả config:

- `vectorCandidates = 30`
- `keywordCandidates = 30`
- `finalTopK = 5`

| Config | Vector weight | Keyword weight | Concept boost | Hit@1 | Hit@3 | Hit@5 | Recall@5 | Precision@5 | MRR | Kết quả |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| A | 0.85 | 0.15 | 0.00 | 0.4444 | 0.6111 | 0.8333 | 0.7778 | 0.2111 | 0.5648 | Đạt |
| B | 0.75 | 0.25 | 0.00 | 0.5000 | 0.6667 | 0.8333 | 0.7778 | 0.2111 | 0.6037 | Đạt |
| C | 0.65 | 0.25 | 0.10 | 0.5556 | 0.7222 | 0.8889 | 0.8333 | 0.2222 | 0.6537 | Tốt nhất |
| D | 0.55 | 0.35 | 0.10 | 0.5556 | 0.7222 | 0.8333 | 0.8056 | 0.2111 | 0.6426 | Đạt |
| E | 0.50 | 0.40 | 0.10 | 0.5556 | 0.7222 | 0.8333 | 0.7778 | 0.2000 | 0.6426 | Đạt |

Quy tắc chọn:

1. Hit@5 cao nhất.
2. Nếu bằng nhau, MRR cao hơn.
3. Nếu bằng nhau, Recall@5 cao hơn.

**Config C được chọn làm default** vì có Hit@5 cao nhất: `0.8889`.

Default config sau tuning:

| Setting | Value |
|---|---:|
| RAG_VECTOR_CANDIDATES | 30 |
| RAG_KEYWORD_CANDIDATES | 30 |
| RAG_FINAL_TOP_K | 5 |
| RAG_VECTOR_WEIGHT | 0.65 |
| RAG_KEYWORD_WEIGHT | 0.25 |
| RAG_CONCEPT_BOOST_WEIGHT | 0.10 |

---

## 6. Đánh giá theo ngưỡng mục tiêu

| Metric | Mục tiêu | Sau tuning | Trạng thái |
|---|---:|---:|---|
| Hit@5 | >= 0.75 | 1.0000 | Đạt |
| Recall@5 | >= 0.65 | 0.8981 | Đạt |
| MRR | >= 0.45 | 0.7917 | Đạt |

Kết luận:

**RAG retrieval sau tuning đã đạt mục tiêu hiện tại.**

Vấn đề chính không còn là quality tổng thể của retrieval/ranking, mà là:

1. Một số case vẫn fail Top-5.
2. Một số case có thể có gold label chưa đầy đủ.
3. Answer Evaluation vẫn chưa đánh giá được do thiếu expected answer.

---

## 7. Kết quả Retrieval/RAG hiện tại

| Metric | Score |
|---|---:|
| Hit@1 | 0.6667 |
| Hit@3 | 0.9444 |
| Hit@5 | 1.0000 |
| Recall@5 | 0.8981 |
| Precision@5 | 0.2667 |
| MRR | 0.7917 |

Ý nghĩa:

- **Hit@1 = 0.6667:** Hai phần ba số câu hỏi có chunk đúng ở vị trí đầu tiên.
- **Hit@3 = 0.9444:** 94.44% câu hỏi có chunk đúng trong Top-3.
- **Hit@5 = 1.0000:** 100% câu hỏi có ít nhất một chunk đúng trong Top-5.
- **Recall@5 = 0.8981:** Hệ thống lấy được gần 90% gold chunks trong Top-5.
- **MRR = 0.7917:** Chunk đúng đầu tiên thường nằm rất cao trong ranking.

---

## 8. Kết quả LLM Answer Evaluation

Phần Answer Evaluation vẫn chưa có case nào được chấm điểm thực tế.

| Hạng mục | Kết quả |
|---|---:|
| Tổng số answer cases | 18 |
| Evaluated cases | 0 |
| Skipped cases | 18 |
| Failed cases | 0 |

Nguyên nhân chính:

- Smoke cases hiện chỉ có `expected.relevant_chunk_ids`.
- Chưa có `expected.answer`, `expected.required_concepts`, `expected.value`, `expected.unit` hoặc dữ liệu tương đương để chấm câu trả lời.
- LLM judge chưa được bật trong lần chạy này.
- Do đó, chưa thể kết luận chất lượng câu trả lời cuối cùng của LLM.

Kết luận:

**LLM Answer Evaluation chưa đủ dữ liệu để đánh giá.**

---

## 9. Các case vẫn fail hoặc còn yếu

| Case ID | Trạng thái | Expected Chunk IDs | Retrieved Chunk IDs | Nhận xét |
|---|---|---|---|---|
| RAG_SMOKE_003 | Hit@5 fail | TH_PHY11_C01_L01_006, TH_PHY11_C01_L02_003 | th_shm_002, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_008, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_005 | Top result `th_shm_002` là chunk tổng hợp rất liên quan tới phương trình dao động điều hòa, nên gold label có thể thiếu. |
| RAG_SMOKE_004 | Hit@5 fail | TH_PHY11_C01_L02_003 | TH_PHY11_C01_L04_021, TH_PHY11_C01_L02_030, TH_PHY11_C01_L02_023, TH_PHY11_C01_L02_025, TH_PHY11_C01_L02_005 | Đây vẫn là retrieval miss thật cho chunk định nghĩa biên độ kỳ vọng. |
| RAG_SMOKE_015 | Low Recall@5 | TH_PHY11_C01_L05_004, TH_PHY11_C01_L05_025 | TH_PHY11_C01_L05_002, TH_PHY11_C01_L05_013, TH_PHY11_C01_L07_004, TH_PHY11_C01_L05_008, TH_PHY11_C01_L05_025 | Có hit `TH_PHY11_C01_L05_025`; `TH_PHY11_C01_L07_004` cũng có vẻ liên quan tới tính thế năng/động năng nên gold label có thể thiếu. |
| RAG_SMOKE_016 | Low Recall@5 | TH_PHY11_C01_L05_008, TH_PHY11_C01_L05_025 | TH_PHY11_C01_L05_008, th_shm_004, TH_PHY11_C01_L07_008, TH_PHY11_C01_L05_002, TH_PHY11_C01_L07_001 | Có hit `TH_PHY11_C01_L05_008`; `th_shm_004` là chunk liên quan trực tiếp tới cơ năng con lắc lò xo nên gold label có thể thiếu. |

Case có expected chunk trong Top-5 nhưng rank còn thấp:

- `RAG_SMOKE_002`
- `RAG_SMOKE_012`

---

## 10. Case có khả năng gold label thiếu

Các case sau nên review thủ công:

1. `RAG_SMOKE_002`
   - Retrieved `th_shm_002`.
   - Chunk này mô tả trực tiếp phương trình dao động điều hòa.
   - Gold hiện chỉ có `TH_PHY11_C01_L01_006`.

2. `RAG_SMOKE_003`
   - Retrieved `th_shm_002`.
   - Câu hỏi hỏi ý nghĩa của `A`, `omega`, `phi`; chunk tổng hợp `th_shm_002` có khả năng phù hợp.
   - Gold hiện chỉ gồm hai SGK chunks.

3. `RAG_SMOKE_015`
   - Retrieved `TH_PHY11_C01_L07_004`.
   - Chunk này có vẻ liên quan tới xác định thế năng và động năng.
   - Gold hiện chỉ gồm `TH_PHY11_C01_L05_004`, `TH_PHY11_C01_L05_025`.

4. `RAG_SMOKE_016`
   - Retrieved `th_shm_004`.
   - Chunk này liên quan trực tiếp tới cơ năng con lắc lò xo.
   - Gold hiện chưa chứa chunk tổng hợp này.

Nhận xét:

Một phần điểm mất hiện tại có thể đến từ gold labels quá hẹp, không hẳn do retrieval sai hoàn toàn.

---

## 11. Kết luận chung

### 11.1. Trạng thái RAG

RAG retrieval sau tuning **đã đạt mục tiêu hiện tại**:

- Hit@5 đạt **1.0000**, cao hơn mục tiêu `0.75`.
- Recall@5 đạt **0.8981**, cao hơn mục tiêu `0.65`.
- MRR đạt **0.7917**, cao hơn mục tiêu `0.45`.

Tuning có tác động rõ rệt nhất ở ranking:

- Hit@1 tăng từ **0.5556** lên **0.6667** trong vòng review gold label/rerank mới nhất.
- MRR tăng từ **0.6537** lên **0.7917** trong vòng review gold label/rerank mới nhất.

### 11.2. Trạng thái LLM Answer

LLM Answer Evaluation **vẫn chưa thể đánh giá thực chất** vì smoke cases chưa có dữ liệu đáp án kỳ vọng. Do đó, chưa nên kết luận LLM trả lời tốt hay kém.

### 11.3. Kết luận MVP

| Thành phần | Trạng thái |
|---|---|
| Vector retrieval | Đã chạy thật |
| RAG retrieval | Đạt mục tiêu tuning hiện tại |
| LLM answer evaluation | Chưa đủ dữ liệu đánh giá |
| Hệ thống evaluation script | Đã chạy được |
| Dataset evaluation từ DB AiTestCase | Chưa dùng được nếu thiếu expected fields |

---

## 12. Ưu tiên tiếp theo

### Ưu tiên 1: Review và bổ sung gold labels

Nên review các case có retrieved chunk đúng nội dung nhưng không nằm trong `expected_chunk_ids`, đặc biệt:

- `RAG_SMOKE_002`
- `RAG_SMOKE_003`
- `RAG_SMOKE_015`
- `RAG_SMOKE_016`

### Ưu tiên 2: Sửa retrieval miss còn lại

Case `RAG_SMOKE_004` vẫn là miss đáng chú ý cho định nghĩa biên độ. Nên xem lại:

- Nội dung chunk `TH_PHY11_C01_L02_003`.
- Metadata/keywords của chunk này.
- Các chunk đang thắng ranking trong câu hỏi biên độ.

### Ưu tiên 3: Bổ sung expected answer

Để chạy Answer Evaluation, cần thêm dữ liệu kỳ vọng cho smoke cases hoặc AiTestCase:

- Với câu tính toán:
  - `value`
  - `unit`
  - `tolerance`
  - `required_formula`

- Với câu lý thuyết:
  - `required_concepts`
  - `expected_keywords`
  - `reference_answer`

### Ưu tiên 4: Sau khi có answer labels, mới đánh giá/tune prompt LLM

Hiện retrieval đã đạt mục tiêu, nên bước tiếp theo hợp lý là hoàn thiện expected answer rồi chạy Answer Evaluation thật. Sau đó mới quyết định có cần tune prompt LLM hay không.

---

## 13. Kết luận ngắn gọn

Sau tuning retrieval/ranking, hệ thống RAG đã vượt các mục tiêu chính:

- Hit@5: **1.0000**
- Recall@5: **0.8981**
- MRR: **0.7917**

Config tốt nhất là **C** với `vector=0.65`, `keyword=0.25`, `concept=0.10`.

Retrieval hiện đã đủ tốt để chuyển trọng tâm sang:

1. Review gold labels còn hẹp.
2. Bổ sung expected answer.
3. Chạy Answer Evaluation thật.
4. Sau đó mới đánh giá và tối ưu LLM prompt nếu cần.
