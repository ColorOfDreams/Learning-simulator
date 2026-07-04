# AI/RAG Answer Evaluation Summary

- Run time: 2026-07-02T12:57:15.489Z
- Source: file
- AI method: chat
- LLM answer enabled: true
- LLM answer configured: true
- LLM judge enabled: true
- LLM judge configured: true
- LLM base URL: https://api.openai.com/v1
- LLM model: gpt-4o-mini
- Judge base URL: https://api.openai.com/v1
- Judge model: gpt-4o-mini
- Model: gpt-4o-mini
- Avg latency: 3565.0200 ms
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
| Avg concept coverage | 0.3267 |
| Avg rule-based score | 0.3267 |
| Avg correctness | 3.7800 |
| Avg groundedness | 4.0400 |
| Avg completeness | 3.4600 |
| Avg clarity | 4.1800 |
| Avg citation usage | 0.1000 |
| Avg final answer score | 3.6370 |
| Hallucination rate | 0.0000 |

## Error Analysis

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| missing_required_concepts | 36 | Improve answer generation or required concept coverage |
| low_groundedness | 7 | Require answer to cite and use retrieved context |
| numeric_wrong | 2 | Improve calculation prompt and numeric extraction checks |

## Top 10 Weak Or Failed Cases

| Case ID | Question | Score | Reason |
| --- | --- | ---: | --- |
| REAL_EVAL_PHY11_SHM_PERIOD_001 | Một vật dao động điều hòa có ω = 4π rad/s. Tính chu kì T. | 0.1667 | Numeric answer mismatch |
| REAL_EVAL_PHY11_SHM_VELOCITY_001 | Từ x = A cos(ωt + φ), hãy viết phương trình vận tốc của vật dao động điều hòa. | 0.5000 | Low concept coverage |
| REAL_EVAL_PHY11_SHM_ACCELERATION_001 | Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào? | 0.3333 | Low concept coverage |
| REAL_EVAL_PHY11_WAVE_SPEED_001 | Một sóng có tần số f = 5 Hz và tốc độ truyền sóng v = 2 m/s. Tính bước sóng. | 0.6667 | Low concept coverage |
| REAL_EVAL_PHY11_CAPACITOR_001 | Một tụ điện có điện dung C = 2 μF được đặt vào hiệu điện thế U = 10 V. Tính điện tích của tụ. | 0.3333 | Numeric answer mismatch |
| REAL_EVAL_PHY11_STANDING_WAVE_001 | Điều kiện để có sóng dừng trên dây có hai đầu cố định là gì? | 0.6667 | Low concept coverage |
| REAL_EVAL50_PHYS_001 | Theo học liệu, Hiện tượng cộng hưởng trong đời sống là gì? | 0.0000 | Low concept coverage |
| REAL_EVAL50_PHYS_002 | Nêu công thức hoặc quan hệ chính được trình bày trong mục Độ phóng xạ. | 0.3333 | Low concept coverage |
| REAL_EVAL50_PHYS_003 | Trình bày ý chính của mục Vật lí là cơ sở của khoa học tự nhiên. | 0.0000 | Low concept coverage |
| REAL_EVAL50_PHYS_004 | Trong mục Định luật bảo toàn động lượng, bài hoặc công thức đang yêu cầu xác định đại lượng nào và dựa trên quan hệ nào? | 0.6667 | Low concept coverage |

