# AI/RAG Answer Evaluation Summary

- Run time: 2026-07-02T02:51:34.196Z
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
| Avg correctness | N/A |
| Avg groundedness | N/A |
| Avg completeness | N/A |
| Avg clarity | N/A |
| Avg citation usage | N/A |
| Avg final answer score | N/A |
| Hallucination rate | N/A |

## Error Analysis

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| judge_failed | 10 | Check judge model env and JSON-only parsing |

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

