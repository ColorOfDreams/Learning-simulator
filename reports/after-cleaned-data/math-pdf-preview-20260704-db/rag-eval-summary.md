# AI/RAG Retrieval Evaluation Summary

- Run time: 2026-07-04T02:32:36.174Z

## Cases

- Total: 125
- Evaluated: 0
- Skipped: 125
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
- Theory chunks total: 4225
- Theory chunks with embedding: 4225
- Theory chunks missing embedding: 0
- Embedding dimensions in DB: 1536
- Embedding index count: 0
- Cases with hybrid results: 0
- Cases with vector results: 0
- Cases fallback keyword only: 0

## Before vs After RAG Comparison

| Metric | Before: keyword-only baseline | After: hybrid/vector RAG | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.0000 | 0.0000 | +0.0000 |
| Hit@3 | 0.0000 | 0.0000 | +0.0000 |
| Hit@5 | 0.0000 | 0.0000 | +0.0000 |
| Recall@5 | 0.0000 | 0.0000 | +0.0000 |
| Precision@5 | 0.0000 | 0.0000 | +0.0000 |
| MRR | 0.0000 | 0.0000 | +0.0000 |

## Metrics

| Metric | Value |
| --- | ---: |
| Hit@1 | 0.0000 |
| Hit@3 | 0.0000 |
| Hit@5 | 0.0000 |
| Recall@5 | 0.0000 |
| Precision@5 | 0.0000 |
| MRR | 0.0000 |

## Benchmark Comparison

| Metric | Score | Benchmark | Status |
| --- | ---: | --- | --- |
| Hit@1 | 0.0000 | Tracking only; no fixed threshold yet | TRACK |
| Hit@3 | 0.0000 | Tracking only; no fixed threshold yet | TRACK |
| Hit@5 | 0.0000 | >= 0.85 good; 0.75-0.85 acceptable; < 0.75 needs improvement | FAIL |
| Recall@5 | 0.0000 | >= 0.65 required to reduce missing-context risk | FAIL |
| Precision@5 | 0.0000 | Tracking only; affected by number of gold chunks | TRACK |
| MRR | 0.0000 | >= 0.50 required for acceptable ranking quality | FAIL |

## Automatic Notes

- Hit@5: needs improvement.
- MRR < 0.5: ranking quality is not good enough.
- Recall@5 < 0.65: retrieved context may be incomplete.

## Error Analysis

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| no_expected_chunks | 125 | Add gold relevant_chunk_ids to the eval case |

## Top 10 Weak Or Failed Cases

| Case ID | Question | Expected IDs | Retrieved IDs | Reason |
| --- | --- | --- | --- | --- |
| AI_TEST_PHY11_001 | > Trong cuộc sống hằng ngày và trong kĩ thuật, ta thường gặp những vật dao động, ví dụ như dây đàn ghi-ta rung động, chiếc đu đung đưa, p... | - | - | No expected relevant chunk ids |
| AI_TEST_PHY11_002 | Một vật dao động điều hòa có phương trình: $$ x=2\cos\left(4\pi t+\frac{\pi}{2}\right)\text{ cm} $$ Hãy xác định: 1. Biên độ và pha ban đ... | - | - | No expected relevant chunk ids |
| AI_TEST_PHY11_003 | Đồ thị li độ – thời gian của một con lắc đơn dao động điều hòa được mô tả trong Hình 1.3. 1. Hãy mô tả dao động điều hòa của con lắc đơn.... | - | - | No expected relevant chunk ids |
| AI_TEST_PHY11_004 | > Để vẽ đồ thị hoặc viết phương trình của một dao động điều hòa cần biết những đại lượng vật lí nào? --- | - | - | No expected relevant chunk ids |
| AI_TEST_PHY11_005 | > Hình 2.1 là đồ thị dao động điều hòa của một vật. Hãy xác định: > > * Biên độ, chu kì, tần số của dao động. > * Nêu thời điểm mà vật có... | - | - | No expected relevant chunk ids |
| AI_TEST_PHY11_006 | > Từ Hình 2.1 hãy xác định tần số góc của dao động của vật. --- | - | - | No expected relevant chunk ids |
| AI_TEST_PHY11_007 | > Hình 2.3 là đồ thị dao động điều hòa của một con lắc. > > Tại: > > $$ > t=0 > $$ > > con lắc có: > > $$ > x=-A > $$ > > đạt cực đại: >... | - | - | No expected relevant chunk ids |
| AI_TEST_PHY11_008 | > Hãy chứng minh rằng độ lệch pha giữa hai dao động cùng chu kì bằng độ lệch pha ban đầu. --- | - | - | No expected relevant chunk ids |
| AI_TEST_PHY11_009 | > Hai con lắc 1 và 2 dao động điều hòa tại cùng thời điểm quan sát, vị trí của chúng được biểu diễn trên Hình 2.5a và Hình 2.5b. > > Hỏi... | - | - | No expected relevant chunk ids |
| AI_TEST_PHY11_010 | Đồ thị li độ – thời gian của một vật dao động điều hòa được mô tả trên Hình 2.6. --- | - | - | No expected relevant chunk ids |

