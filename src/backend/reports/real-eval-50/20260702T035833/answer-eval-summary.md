# AI/RAG Answer Evaluation Summary

- Run time: 2026-07-02T03:58:32.829Z
- Source: file
- AI method: chat
- LLM enabled: true
- Model: gpt-4o-mini
- Avg latency: 3367.9200 ms
- Answer judge enabled: true

## Cases

- Total: 50
- Evaluated: 50
- Skipped: 0
- Failed: 0
- Numeric cases: 5
- Conceptual cases: 45
- Mixed cases: 5

## Metrics

| Metric | Value |
| --- | ---: |
| Numeric accuracy | 0.6000 |
| Avg concept coverage | 0.3333 |
| Avg rule-based score | 0.3300 |
| Avg correctness | 3.6400 |
| Avg groundedness | 3.8600 |
| Avg completeness | 3.3800 |
| Avg clarity | 4.1200 |
| Avg citation usage | 0.1000 |
| Avg final answer score | 3.5140 |
| Hallucination rate | 0.0200 |

## Error Analysis

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| missing_required_concepts | 33 | Improve answer generation or required concept coverage |
| low_groundedness | 9 | Require answer to cite and use retrieved context |
| numeric_wrong | 2 | Improve calculation prompt and numeric extraction checks |
| hallucination | 1 | Constrain answer to references and reject unsupported claims |

## Top 10 Weak Or Failed Cases

| Case ID | Question | Score | Reason |
| --- | --- | ---: | --- |
| REAL_EVAL_PHY11_SHM_PERIOD_001 | Một vật dao động điều hòa có ω = 4π rad/s. Tính chu kì T. | 0.1667 | Numeric answer mismatch |
| REAL_EVAL_PHY11_SHM_VELOCITY_001 | Từ x = A cos(ωt + φ), hãy viết phương trình vận tốc của vật dao động điều hòa. | 0.5000 | Low concept coverage |
| REAL_EVAL_PHY11_SHM_ACCELERATION_001 | Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào? | 0.3333 | Low concept coverage |
| REAL_EVAL_PHY11_CAPACITOR_001 | Một tụ điện có điện dung C = 2 μF được đặt vào hiệu điện thế U = 10 V. Tính điện tích của tụ. | 0.3333 | Numeric answer mismatch |
| REAL_EVAL_PHY11_STANDING_WAVE_001 | Điều kiện để có sóng dừng trên dây có hai đầu cố định là gì? | 0.6667 | Low concept coverage |
| REAL_EVAL50_PHYS_001 | Theo học liệu, Hiện tượng cộng hưởng trong đời sống là gì? | 0.0000 | Low concept coverage |
| REAL_EVAL50_PHYS_002 | Nêu công thức hoặc quan hệ chính được trình bày trong mục Độ phóng xạ. | 0.6667 | Low concept coverage |
| REAL_EVAL50_PHYS_003 | Trình bày ý chính của mục Vật lí là cơ sở của khoa học tự nhiên. | 0.0000 | Low concept coverage |
| REAL_EVAL50_PHYS_004 | Trong mục Định luật bảo toàn động lượng, bài hoặc công thức đang yêu cầu xác định đại lượng nào và dựa trên quan hệ nào? | 0.6667 | Low concept coverage |
| REAL_EVAL50_PHYS_005 | Mô tả hiện tượng hoặc thí nghiệm được nêu trong mục Hiện tượng cộng hưởng trong đời sống. | 0.0000 | Low concept coverage |

