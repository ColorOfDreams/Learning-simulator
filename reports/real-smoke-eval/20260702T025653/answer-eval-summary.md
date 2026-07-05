# AI/RAG Answer Evaluation Summary

- Run time: 2026-07-02T02:56:53.320Z
- Source: smoke
- AI method: analyze
- LLM enabled: false
- Model: N/A
- Avg latency: N/A ms
- Answer judge enabled: true

## Cases

- Total: 10
- Evaluated: 10
- Skipped: 0
- Failed: 0
- Numeric cases: 5
- Conceptual cases: 5
- Mixed cases: 5

## Metrics

| Metric | Value |
| --- | ---: |
| Numeric accuracy | 0.2000 |
| Avg concept coverage | 0.5333 |
| Avg rule-based score | 0.5167 |
| Avg correctness | 3.3000 |
| Avg groundedness | 3.7000 |
| Avg completeness | 3.3000 |
| Avg clarity | 3.5000 |
| Avg citation usage | 1.6000 |
| Avg final answer score | 3.3350 |
| Hallucination rate | 0.3000 |

## Error Analysis

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| missing_required_concepts | 3 | Improve answer generation or required concept coverage |
| hallucination | 3 | Constrain answer to references and reject unsupported claims |
| numeric_wrong | 1 | Improve calculation prompt and numeric extraction checks |

## Top 10 Weak Or Failed Cases

| Case ID | Question | Score | Reason |
| --- | --- | ---: | --- |
| REAL_EVAL_PHY11_SHM_PERIOD_001 | Một vật dao động điều hòa có ω = 4π rad/s. Tính chu kì T. | 0.6667 | Low concept coverage |
| REAL_EVAL_PHY11_SHM_POSITION_001 | Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Tính li độ tại t = 2 s. | 0.1667 | Numeric answer mismatch |
| REAL_EVAL_PHY11_SHM_ACCELERATION_001 | Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào? | 0.3333 | Low concept coverage |
| REAL_EVAL_PHY11_WAVE_SPEED_001 | Một sóng có tần số f = 5 Hz và tốc độ truyền sóng v = 2 m/s. Tính bước sóng. | 0.1667 | Numeric answer mismatch |
| REAL_EVAL_PHY11_OHM_001 | Một điện trở R = 10 Ω được đặt vào hiệu điện thế U = 5 V. Tính cường độ dòng điện. | 0.0000 | Numeric answer mismatch |
| REAL_EVAL_PHY11_CAPACITOR_001 | Một tụ điện có điện dung C = 2 μF được đặt vào hiệu điện thế U = 10 V. Tính điện tích của tụ. | 0.1667 | Numeric answer mismatch |
| REAL_EVAL_PHY11_STANDING_WAVE_001 | Điều kiện để có sóng dừng trên dây có hai đầu cố định là gì? | 0.6667 | Low concept coverage |

