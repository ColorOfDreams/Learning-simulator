# Real Smoke Eval Report

- Run time: 2026-07-01T13:42:34.358Z
- Eval file: `D:\LearnSimulator\C2-App-107\data\eval\rag-smoke-cases.json`
- Retrieval cases: 10, evaluated 10, skipped 0
- Answer cases: 10, evaluated 10, skipped 0

## Retrieval Metrics

| Metric | Value |
| --- | ---: |
| Hit@1 | 0.4000 |
| Hit@3 | 0.8000 |
| Hit@5 | 0.9000 |
| Recall@5 | 0.8500 |
| Precision@5 | 0.1800 |
| MRR | 0.6083 |

## Answer Metrics

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

LLM judge was not enabled, so correctness/groundedness/completeness/clarity/citation/hallucination are reported as N/A.

## Answer Comparison

| Case | Expected | AI answer | Numeric | Concept coverage | Missing concepts | Rule score |
| --- | --- | --- | --- | ---: | --- | ---: |
| REAL_EVAL_PHY11_OSCILLATION_CONCEPT_001 | Dao động cơ là chuyển động qua lại của vật quanh vị trí cân bằng và có thể lặp đi lặp lại theo thời gian. | Dao động cơ là chuyển động qua lại quanh vị trí cân bằng và lặp đi lặp lại theo thời gian. Vị trí cân bằng là vị trí mà vật thường xuyên đi qua trong quá trình dao động. Đặc trưng quan trọng là chuyển động có tính lặp lại quanh vị trí cân bằng. | N/A | 1.0000 | - | 1.0000 |
| REAL_EVAL_PHY11_SHM_EQUATION_001 | x là li độ tại thời điểm t, A là biên độ, ω là tần số góc, còn φ là pha ban đầu; ωt + φ là pha dao động. | Phương trình x = A cos(ωt + φ) mô tả li độ x của vật theo thời gian; x là li độ, A là biên độ, omega là tần số góc, phi là pha ban đầu và omega t + phi là pha dao động. Li độ x cho biết vị trí của vật so với vị trí cân bằng tại thời điểm t. Pha dao động ωt... | N/A | 1.0000 | - | 1.0000 |
| REAL_EVAL_PHY11_SHM_PERIOD_001 | value=0.5 s \| Dùng ω = 2π/T nên T = 2π/ω = 2π/(4π) = 0,5 s. | ![Hình 2.1 - Đồ thị dao động điều hòa](assets/images/hinh-2-1.png) **Mô tả sơ bộ** * Đồ thị hình sin. * Trục tung: (x(m)), từ (-0,2) đến (0,2). * Đỉnh tại: $$ x=0,2 $$ ứng với: $$ t=0,1s;\qquad t=0,5s $$ * Cực tiểu tại: $$ x=-0,2 $$ ứng với: $$ t=0,3s $$ *... | pass | 0.3333 | ω = 2π/T, T = 2π/ω | 0.6667 |
| REAL_EVAL_PHY11_SHM_POSITION_001 | value=0 cm \| Thay t = 2 s vào x = 2cos(4πt + π/2), pha bằng 17π/2 nên cos(17π/2) = 0. Vậy x = 0 cm. | Một vật dao động điều hòa có phương trình là: $$ x=2\cos\left(4\pi t-\frac{\pi}{6}\right) \quad(cm) $$ Hãy cho biết: * Biên độ * Tần số góc * Chu kì * Tần số * Pha ban đầu * Pha của dao động ở thời điểm: $$ t=1s $$ --- Nguồn tham chiếu gần nhất: Bài 1. Dạng... | fail | 0.3333 | thay t = 2, x = 0 cm | 0.1667 |
| REAL_EVAL_PHY11_SHM_VELOCITY_001 | Vận tốc là đạo hàm của li độ theo thời gian: v = x' = -ωA sin(ωt + φ). | Từ x = A cos(ωt + φ), vận tốc là đạo hàm của li độ theo thời gian: v = x' và v = -ωA sin(ωt + φ). Lấy đạo hàm x theo thời gian. Vì đạo hàm của cos(ωt + φ) là -ω sin(ωt + φ), nên v = x' = -ωA sin(ωt + φ). | N/A | 1.0000 | - | 1.0000 |
| REAL_EVAL_PHY11_SHM_ACCELERATION_001 | Gia tốc của dao động điều hòa thỏa mãn a = -ω²x, tức gia tốc luôn trái dấu với li độ và hướng về vị trí cân bằng. | > Phương trình của vận tốc và gia tốc của một vật dao động điều hòa có li độ: $$ x=A\cos(\omega t+\varphi) $$ là: $$ v=-\omega A\sin(\omega t+\varphi) $$ $$ a=-\omega^2A\cos(\omega t+\varphi) $$ > Đồ thị của vận tốc, gia tốc theo thời gian là đường hình sin... | N/A | 0.3333 | a = -ω²x, trái dấu với li độ | 0.3333 |
| REAL_EVAL_PHY11_WAVE_SPEED_001 | value=0.4 m \| Dùng v = λf nên λ = v/f = 2/5 = 0,4 m. | Một sóng âm có tần số: $$ f=192Hz $$ và truyền đi được quãng đường: $$ s=91,4m $$ trong: $$ t=0,27s $$ Hãy tính: a. Tốc độ truyền sóng. b. Bước sóng. c. Nếu tần số sóng là: $$ f'=442Hz $$ thì bước sóng và chu kì là bao nhiêu? --- Nguồn tham chiếu gần nhất:... | fail | 0.3333 | v = λf, 0,4 m | 0.1667 |
| REAL_EVAL_PHY11_OHM_001 | value=0.5 A \| Từ R = U/I suy ra I = U/R = 5/10 = 0,5 A. | Một vật dao động điều hòa với tần số góc: $$ \omega=1rad/s $$ có đồ thị của li độ (x), vận tốc (v) và gia tốc (a) theo thời gian (t) được mô tả trên Hình 4.1. --- Nguồn tham chiếu gần nhất: Ví dụ 3. Câu trả lời được rút từ theory chunk liên quan nhất. | fail | 0.0000 | R = U/I, I = U/R, 0,5 A | 0.0000 |
| REAL_EVAL_PHY11_CAPACITOR_001 | value=0.00002 C \| Đổi C = 2 μF = 2×10^-6 F. Dùng Q = CU nên Q = 2×10^-6 × 10 = 2×10^-5 C = 0,00002 C. | Thực nghiệm cho thấy: > Với một tụ điện xác định, điện tích tích được tỉ lệ thuận với hiệu điện thế đặt vào hai bản tụ. Biểu thức: $$ Q = CU $$ Trong đó: * $Q$ là điện tích của tụ điện. * $U$ là hiệu điện thế giữa hai bản tụ. * $C$ là điện dung của tụ điện.... | fail | 0.3333 | đổi μF sang F, 0,00002 C | 0.1667 |
| REAL_EVAL_PHY11_STANDING_WAVE_001 | Với dây có hai đầu cố định, chiều dài dây phải bằng một số nguyên lần nửa bước sóng: L = nλ/2. | Điều kiện để có sóng dừng trên một sợi dây có hai đầu cố định là chiều dài của sợi dây phải bằng một số nguyên lần nửa bước sóng như Hình 13.3. $$ L=n\frac{\lambda}{2} $$ với: $$ n=1,2,3,... $$ [ \tag{13.1} ] --- Nguồn tham chiếu gần nhất: 2.2. Điều kiện để... | N/A | 0.6667 | L = nλ/2 | 0.6667 |

## Weak Cases

| Case | Retrieval issue | Answer issue |
| --- | --- | --- |
| REAL_EVAL_PHY11_SHM_EQUATION_001 | No expected chunk in top 5 | - |
| REAL_EVAL_PHY11_SHM_PERIOD_001 | - | Rule score 0.6667 |
| REAL_EVAL_PHY11_SHM_POSITION_001 | - | Rule score 0.1667 |
| REAL_EVAL_PHY11_SHM_ACCELERATION_001 | - | Rule score 0.3333 |
| REAL_EVAL_PHY11_WAVE_SPEED_001 | - | Rule score 0.1667 |
| REAL_EVAL_PHY11_OHM_001 | - | Rule score 0.0000 |
| REAL_EVAL_PHY11_CAPACITOR_001 | - | Rule score 0.1667 |
| REAL_EVAL_PHY11_STANDING_WAVE_001 | - | Rule score 0.6667 |

