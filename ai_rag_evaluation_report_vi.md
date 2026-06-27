# BÁO CÁO ĐÁNH GIÁ AI/RAG HIỆN TẠI

## 1. Thông tin lần chạy đánh giá

- **Thời gian chạy:** 2026-06-27T10:11:40.877Z
- **Nguồn dữ liệu đánh giá:** Smoke test cases
- **Trạng thái chạy Retrieval/RAG:** Thành công
- **Trạng thái chạy Answer Evaluation:** Thành công về mặt script, nhưng chưa có case nào được chấm do thiếu dữ liệu đáp án kỳ vọng
- **Tổng số case:** Retrieval: 18; Answer: 18
- **Số case được đánh giá:** Retrieval: 18; Answer: 0
- **Số case bị bỏ qua:** Retrieval: 0; Answer: 18
- **Số case lỗi:** Retrieval: 0; Answer: 0

---

## 2. Chẩn đoán hệ thống Vector Retrieval

Kết quả chẩn đoán cho thấy hệ thống vector retrieval đã được kích hoạt và hoạt động đúng. Toàn bộ `TheoryChunk` hiện đã có embedding, đồng thời truy vấn vector không còn fallback về keyword-only như lần chạy ban đầu.

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
| Số case có kết quả hybrid | 6 |
| Số case có kết quả vector | 18 |
| Số case fallback keyword-only | 0 |

Nhận xét:

- Vector retrieval đã chạy thật trên toàn bộ 18 smoke cases.
- Không còn case nào fallback hoàn toàn về keyword-only.
- Cơ sở dữ liệu đã có đủ embedding cho 674 `TheoryChunk`.
- Hiện chưa có embedding index trong PostgreSQL. Điều này chủ yếu ảnh hưởng đến hiệu năng truy vấn khi dữ liệu lớn hơn, chưa chắc ảnh hưởng trực tiếp đến độ chính xác hiện tại.

---

## 3. So sánh trước và sau khi bật vector retrieval

Lần đánh giá ban đầu có lỗi `fetch failed` ở embedding API nên hệ thống phải fallback về keyword retrieval. Sau khi sửa môi trường mạng và chạy lại với vector retrieval thật, các chỉ số RAG đã cải thiện rõ rệt.

| Metric | Trước: keyword-only baseline | Sau: hybrid/vector RAG | Mức cải thiện |
|---|---:|---:|---:|
| Hit@1 | 0.1667 | 0.1667 | +0.0000 |
| Hit@3 | 0.3333 | 0.5000 | +0.1667 |
| Hit@5 | 0.3333 | 0.6667 | +0.3333 |
| Recall@5 | 0.2222 | 0.6389 | +0.4167 |
| Precision@5 | 0.0667 | 0.1778 | +0.1111 |
| MRR | 0.2500 | 0.3537 | +0.1037 |

Nhận xét:

- **Hit@5 tăng mạnh từ 0.3333 lên 0.6667**, cho thấy vector retrieval giúp hệ thống tìm được nhiều chunk liên quan hơn trong Top-5.
- **Recall@5 tăng từ 0.2222 lên 0.6389**, chứng minh context được truy hồi đầy đủ hơn đáng kể so với keyword-only baseline.
- **MRR chỉ tăng từ 0.2500 lên 0.3537**, cho thấy ranking vẫn chưa tốt: chunk đúng có thể đã lọt vào Top-5 nhưng chưa thường xuyên nằm ở vị trí đầu.

---

## 4. Kết quả Retrieval/RAG hiện tại

| Metric | Score |
|---|---:|
| Hit@1 | 0.1667 |
| Hit@3 | 0.5000 |
| Hit@5 | 0.6667 |
| Recall@5 | 0.6389 |
| Precision@5 | 0.1778 |
| MRR | 0.3537 |

### Ý nghĩa các chỉ số

- **Hit@1 = 0.1667:** Chỉ khoảng 16.67% câu hỏi có chunk đúng nằm ở vị trí đầu tiên.
- **Hit@3 = 0.5000:** 50% câu hỏi có chunk đúng nằm trong Top-3.
- **Hit@5 = 0.6667:** 66.67% câu hỏi có ít nhất một chunk đúng trong Top-5.
- **Recall@5 = 0.6389:** Hệ thống truy hồi được khoảng 63.89% số chunk kỳ vọng trong Top-5.
- **Precision@5 = 0.1778:** Tỷ lệ chunk đúng trong Top-5 còn thấp. Tuy nhiên, với mỗi câu hỏi chỉ có ít gold chunk, chỉ số này không phải ưu tiên chính bằng Hit@5, Recall@5 và MRR.
- **MRR = 0.3537:** Chunk đúng đầu tiên thường chưa nằm ở vị trí đủ cao trong ranking.

---

## 5. Đánh giá chất lượng Retrieval

Theo ngưỡng đánh giá MVP đã đặt ra:

| Metric | Ngưỡng MVP tối thiểu | Kết quả hiện tại | Trạng thái |
|---|---:|---:|---|
| Hit@5 | >= 0.75 | 0.6667 | Chưa đạt |
| Recall@5 | >= 0.65 | 0.6389 | Gần đạt |
| MRR | >= 0.50 | 0.3537 | Chưa đạt |

Kết luận:

**RAG hiện tại đã cải thiện rõ sau khi bật vector retrieval, nhưng vẫn chưa đạt mức MVP.**

Vấn đề chính không còn nằm ở việc vector retrieval bị lỗi, mà nằm ở:

1. Chunk đúng chưa xuất hiện đủ ổn định trong Top-5.
2. Chunk đúng thường chưa được xếp ở vị trí đủ cao.
3. Một số case có thể có gold label chưa đầy đủ, tức retrieved chunk có thể đúng về mặt nội dung nhưng không nằm trong danh sách `expected_chunk_ids`.

---

## 6. Kết quả LLM Answer Evaluation

Phần Answer Evaluation đã chạy được về mặt script, nhưng chưa có case nào được chấm điểm thực tế.

| Hạng mục | Kết quả |
|---|---:|
| Tổng số answer cases | 18 |
| Evaluated cases | 0 |
| Skipped cases | 18 |
| Failed cases | 0 |

Nguyên nhân chính:

- Các smoke cases hiện chỉ có `expected.relevant_chunk_ids`.
- Chưa có `expected.answer`, `expected.required_concepts`, `expected.value`, `expected.unit` hoặc dữ liệu tương đương để chấm câu trả lời.
- LLM judge chưa được bật.
- Do đó, hiện chưa thể kết luận chất lượng câu trả lời cuối cùng của LLM.

Kết luận:

**LLM Answer Evaluation chưa đủ dữ liệu để đánh giá.**  
Cần bổ sung expected answer cho smoke cases hoặc AiTestCase trước khi chấm được các metric như correctness, groundedness, completeness, clarity và hallucination rate.

---

## 7. Phân tích lỗi Retrieval

### 7.1. Tổng hợp loại lỗi

| Loại lỗi | Số lượng | Hướng xử lý đề xuất |
|---|---:|---|
| expected_not_in_top5 | 6 | Cải thiện embedding retrieval, metadata, query expansion hoặc hybrid weights |
| relevant_found_but_rank_low | 6 | Tune reranking, hybrid weights, tăng candidate pool hoặc thêm concept/title boost |

### 7.2. Nhận xét

Hai loại lỗi chính cho thấy hệ thống không còn thất bại hoàn toàn ở bước tìm kiếm, mà đang gặp vấn đề ở **ranking** và **độ đầy đủ của candidate pool**.

Cụ thể:

- `expected_not_in_top5`: chunk kỳ vọng không xuất hiện trong Top-5. Có thể do query chưa được mở rộng tốt, chunk metadata chưa đủ rõ, hoặc expected chunk chưa phải chunk phù hợp nhất.
- `relevant_found_but_rank_low`: chunk liên quan có xuất hiện nhưng chưa được đẩy lên vị trí cao. Đây là dấu hiệu cần tối ưu reranking.

---

## 8. Các case yếu đáng chú ý

| Case ID | Câu hỏi | Expected Chunk IDs | Retrieved Chunk IDs | Vấn đề Retrieval | Vấn đề Answer |
|---|---|---|---|---|---|
| RAG_SMOKE_002 | Phương trình dao động điều hòa x = A cos(omega t + phi) có ý nghĩa như thế nào? | TH_PHY11_C01_L01_006 | th_shm_002, TH_PHY11_C01_L04_004, TH_PHY11_C01_L04_003, TH_PHY11_C01_L01_017, TH_PHY11_C01_L01_014 | Không tìm thấy expected chunk trong Top-5 | Chưa đánh giá |
| RAG_SMOKE_003 | Trong phương trình x = A cos(omega t + phi), A, omega và phi là các đại lượng gì? | TH_PHY11_C01_L01_006, TH_PHY11_C01_L02_003 | TH_PHY11_C01_L04_003, th_shm_002, TH_PHY11_C01_L04_004, TH_PHY11_C01_L04_002, TH_PHY11_C01_L02_020 | Không tìm thấy expected chunk trong Top-5 | Chưa đánh giá |
| RAG_SMOKE_004 | Biên độ dao động điều hòa được định nghĩa như thế nào? | TH_PHY11_C01_L02_003 | TH_PHY11_C01_L01_010, TH_PHY11_C01_L01_006, th_shm_001, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_004 | Không tìm thấy expected chunk trong Top-5 | Chưa đánh giá |
| RAG_SMOKE_008 | Pha ban đầu trong dao động điều hòa cho biết điều gì? | TH_PHY11_C01_L02_008 | TH_PHY11_C01_L01_006, TH_PHY11_C01_L01_014, TH_PHY11_C01_L01_017, TH_PHY11_C01_L01_007, TH_PHY11_C01_L02_030 | Không tìm thấy expected chunk trong Top-5 | Chưa đánh giá |
| RAG_SMOKE_011 | Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào? | TH_PHY11_C01_L03_011 | TH_PHY11_C01_L03_021, TH_PHY11_C01_L03_001, TH_PHY11_C01_L03_002, TH_PHY11_C01_L03_010, TH_PHY11_C01_L04_011 | Không tìm thấy expected chunk trong Top-5 | Chưa đánh giá |
| RAG_SMOKE_015 | Thế năng của vật dao động điều hòa được tính theo li độ x bằng công thức nào? | TH_PHY11_C01_L05_004, TH_PHY11_C01_L05_025 | TH_PHY11_C01_L05_002, TH_PHY11_C01_L05_010, TH_PHY11_C01_L07_025, TH_PHY11_C01_L07_001, TH_PHY11_C01_L05_008 | Không tìm thấy expected chunk trong Top-5 | Chưa đánh giá |
| RAG_SMOKE_016 | Cơ năng trong dao động điều hòa có biểu thức và tính chất bảo toàn như thế nào? | TH_PHY11_C01_L05_008, TH_PHY11_C01_L05_025 | TH_PHY11_C01_L07_001, TH_PHY11_C01_L05_008, TH_PHY11_C01_L07_025, TH_PHY11_C01_L05_026, TH_PHY11_C01_L05_001 | Thiếu một số expected chunks trong Top-5 | Chưa đánh giá |

Nhận xét quan trọng:

Một số case có khả năng không phải retrieval sai hoàn toàn. Ví dụ, hệ thống có thể truy hồi chunk khác nhưng vẫn liên quan về mặt nội dung. Vì vậy cần review thủ công các case fail để xác định:

1. Retrieval thật sự sai.
2. Retrieved chunk đúng nhưng gold label chưa đầy đủ.
3. Expected chunk chưa phải chunk tốt nhất.
4. Chunking hoặc metadata chưa đủ rõ.

---

## 9. Kết luận chung

### 9.1. Trạng thái RAG

RAG hiện tại **chưa đạt benchmark MVP tối thiểu**, nhưng đã có cải thiện lớn sau khi vector retrieval chạy thật.

Kết quả quan trọng nhất:

- Hit@5 tăng từ **0.3333** lên **0.6667**.
- Recall@5 tăng từ **0.2222** lên **0.6389**.
- MRR tăng từ **0.2500** lên **0.3537**.

Điều này chứng minh embedding/vector retrieval có tác dụng rõ ràng. Tuy nhiên, ranking vẫn chưa tốt, thể hiện qua Hit@1 thấp và MRR chưa đạt ngưỡng.

### 9.2. Trạng thái LLM Answer

LLM Answer Evaluation **chưa thể đánh giá thực chất** vì các smoke cases chưa có dữ liệu đáp án kỳ vọng. Do đó, không nên kết luận LLM trả lời tốt hay kém ở thời điểm này.

### 9.3. Kết luận MVP

| Thành phần | Trạng thái |
|---|---|
| Vector retrieval | Đã chạy thật |
| RAG retrieval | Chưa đạt MVP |
| LLM answer evaluation | Chưa đủ dữ liệu đánh giá |
| Hệ thống evaluation script | Đã chạy được |
| Dataset evaluation từ DB AiTestCase | Chưa dùng được vì thiếu expected fields |

---

## 10. Ưu tiên cải thiện tiếp theo

### Ưu tiên 1: Tune retrieval/ranking

Cần tối ưu retrieval trước khi chỉnh prompt LLM. Các hướng nên làm:

1. Tăng internal candidate size:
   - `vectorTopN = 30`
   - `keywordTopN = 30`
   - `finalTopK = 5`

2. Tune hybrid weight:
   - `vectorWeight = 0.85`, `keywordWeight = 0.15`
   - `vectorWeight = 0.75`, `keywordWeight = 0.25`
   - `vectorWeight = 0.65`, `keywordWeight = 0.35`
   - `vectorWeight = 0.50`, `keywordWeight = 0.50`

3. Thêm query expansion cho thuật ngữ Vật lí:
   - `chu kì` ↔ `chu kỳ` ↔ `T`
   - `omega` ↔ `ω` ↔ `tần số góc`
   - `phi` ↔ `φ` ↔ `pha ban đầu`
   - `biên độ` ↔ `A`
   - `li độ` ↔ `x`
   - `độ lệch pha` ↔ `lệch pha`

4. Thêm concept/title boost nhẹ:
   - Boost nếu title chứa đúng khái niệm.
   - Boost nếu text/metadata chứa thuật ngữ chính.
   - Không hardcode theo smoke case ID.

### Ưu tiên 2: Review lại gold labels của smoke cases

Cần kiểm tra các case fail để xác định `expected_chunk_ids` có quá hẹp không. Nếu retrieved chunk khác expected nhưng vẫn đúng nội dung, nên bổ sung nó vào danh sách relevant chunks.

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

### Ưu tiên 4: Sau khi RAG đạt ngưỡng, mới tune prompt LLM

Không nên tối ưu prompt khi retrieval còn yếu. Nếu context lấy sai hoặc thiếu, LLM khó trả lời đúng một cách ổn định.

---

## 11. Kết luận ngắn gọn

Hệ thống AI/RAG hiện tại đã có nền tảng evaluation chạy được và vector retrieval đã hoạt động đúng. So với keyword-only baseline, chất lượng RAG tăng rõ rệt, đặc biệt ở Hit@5 và Recall@5. Tuy nhiên, các chỉ số hiện tại vẫn chưa đạt benchmark MVP, chủ yếu do ranking chưa đủ tốt và một số expected labels có thể chưa đầy đủ.

Bước tiếp theo nên tập trung vào **retrieval tuning**: tăng candidate pool, mở rộng truy vấn tiếng Việt/ký hiệu Vật lí, tune hybrid weights, thêm concept/title boost và review gold labels. Chỉ sau khi RAG đạt ngưỡng ổn định mới nên chuyển sang đánh giá và tối ưu câu trả lời LLM.
