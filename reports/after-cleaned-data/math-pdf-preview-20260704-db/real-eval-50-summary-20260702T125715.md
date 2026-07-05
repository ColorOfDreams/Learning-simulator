# Real Eval 50 Summary

- Run time: 2026-07-02T12:57:15.954Z
- Eval file: `D:\LearnSimulator\data\eval\real-eval-50.preview.json`
- Total preview cases: 50
- Cases by subject: physics=25, chemistry=15, math=10
- Cases by type: concept=9, formula=12, calculation=9, comparison=6, definition=7, phenomenon/experiment=3, cross-topic-noise=4

## Retrieval Metrics

| Metric | Value |
| --- | ---: |
| Evaluated | 50 / 50 |
| Skipped | 0 |
| Hit@1 | 0.4000 |
| Hit@3 | 0.7000 |
| Hit@5 | 0.9400 |
| Recall@5 | 0.9300 |
| Precision@5 | 0.1880 |
| MRR | 0.5898 |

## Answer Metrics

| Metric | Value |
| --- | ---: |
| Evaluated | 50 / 50 |
| Skipped | 0 |
| Numeric accuracy | 0.6000 |
| Avg concept coverage | 0.3267 |
| Avg rule-based score | 0.3267 |
| Avg final answer score | 3.6370 |
| Hallucination rate | 0.0000 |
| Model | gpt-4o-mini |

## Weak Retrieval Cases

| Case ID | Hit@5 | Recall@5 | MRR contribution |
| --- | ---: | ---: | ---: |
| REAL_EVAL_PHY11_SHM_EQUATION_001 | 0.0000 | 0.0000 | 0.1667 |
| REAL_EVAL50_CHEM_013 | 0.0000 | 0.0000 | 0.1250 |
| REAL_EVAL50_MATH_007 | 0.0000 | 0.0000 | 0.0000 |

## Weak Answer Cases

| Case ID | Rule score | Judge score | Numeric | Concept coverage | Reason |
| --- | ---: | ---: | --- | ---: | --- |
| REAL_EVAL_PHY11_SHM_PERIOD_001 | 0.1667 | 4.7500 | fail | 0.3333 | Câu trả lời đúng, dựa vào công thức T = 2π/ω và tính toán chính xác với ω = 4π rad/s, cho ra kết quả T = 0,5 s. |
| REAL_EVAL_PHY11_SHM_VELOCITY_001 | 0.5000 | 4.7500 | N/A | 0.5000 | Câu trả lời đúng, dựa trên thông tin trong CONTEXT và đầy đủ các bước cần thiết để giải thích phương trình vận tốc của vật dao động điều hòa. |
| REAL_EVAL_PHY11_SHM_ACCELERATION_001 | 0.3333 | 4.9000 | N/A | 0.3333 | Câu trả lời đúng, dựa trên thông tin trong CONTEXT và giải thích rõ ràng về công thức gia tốc trong dao động điều hòa. |
| REAL_EVAL_PHY11_WAVE_SPEED_001 | 0.6667 | 4.7500 | pass | 0.3333 | Câu trả lời đúng, dựa vào công thức và thông tin trong CONTEXT để tính bước sóng. |
| REAL_EVAL_PHY11_CAPACITOR_001 | 0.3333 | 3.4500 | fail | 0.6667 | Câu trả lời sử dụng đúng công thức Q = CU và có tính toán hợp lý, nhưng kết quả cuối cùng là 20 μC (20 * 10^-6 C) là sai, vì đúng ra phải là 0,00002 C (2 * 10^-5 C). |
| REAL_EVAL_PHY11_STANDING_WAVE_001 | 0.6667 | 4.6500 | N/A | 0.6667 | Câu trả lời đúng và dựa hoàn toàn vào thông tin trong CONTEXT. Công thức và điều kiện được nêu rõ ràng. |
| REAL_EVAL50_PHYS_001 | 0.0000 | 3.6000 | N/A | 0.0000 | Câu trả lời đúng về hiện tượng cộng hưởng và có liên hệ với các ví dụ thực tế, nhưng chưa đề cập đến các ứng dụng cụ thể trong đời sống như hộp đàn hay lò vi sóng, do đó chưa hoàn toàn đầy đủ. |
| REAL_EVAL50_PHYS_002 | 0.3333 | 2.7500 | N/A | 0.3333 | Câu trả lời đưa ra công thức H = λN, tuy nhiên không có trong CONTEXT. Độ phóng xạ được định nghĩa là số hạt nhân phân rã trong một giây và đơn vị là becquerel. Câu trả lời thiếu thông tin về đơn vị và định nghĩa độ phóng xạ. |
| REAL_EVAL50_PHYS_003 | 0.0000 | 4.7500 | N/A | 0.0000 | Câu trả lời đúng và dựa hoàn toàn vào thông tin trong CONTEXT, trình bày rõ ràng ý chính về vai trò của Vật lí trong khoa học tự nhiên và các lĩnh vực liên môn. |
| REAL_EVAL50_PHYS_004 | 0.6667 | 3.8000 | N/A | 0.6667 | Câu trả lời đúng về định luật bảo toàn động lượng và cách xác định động lượng toàn phần của hệ. Tuy nhiên, không trích dẫn cụ thể từ CONTEXT. |
| REAL_EVAL50_PHYS_005 | 0.0000 | 3.8000 | N/A | 0.0000 | Câu trả lời mô tả đúng hiện tượng cộng hưởng và đưa ra ví dụ về nhạc cụ và cầu sập, phù hợp với thông tin trong CONTEXT. Tuy nhiên, không trích dẫn cụ thể từ nguồn nào. |
| REAL_EVAL50_PHYS_006 | 0.3333 | 3.8000 | N/A | 0.3333 | Câu trả lời đã nêu đúng các khái niệm chính liên quan đến tác dụng của N phân tử khí lên thành bình, bao gồm áp suất, mật độ phân tử, và trung bình bình phương tốc độ. Tuy nhiên, khái niệm về động năng trung bình không được đề cập trong CONTEXT và không phải là khái niệm chính trong tác dụng của N phân tử khí lên thành bình. |
