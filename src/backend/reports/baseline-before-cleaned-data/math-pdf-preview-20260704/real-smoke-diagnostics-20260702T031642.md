# Real Smoke Diagnostics

- Run time: 2026-07-02T03:16:42.642Z
- JSON: `D:\LearnSimulator\C2-App-107\src\backend\reports\real-smoke-diagnostics-20260702T031642.json`
- RAG report time: 2026-07-02T03:14:37.517Z
- Answer report time: 2026-07-02T03:16:29.371Z

## Summary

| Metric | Count |
| --- | ---: |
| Total cases | 10 |
| Retrieval misses | 0 |
| Gold low rank | 1 |
| Context ok but answer failed | 7 |
| Numeric errors | 4 |
| Hallucinations | 2 |
| Insufficient gold labels | 0 |
| Answer-dominant failures | 7 |
| Retrieval-dominant failures | 1 |

## Conclusion

Primary failure mode is answer generation: 7 answer-dominant cases vs 1 retrieval-dominant cases.

## Cases

### REAL_EVAL_PHY11_OSCILLATION_CONCEPT_001

- Question: Dao động cơ là gì? Nêu đặc điểm chuyển động quanh vị trí cân bằng.
- Expected chunks: TH_PHY11_C01_L01_003
- Retrieved top chunks: TH_PHY11_C01_L01_003, TH_PHY11_C01_L01_001, TH_PHY11_C01_L01_015, TH_PHY11_C01_L01_004, TH_PHY11_C01_L01_002, TH_PHY11_C01_L01_018, TH_PHY11_C01_L01_005, TH_PHY11_C01_L01_008, TH_PHY11_C01_L01_012, TH_PHY11_C01_L01_013
- Gold rank: 1
- Error types: none
- Rule score: 1.0000
- Numeric correct: N/A
- Concept coverage: 1.0000
- LLM judge score: 4.5500
- Hallucination: false
- Recommendation: No major issue detected.

Expected answer/concepts:

```json
{
  "type": "conceptual",
  "reference_answer": "Dao động cơ là chuyển động qua lại của vật quanh vị trí cân bằng và có thể lặp đi lặp lại theo thời gian.",
  "required_concepts": [
    {
      "label": "dao động cơ",
      "anyOf": [
        "dao động cơ"
      ]
    },
    {
      "label": "chuyển động qua lại",
      "anyOf": [
        "chuyển động qua lại",
        "qua lại"
      ]
    },
    {
      "label": "vị trí cân bằng",
      "anyOf": [
        "vị trí cân bằng",
        "quanh vị trí cân bằng"
      ]
    }
  ]
}
```

Generated answer:

```text
Dao động cơ là chuyển động qua lại quanh vị trí cân bằng và lặp đi lặp lại theo thời gian. Vị trí cân bằng là vị trí mà vật thường xuyên đi qua trong quá trình dao động. Đặc trưng quan trọng là chuyển động có tính lặp lại quanh vị trí cân bằng.
```

Retrieved chunks:

1. TH_PHY11_C01_L01_003 - 1.2. Dao động cơ
   topic=oscillation score=0.6679 type=hybrid
   Vật chuyển động qua lại quanh vị trí cân bằng. Chuyển động như vậy được gọi là **dao động cơ**. Dao động cơ của một vật có thể là dao động tuần hoàn hoặc dao động không tuần hoàn. Nếu sau những khoảng thời gian bằng nhau, vật trở lại vị trí cũ theo hướng cũ thì dao động của vật được gọi là **dao động tuần hoàn**. **Ví dụ** * Dao động của con lắc đồng hồ là dao động tuần hoàn. * Dao động của cành cây đu đưa khi có gió thổi là dao động không tuần hoàn. Dao động tuần hoàn có thể có mức độ phức t...
2. TH_PHY11_C01_L01_001 - Bài 1: Dao động điều hòa
   topic=oscillation score=0.5732 type=hybrid
   > Trong cuộc sống hằng ngày và trong kĩ thuật, ta thường gặp những vật dao động, ví dụ như dây đàn ghi-ta rung động, chiếc đu đung đưa, pít-tông chuyển động lên xuống trong xi lanh của động cơ,... > > Chuyển động của những vật này được gọi là dao động cơ. Vậy dao động cơ có những đặc điểm gì chung? ---
3. TH_PHY11_C01_L01_015 - 4.4. Thí nghiệm minh họa mối liên hệ với chuyển động tròn đều
   topic=oscillation score=0.5677 type=hybrid
   Ban đầu, cho con lắc lò xo dao động theo phương thẳng đứng. Sau đó, điều chỉnh mô-tơ sao cho: * Khi mô-tơ bắt đầu quay, bóng của vật hình trụ trùng với bóng của quả cầu con lắc trên màn. * Khi mô-tơ quay được một vòng, quả cầu cũng thực hiện được một dao động toàn phần. Quan sát thí nghiệm cho thấy: * Vật hình trụ gắn ở đầu một thanh quay tròn đều. * Dưới ánh sáng của đèn chiếu, bóng của vật hình trụ chuyển động qua lại trên màn. * Bóng của vật hình trụ và bóng của quả cầu con lắc luôn trùng...
4. TH_PHY11_C01_L01_004 - 2.1. Đồ thị của dao động điều hòa
   topic=oscillation score=0.5098 type=hybrid
   Ta quan sát dao động của một con lắc lò xo dọc theo trục $Ox$ thẳng đứng tại các thời điểm khác nhau như trong Hình 1.2. Quy ước: * $t=0$ là thời điểm bắt đầu quan sát. * $x=0$ là vị trí cân bằng của quả cầu. Đường cong trong Hình 1.2 là đồ thị dao động của con lắc. Đồ thị cho biết vị trí của quả cầu trên trục $Ox$ tại những thời điểm khác nhau. Đường cong này có dạng hình sin.
5. TH_PHY11_C01_L01_002 - 1.1. Thí nghiệm
   topic=oscillation score=0.4978 type=hybrid
   **Chuẩn bị** Sử dụng con lắc lò xo hoặc con lắc đơn như trong Hình 1.1. **Tiến hành** Treo một vật nhỏ, nặng vào đầu tự do của một lò xo nhẹ như Hình 1.1a, hoặc vào một dây nhẹ, không dãn như Hình 1.1b. Ta thu được một con lắc lò xo hoặc một con lắc đơn. * Xác định vị trí cân bằng của vật. * Kéo vật lệch khỏi vị trí cân bằng rồi thả ra cho vật chuyển động. * Quan sát chuyển động của mỗi vật và nhận xét về đặc điểm chung của chúng. ![Hình 1.1 - Con lắc lò xo và con lắc đơn](assets/images/hinh-...
6. TH_PHY11_C01_L01_018 - 6. Em có thể
   topic=oscillation score=0.4635 type=hybrid
   > Xác định được biên độ dao động của pít-tông chuyển động trong xi lanh của động cơ đốt trong. > Mô tả được dao động điều hòa của con lắc đồng hồ. > Nhận biết được mối liên hệ giữa dao động điều hòa và hình chiếu của chuyển động tròn đều.
7. TH_PHY11_C01_L01_005 - Hình 1.2
   topic=oscillation score=0.4584 type=hybrid
   ![Hình 1.2 - Đồ thị dao động điều hòa](assets/images/hinh-1-2.png) **Nội dung hình** Hình biểu diễn: * Một con lắc lò xo dao động dọc theo trục $Ox$. * Đồ thị li độ theo thời gian có dạng hình sin. > **Cần bổ sung:** ảnh gốc hoặc dữ liệu chính xác của các trục tọa độ nếu sử dụng hình để tạo bài tập. ---
8. TH_PHY11_C01_L01_008 - Bài tập 2: Đọc đồ thị li độ – thời gian
   topic=oscillation score=0.4452 type=hybrid
   Đồ thị li độ – thời gian của một con lắc đơn dao động điều hòa được mô tả trong Hình 1.3. 1. Hãy mô tả dao động điều hòa của con lắc đơn. 2. Xác định biên độ và li độ của con lắc tại các thời điểm: $$ t=0,\qquad t=0{,}5\text{ s},\qquad t=2{,}0\text{ s} $$
9. TH_PHY11_C01_L01_012 - 4.2. Dao động của pít-tông
   topic=oscillation score=0.4404 type=hybrid
   Pít-tông của một động cơ đốt trong dao động trên một đoạn thẳng dài: $$ 16\text{ cm} $$ và làm cho trục khuỷu của động cơ quay đều như trong Hình 1.5. Hãy xác định biên độ dao động của một điểm trên mặt pít-tông.
10. TH_PHY11_C01_L01_013 - Hình 1.5
   topic=oscillation score=0.4384 type=hybrid
   ![Hình 1.5 - Dao động của pít-tông](assets/images/hinh-1-5.png) **Nội dung hình** Hình minh họa pít-tông chuyển động qua lại trong xi lanh của động cơ. ---

### REAL_EVAL_PHY11_SHM_EQUATION_001

- Question: Trong phương trình dao động điều hòa x = A cos(ωt + φ), x, A, ω và φ có ý nghĩa gì?
- Expected chunks: TH_PHY11_C01_L01_006
- Retrieved top chunks: th_shm_002, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_008, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_005, TH_PHY11_C01_L01_006, TH_PHY11_C01_L04_007, TH_PHY11_C01_L02_025, TH_PHY11_C01_L04_002, TH_PHY11_C01_L04_014
- Gold rank: 6
- Error types: gold_low_rank
- Rule score: 1.0000
- Numeric correct: N/A
- Concept coverage: 1.0000
- LLM judge score: 4.7500
- Hallucination: false
- Recommendation: Relevant chunk appears at rank 6; consider small rerank/topK tuning before changing runtime broadly.

Expected answer/concepts:

```json
{
  "type": "conceptual",
  "reference_answer": "x là li độ tại thời điểm t, A là biên độ, ω là tần số góc, còn φ là pha ban đầu; ωt + φ là pha dao động.",
  "required_concepts": [
    {
      "label": "x là li độ",
      "anyOf": [
        "x là li độ",
        "li độ"
      ]
    },
    {
      "label": "A là biên độ",
      "anyOf": [
        "A là biên độ",
        "biên độ"
      ]
    },
    {
      "label": "ω là tần số góc",
      "anyOf": [
        "ω là tần số góc",
        "omega là tần số góc",
        "tần số góc"
      ]
    },
    {
      "label": "φ là pha ban đầu",
      "anyOf": [
        "φ là pha ban đầu",
        "phi là pha ban đầu",
        "pha ban đầu"
      ]
    }
  ]
}
```

Generated answer:

```text
Phương trình x = A cos(ωt + φ) mô tả li độ x của vật theo thời gian; x là li độ, A là biên độ, omega là tần số góc, phi là pha ban đầu và omega t + phi là pha dao động. Li độ x cho biết vị trí của vật so với vị trí cân bằng tại thời điểm t. Pha dao động ωt + φ xác định trạng thái dao động của vật ở thời điểm đó.
```

Retrieved chunks:

1. th_shm_002 - Phương trình dao động điều hòa
   topic=simple_harmonic_motion score=0.7464 type=hybrid
   Phương trình dao động điều hòa thường có dạng x = A cos(ωt + φ), trong đó A là biên độ, ω là tần số góc và φ là pha ban đầu.
2. TH_PHY11_C01_L01_017 - 5. Em đã học
   topic=simple_harmonic_motion score=0.6709 type=hybrid
   > Dao động cơ là chuyển động qua lại của vật quanh vị trí cân bằng. > Dao động tuần hoàn là dao động trong đó, sau những khoảng thời gian bằng nhau, vật trở lại vị trí cũ theo hướng cũ. > Dao động điều hòa là dao động trong đó li độ của vật là một hàm cosin hoặc hàm sin của thời gian. > Phương trình của dao động điều hòa là: $$ x=A\cos(\omega t+\varphi) $$ Trong đó: * $x$ là li độ. * $A$ là biên độ. * $\omega$ là tần số góc. * $\omega t+\varphi$ là pha tại thời điểm $t$. * $\varphi$ là pha ba...
3. TH_PHY11_C01_L02_008 - 2.1. Pha ban đầu
   topic=simple_harmonic_motion score=0.6612 type=hybrid
   Hình 2.2 là đồ thị của hai vật dao động điều hòa cùng chu kì, cùng biên độ nhưng dao động 1 luôn đạt tới giá trị cực đại sớm hơn dao động 2 một thời gian là: $$ \frac{T}{4} $$ Từ đồ thị ta thấy: * Tại thời điểm ban đầu ((t=0)), vật dao động điều hòa 1 đang ở vị trí biên: $$ x=A $$ và sẽ dịch chuyển về vị trí cân bằng. * Vật dao động điều hòa 2 đang ở vị trí cân bằng và sẽ dịch chuyển về phía: $$ x>0 $$ Các phương trình dao động tương ứng với đồ thị Hình 2.2 có pha ban đầu lần lượt là: $$ x_1=...
4. TH_PHY11_C01_L04_003 - Giải
   topic=simple_harmonic_motion score=0.6477 type=hybrid
   So sánh phương trình dao động của vật với phương trình dạng cơ bản: $$ x=A\cos(\omega t+\varphi) $$ Ta có: * Biên độ: $$ A=5cm $$ * Tần số: $$ f=\frac{\omega}{2\pi} =\frac{10\pi}{2\pi} =5Hz $$ * Pha ban đầu: $$ \varphi=\frac{\pi}{6} \quad(rad) $$ * Li độ lúc (t_1): $$ x_1 =5\cos\left(10\pi \cdot 0,05+\frac{\pi}{6}\right) =5\cos\left(\frac{4\pi}{6}\right) =-2,5cm $$ ---
5. TH_PHY11_C01_L02_005 - Hình 2.1
   topic=simple_harmonic_motion score=0.6439 type=hybrid
   ![Hình 2.1 - Đồ thị dao động điều hòa](assets/images/hinh-2-1.png) **Mô tả sơ bộ** * Đồ thị hình sin. * Trục tung: (x(m)), từ (-0,2) đến (0,2). * Đỉnh tại: $$ x=0,2 $$ ứng với: $$ t=0,1s;\qquad t=0,5s $$ * Cực tiểu tại: $$ x=-0,2 $$ ứng với: $$ t=0,3s $$ * Giao với trục thời gian tại: $$ t=0,2s;\qquad t=0,4s $$ --- Theo đồ thị Hình 2.1, cứ sau mỗi chu kì thì dao động của vật lại lặp lại như cũ. Như vậy, theo phương trình dao động ta phải có: $$ x=A\cos[\omega(t+T)] =A\cos(\omega t) $$ Theo tí...
6. TH_PHY11_C01_L01_006 - 2.2. Phương trình của dao động điều hòa
   topic=simple_harmonic_motion score=0.6224 type=hybrid
   Đồ thị hình sin có thể được biểu diễn bằng hàm sin hoặc hàm cosin. Ta chọn hàm cosin: $$ x=A\cos(\omega t+\varphi) \tag{1.1} $$ Đây được gọi là **phương trình của dao động điều hòa**. Trong phương trình: * $x$ là li độ của vật tại thời điểm $t$. * $A$ là biên độ dao động. * $\omega$ là tần số góc. * $\omega t+\varphi$ là pha của dao động tại thời điểm $t$. * $\varphi$ là pha ban đầu. Dao động được mô tả bằng phương trình: $$ x=A\cos(\omega t+\varphi) $$ được gọi là dao động điều hòa. Vật đang...
7. TH_PHY11_C01_L04_007 - Giải
   topic=simple_harmonic_motion score=0.6120 type=hybrid
   a. Tần số góc của dao động: $$ \omega=2\pi f=4\pi \quad(rad/s) $$ Khi: $$ t=0 $$ ta có: $$ x_0=A\cos\varphi=5cm $$ $$ v_0=-\omega A\sin\varphi=-30cm/s $$ Biên độ và pha ban đầu của dao động: $$ A=\sqrt{x^2+\frac{v^2}{\omega^2}} =\sqrt{5^2+\frac{(-30)^2}{(4\pi)^2}} \approx 5,54cm $$ $$ \tan\varphi ===========
8. TH_PHY11_C01_L02_025 - Hoạt động 1
   topic=simple_harmonic_motion score=0.5982 type=hybrid
   Xét một vật dao động điều hòa có: * Biên độ: $$ A=10cm $$ * Tần số: $$ f=5Hz $$ Tại thời điểm ban đầu ((t=0)), vật có li độ cực đại theo chiều dương. Yêu cầu: * Xác định chu kì, tần số góc, pha ban đầu của dao động. * Viết phương trình và vẽ đồ thị ((x-t)) của dao động. ---
9. TH_PHY11_C01_L04_002 - Ví dụ 1
   topic=simple_harmonic_motion score=0.5980 type=hybrid
   Cho phương trình của một vật dao động điều hòa: $$ x=5\cos\left(10\pi t+\frac{\pi}{6}\right) \quad(cm) $$ Xác định biên độ (A), tần số (f), pha ban đầu (\varphi), và li độ (x), tại thời điểm: $$ t_1=0,05s $$ ---
10. TH_PHY11_C01_L04_014 - Bài 1
   topic=simple_harmonic_motion score=0.5839 type=hybrid
   Một vật dao động điều hòa có phương trình là: $$ x=2\cos\left(4\pi t-\frac{\pi}{6}\right) \quad(cm) $$ Hãy cho biết: * Biên độ * Tần số góc * Chu kì * Tần số * Pha ban đầu * Pha của dao động ở thời điểm: $$ t=1s $$ ---

### REAL_EVAL_PHY11_SHM_PERIOD_001

- Question: Một vật dao động điều hòa có ω = 4π rad/s. Tính chu kì T.
- Expected chunks: TH_PHY11_C01_L02_029
- Retrieved top chunks: TH_PHY11_C01_L02_005, TH_PHY11_C01_L02_029, TH_PHY11_C01_L04_014, TH_PHY11_C01_L02_025, TH_PHY11_C01_L04_007, TH_PHY11_C01_L02_003, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_008, TH_PHY11_C01_L04_023, TH_PHY11_C01_L04_018
- Gold rank: 2
- Error types: context_ok_answer_failed, formula_error
- Rule score: 0.6667
- Numeric correct: true
- Concept coverage: 0.3333
- LLM judge score: 4.7500
- Hallucination: false
- Recommendation: Use a calculation-oriented answer prompt: formula from context, substitution, calculation, unit, then final answer.

Expected answer/concepts:

```json
{
  "type": "mixed",
  "value": 0.5,
  "unit": "s",
  "tolerance": 0.000001,
  "reference_answer": "Dùng ω = 2π/T nên T = 2π/ω = 2π/(4π) = 0,5 s.",
  "required_concepts": [
    {
      "label": "ω = 2π/T",
      "anyOf": [
        "ω=2π/T",
        "ω = 2π/T",
        "omega = 2pi/T"
      ]
    },
    {
      "label": "T = 2π/ω",
      "anyOf": [
        "T=2π/ω",
        "T = 2π/ω",
        "T = 2pi/omega"
      ]
    },
    {
      "label": "0,5 s",
      "anyOf": [
        "0,5 s",
        "0.5 s",
        "0,5s",
        "0.5s"
      ]
    }
  ]
}
```

Generated answer:

```text
![Hình 2.1 - Đồ thị dao động điều hòa](assets/images/hinh-2-1.png) **Mô tả sơ bộ** * Đồ thị hình sin. * Trục tung: (x(m)), từ (-0,2) đến (0,2). * Đỉnh tại: $$ x=0,2 $$ ứng với: $$ t=0,1s;\qquad t=0,5s $$ * Cực tiểu tại: $$ x=-0,2 $$ ứng với: $$ t=0,3s $$ * Giao với trục thời gian tại: $$ t=0,2s;\qquad t=0,4s $$ --- Theo đồ thị Hình 2.1, cứ sau mỗi chu kì thì dao động của vật lại lặp lại như cũ. Như vậy, theo phương trình dao động ta phải có: $$ x=A\cos[\omega(t+T)] =A\cos(\omega t) $$ Theo tính chất của hàm cosin ta suy ra: $$ \omega T=2\pi $$ hay $$ \omega=\frac{2\pi}{T} \qu… Nguồn tham chiếu gần nhất: Hình 2.1. Dạng bài gần nhất: Tìm chu kì từ phương trình dao động.
```

Retrieved chunks:

1. TH_PHY11_C01_L02_005 - Hình 2.1
   topic=simple_harmonic_motion score=0.7459 type=hybrid
   ![Hình 2.1 - Đồ thị dao động điều hòa](assets/images/hinh-2-1.png) **Mô tả sơ bộ** * Đồ thị hình sin. * Trục tung: (x(m)), từ (-0,2) đến (0,2). * Đỉnh tại: $$ x=0,2 $$ ứng với: $$ t=0,1s;\qquad t=0,5s $$ * Cực tiểu tại: $$ x=-0,2 $$ ứng với: $$ t=0,3s $$ * Giao với trục thời gian tại: $$ t=0,2s;\qquad t=0,4s $$ --- Theo đồ thị Hình 2.1, cứ sau mỗi chu kì thì dao động của vật lại lặp lại như cũ. Như vậy, theo phương trình dao động ta phải có: $$ x=A\cos[\omega(t+T)] =A\cos(\omega t) $$ Theo tí...
2. TH_PHY11_C01_L02_029 - Em đã học
   topic=simple_harmonic_motion score=0.7091 type=hybrid
   > Chu kì (T) là khoảng thời gian để vật thực hiện một dao động. > Đơn vị của chu kì là giây (s). > Tần số (f) là số dao động mà vật thực hiện được trong một giây. > Đơn vị của tần số là (1/s), gọi là héc (Hz). > Trong dao động điều hòa, giữa tần số góc (\omega), chu kì (T) và tần số (f) có mối liên hệ: > > $$ > \omega=\frac{2\pi}{T}=2\pi f > $$ > Đơn vị của tần số góc là rad/s. > Độ lệch pha giữa hai dao động điều hòa cùng chu kì luôn bằng độ lệch pha ban đầu. ---
3. TH_PHY11_C01_L04_014 - Bài 1
   topic=simple_harmonic_motion score=0.6729 type=hybrid
   Một vật dao động điều hòa có phương trình là: $$ x=2\cos\left(4\pi t-\frac{\pi}{6}\right) \quad(cm) $$ Hãy cho biết: * Biên độ * Tần số góc * Chu kì * Tần số * Pha ban đầu * Pha của dao động ở thời điểm: $$ t=1s $$ ---
4. TH_PHY11_C01_L02_025 - Hoạt động 1
   topic=simple_harmonic_motion score=0.6406 type=hybrid
   Xét một vật dao động điều hòa có: * Biên độ: $$ A=10cm $$ * Tần số: $$ f=5Hz $$ Tại thời điểm ban đầu ((t=0)), vật có li độ cực đại theo chiều dương. Yêu cầu: * Xác định chu kì, tần số góc, pha ban đầu của dao động. * Viết phương trình và vẽ đồ thị ((x-t)) của dao động. ---
5. TH_PHY11_C01_L04_007 - Giải
   topic=simple_harmonic_motion score=0.6244 type=hybrid
   a. Tần số góc của dao động: $$ \omega=2\pi f=4\pi \quad(rad/s) $$ Khi: $$ t=0 $$ ta có: $$ x_0=A\cos\varphi=5cm $$ $$ v_0=-\omega A\sin\varphi=-30cm/s $$ Biên độ và pha ban đầu của dao động: $$ A=\sqrt{x^2+\frac{v^2}{\omega^2}} =\sqrt{5^2+\frac{(-30)^2}{(4\pi)^2}} \approx 5,54cm $$ $$ \tan\varphi ===========
6. TH_PHY11_C01_L02_003 - Các đại lượng đặc trưng
   topic=simple_harmonic_motion score=0.6149 type=hybrid
   * **Li độ**: (x) là độ dịch chuyển từ vị trí cân bằng đến vị trí của vật tại thời điểm (t). * **Biên độ**: (A) là độ dịch chuyển cực đại của vật tính từ vị trí cân bằng. * **Chu kì**: là khoảng thời gian để vật thực hiện được một dao động, kí hiệu là (T). * Đơn vị của chu kì dao động là giây (s). * **Tần số**: là số dao động mà vật thực hiện được trong một giây, kí hiệu là (f). Ta có: $$ f=\frac{1}{T} $$ * Đơn vị của tần số là (s^{-1}), gọi là héc (Hz). * **Tần số góc**: (\omega). ---
7. TH_PHY11_C01_L01_017 - 5. Em đã học
   topic=simple_harmonic_motion score=0.6087 type=hybrid
   > Dao động cơ là chuyển động qua lại của vật quanh vị trí cân bằng. > Dao động tuần hoàn là dao động trong đó, sau những khoảng thời gian bằng nhau, vật trở lại vị trí cũ theo hướng cũ. > Dao động điều hòa là dao động trong đó li độ của vật là một hàm cosin hoặc hàm sin của thời gian. > Phương trình của dao động điều hòa là: $$ x=A\cos(\omega t+\varphi) $$ Trong đó: * $x$ là li độ. * $A$ là biên độ. * $\omega$ là tần số góc. * $\omega t+\varphi$ là pha tại thời điểm $t$. * $\varphi$ là pha ba...
8. TH_PHY11_C01_L02_008 - 2.1. Pha ban đầu
   topic=simple_harmonic_motion score=0.5982 type=hybrid
   Hình 2.2 là đồ thị của hai vật dao động điều hòa cùng chu kì, cùng biên độ nhưng dao động 1 luôn đạt tới giá trị cực đại sớm hơn dao động 2 một thời gian là: $$ \frac{T}{4} $$ Từ đồ thị ta thấy: * Tại thời điểm ban đầu ((t=0)), vật dao động điều hòa 1 đang ở vị trí biên: $$ x=A $$ và sẽ dịch chuyển về vị trí cân bằng. * Vật dao động điều hòa 2 đang ở vị trí cân bằng và sẽ dịch chuyển về phía: $$ x>0 $$ Các phương trình dao động tương ứng với đồ thị Hình 2.2 có pha ban đầu lần lượt là: $$ x_1=...
9. TH_PHY11_C01_L04_023 - Em có thể
   topic=simple_harmonic_motion score=0.5944 type=hybrid
   > Xác định được chu kì, tần số, tần số góc và viết phương trình của vật dao động điều hòa. Ví dụ: Đồng hồ quả lắc.
10. TH_PHY11_C01_L04_018 - Bài 4
   topic=simple_harmonic_motion score=0.5873 type=hybrid
   Hình 4.3 là đồ thị li độ – thời gian của một vật dao động điều hòa. a. Xác định biên độ, chu kì, tần số, tần số góc và pha ban đầu của vật dao động. b. Viết phương trình của dao động của vật. ---

### REAL_EVAL_PHY11_SHM_POSITION_001

- Question: Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Tính li độ tại t = 2 s.
- Expected chunks: TH_PHY11_C01_L01_007, TH_PHY11_C01_L01_006
- Retrieved top chunks: TH_PHY11_C01_L04_014, TH_PHY11_C01_L01_007, TH_PHY11_C01_L04_002, TH_PHY11_C01_L04_015, TH_PHY11_C01_L02_008, TH_PHY11_C01_L02_005, TH_PHY11_C01_L02_025, TH_PHY11_C01_L02_026, TH_PHY11_C01_L01_017, TH_PHY11_C01_L01_006
- Gold rank: 2
- Error types: context_ok_answer_failed, formula_error, numeric_error, hallucination
- Rule score: 0.1667
- Numeric correct: false
- Concept coverage: 0.3333
- LLM judge score: 1.3500
- Hallucination: true
- Recommendation: Constrain answer generation to retrieved references and require explicit missing-data acknowledgement.

Expected answer/concepts:

```json
{
  "type": "mixed",
  "value": 0,
  "unit": "cm",
  "tolerance": 0.000001,
  "reference_answer": "Thay t = 2 s vào x = 2cos(4πt + π/2), pha bằng 17π/2 nên cos(17π/2) = 0. Vậy x = 0 cm.",
  "required_concepts": [
    {
      "label": "thay t = 2",
      "anyOf": [
        "t = 2",
        "thay t"
      ]
    },
    {
      "label": "pha dao động",
      "anyOf": [
        "pha",
        "4πt + π/2"
      ]
    },
    {
      "label": "x = 0 cm",
      "anyOf": [
        "x = 0 cm",
        "0 cm",
        "li độ bằng 0"
      ]
    }
  ]
}
```

Generated answer:

```text
Một vật dao động điều hòa có phương trình là: $$ x=2\cos\left(4\pi t-\frac{\pi}{6}\right) \quad(cm) $$ Hãy cho biết: * Biên độ * Tần số góc * Chu kì * Tần số * Pha ban đầu * Pha của dao động ở thời điểm: $$ t=1s $$ --- Nguồn tham chiếu gần nhất: Bài 1. Dạng bài gần nhất: Tính li độ tại một thời điểm.
```

Retrieved chunks:

1. TH_PHY11_C01_L04_014 - Bài 1
   topic=simple_harmonic_motion score=0.7233 type=hybrid
   Một vật dao động điều hòa có phương trình là: $$ x=2\cos\left(4\pi t-\frac{\pi}{6}\right) \quad(cm) $$ Hãy cho biết: * Biên độ * Tần số góc * Chu kì * Tần số * Pha ban đầu * Pha của dao động ở thời điểm: $$ t=1s $$ ---
2. TH_PHY11_C01_L01_007 - Bài tập 1: Xác định các đại lượng từ phương trình dao động
   topic=simple_harmonic_motion score=0.7153 type=hybrid
   Một vật dao động điều hòa có phương trình: $$ x=2\cos\left(4\pi t+\frac{\pi}{2}\right)\text{ cm} $$ Hãy xác định: 1. Biên độ và pha ban đầu của dao động. 2. Pha và li độ của dao động tại thời điểm: $$ t=2\text{ s} $$ ---
3. TH_PHY11_C01_L04_002 - Ví dụ 1
   topic=simple_harmonic_motion score=0.6662 type=hybrid
   Cho phương trình của một vật dao động điều hòa: $$ x=5\cos\left(10\pi t+\frac{\pi}{6}\right) \quad(cm) $$ Xác định biên độ (A), tần số (f), pha ban đầu (\varphi), và li độ (x), tại thời điểm: $$ t_1=0,05s $$ ---
4. TH_PHY11_C01_L04_015 - Bài 2
   topic=simple_harmonic_motion score=0.6599 type=hybrid
   Một vật dao động điều hòa dọc theo trục (Ox), quanh điểm gốc (O), với biên độ: $$ A=10cm $$ và chu kì: $$ T=2s $$ Tại thời điểm: $$ t=0 $$ vật có li độ: $$ x=A $$ a. Viết phương trình dao động của vật. b. Xác định thời điểm đầu tiên vật qua vị trí có li độ: $$ x=5cm $$ ---
5. TH_PHY11_C01_L02_008 - 2.1. Pha ban đầu
   topic=simple_harmonic_motion score=0.6526 type=hybrid
   Hình 2.2 là đồ thị của hai vật dao động điều hòa cùng chu kì, cùng biên độ nhưng dao động 1 luôn đạt tới giá trị cực đại sớm hơn dao động 2 một thời gian là: $$ \frac{T}{4} $$ Từ đồ thị ta thấy: * Tại thời điểm ban đầu ((t=0)), vật dao động điều hòa 1 đang ở vị trí biên: $$ x=A $$ và sẽ dịch chuyển về vị trí cân bằng. * Vật dao động điều hòa 2 đang ở vị trí cân bằng và sẽ dịch chuyển về phía: $$ x>0 $$ Các phương trình dao động tương ứng với đồ thị Hình 2.2 có pha ban đầu lần lượt là: $$ x_1=...
6. TH_PHY11_C01_L02_005 - Hình 2.1
   topic=simple_harmonic_motion score=0.6289 type=hybrid
   ![Hình 2.1 - Đồ thị dao động điều hòa](assets/images/hinh-2-1.png) **Mô tả sơ bộ** * Đồ thị hình sin. * Trục tung: (x(m)), từ (-0,2) đến (0,2). * Đỉnh tại: $$ x=0,2 $$ ứng với: $$ t=0,1s;\qquad t=0,5s $$ * Cực tiểu tại: $$ x=-0,2 $$ ứng với: $$ t=0,3s $$ * Giao với trục thời gian tại: $$ t=0,2s;\qquad t=0,4s $$ --- Theo đồ thị Hình 2.1, cứ sau mỗi chu kì thì dao động của vật lại lặp lại như cũ. Như vậy, theo phương trình dao động ta phải có: $$ x=A\cos[\omega(t+T)] =A\cos(\omega t) $$ Theo tí...
7. TH_PHY11_C01_L02_025 - Hoạt động 1
   topic=simple_harmonic_motion score=0.6231 type=hybrid
   Xét một vật dao động điều hòa có: * Biên độ: $$ A=10cm $$ * Tần số: $$ f=5Hz $$ Tại thời điểm ban đầu ((t=0)), vật có li độ cực đại theo chiều dương. Yêu cầu: * Xác định chu kì, tần số góc, pha ban đầu của dao động. * Viết phương trình và vẽ đồ thị ((x-t)) của dao động. ---
8. TH_PHY11_C01_L02_026 - Hoạt động 2
   topic=simple_harmonic_motion score=0.6109 type=hybrid
   Cho hai con lắc đơn dao động điều hòa. Biết phương trình dao động của con lắc thứ nhất là: $$ x=20\cos\left(20\pi t+\frac{\pi}{2}\right) \quad(cm) $$ Con lắc thứ hai có cùng biên độ và tần số nhưng lệch về thời gian so với con lắc thứ nhất một phần tư chu kì. Hãy viết phương trình dao động của con lắc thứ hai. ---
9. TH_PHY11_C01_L01_017 - 5. Em đã học
   topic=simple_harmonic_motion score=0.5940 type=hybrid
   > Dao động cơ là chuyển động qua lại của vật quanh vị trí cân bằng. > Dao động tuần hoàn là dao động trong đó, sau những khoảng thời gian bằng nhau, vật trở lại vị trí cũ theo hướng cũ. > Dao động điều hòa là dao động trong đó li độ của vật là một hàm cosin hoặc hàm sin của thời gian. > Phương trình của dao động điều hòa là: $$ x=A\cos(\omega t+\varphi) $$ Trong đó: * $x$ là li độ. * $A$ là biên độ. * $\omega$ là tần số góc. * $\omega t+\varphi$ là pha tại thời điểm $t$. * $\varphi$ là pha ba...
10. TH_PHY11_C01_L01_006 - 2.2. Phương trình của dao động điều hòa
   topic=simple_harmonic_motion score=0.5840 type=hybrid
   Đồ thị hình sin có thể được biểu diễn bằng hàm sin hoặc hàm cosin. Ta chọn hàm cosin: $$ x=A\cos(\omega t+\varphi) \tag{1.1} $$ Đây được gọi là **phương trình của dao động điều hòa**. Trong phương trình: * $x$ là li độ của vật tại thời điểm $t$. * $A$ là biên độ dao động. * $\omega$ là tần số góc. * $\omega t+\varphi$ là pha của dao động tại thời điểm $t$. * $\varphi$ là pha ban đầu. Dao động được mô tả bằng phương trình: $$ x=A\cos(\omega t+\varphi) $$ được gọi là dao động điều hòa. Vật đang...

### REAL_EVAL_PHY11_SHM_VELOCITY_001

- Question: Từ x = A cos(ωt + φ), hãy viết phương trình vận tốc của vật dao động điều hòa.
- Expected chunks: TH_PHY11_C01_L03_004
- Retrieved top chunks: TH_PHY11_C01_L03_011, TH_PHY11_C01_L03_004, TH_PHY11_C01_L03_021, TH_PHY11_C01_L04_011, TH_PHY11_C01_L04_006, TH_PHY11_C01_L03_015, TH_PHY11_C01_L03_002, TH_PHY11_C01_L03_006, TH_PHY11_C03_L18_017, TH_PHY11_C01_L03_010
- Gold rank: 2
- Error types: none
- Rule score: 1.0000
- Numeric correct: N/A
- Concept coverage: 1.0000
- LLM judge score: 4.7500
- Hallucination: false
- Recommendation: No major issue detected.

Expected answer/concepts:

```json
{
  "type": "conceptual",
  "reference_answer": "Vận tốc là đạo hàm của li độ theo thời gian: v = x' = -ωA sin(ωt + φ).",
  "required_concepts": [
    {
      "label": "vận tốc là đạo hàm của li độ",
      "anyOf": [
        "đạo hàm của li độ",
        "v = x'",
        "v=x'"
      ]
    },
    {
      "label": "v = -ωA sin(ωt + φ)",
      "anyOf": [
        "v = -ωA sin",
        "v=-ωA sin",
        "v = -omega A sin"
      ]
    }
  ]
}
```

Generated answer:

```text
Từ x = A cos(ωt + φ), vận tốc là đạo hàm của li độ theo thời gian: v = x' và v = -ωA sin(ωt + φ). Lấy đạo hàm x theo thời gian. Vì đạo hàm của cos(ωt + φ) là -ω sin(ωt + φ), nên v = x' = -ωA sin(ωt + φ).
```

Retrieved chunks:

1. TH_PHY11_C01_L03_011 - 2.1. Phương trình gia tốc
   topic=shm_kinematics score=0.6431 type=hybrid
   Như vậy, gia tốc tức thời của một vật là đạo hàm của vận tốc theo thời gian, kí hiệu là: $$ v' $$ Ta có: $$ a=v' =-\omega^2A\cos(\omega t+\varphi) \tag{3.3} $$ Công thức (3.3) là phương trình của gia tốc. Thay: $$ x=A\cos(\omega t+\varphi) $$ vào (3.3) ta được: $$ a=-\omega^2x \tag{3.4} $$ Từ công thức (3.4) ta thấy: * Khi vật ở vị trí cân bằng: $$ a=0 $$ * Khi vật ở vị trí biên: $$ a=\pm\omega^2A $$ ---
2. TH_PHY11_C01_L03_004 - 1.1. Phương trình của vận tốc
   topic=shm_kinematics score=0.6418 type=hybrid
   Khi học phép tính đạo hàm, chúng ta sẽ biết: $$ v=\frac{\Delta x}{\Delta t} $$ (với (\Delta t) rất nhỏ) chính là đạo hàm của li độ (x) theo thời gian, kí hiệu là (x'). Ta có: $$ x=A\cos(\omega t+\varphi) $$ Suy ra: $$ v=x' =-\omega A\sin(\omega t+\varphi) \tag{3.1} $$ Công thức (3.1) là phương trình của vận tốc. Có thể biến đổi như sau: $$ v=\pm \omega A\sqrt{1-\cos^2(\omega t+\varphi)} $$ Thay: $$ x=A\cos(\omega t+\varphi) $$ vào ta được: $$ v=\pm \omega\sqrt{A^2-x^2} \tag{3.2} $$ Từ công th...
3. TH_PHY11_C01_L03_021 - Em đã học
   topic=shm_kinematics score=0.6398 type=hybrid
   > Phương trình của vận tốc và gia tốc của một vật dao động điều hòa có li độ: $$ x=A\cos(\omega t+\varphi) $$ là: $$ v=-\omega A\sin(\omega t+\varphi) $$ $$ a=-\omega^2A\cos(\omega t+\varphi) $$ > Đồ thị của vận tốc, gia tốc theo thời gian là đường hình sin. > Vận tốc của vật dao động sớm pha: $$ \frac{\pi}{2} $$ so với li độ. > Gia tốc của vật dao động ngược pha với li độ. > Vectơ gia tốc luôn hướng về vị trí cân bằng và có độ lớn tỉ lệ với độ lớn của li độ. > Tại vị trí biên, vận tốc của vậ...
4. TH_PHY11_C01_L04_011 - Ví dụ 3
   topic=shm_kinematics score=0.6200 type=hybrid
   Một vật dao động điều hòa với tần số góc: $$ \omega=1rad/s $$ có đồ thị của li độ (x), vận tốc (v) và gia tốc (a) theo thời gian (t) được mô tả trên Hình 4.1. ---
5. TH_PHY11_C01_L04_006 - Ví dụ 2
   topic=shm_kinematics score=0.6026 type=hybrid
   Một vật dao động điều hòa với tần số: $$ f=2Hz $$ Tại thời điểm ban đầu vật có li độ: $$ x=5cm $$ và vận tốc: $$ v=-30cm/s $$ Xác định: a. Biên độ và pha ban đầu của dao động. b. Giá trị cực đại của vận tốc và gia tốc của vật khi dao động. ---
6. TH_PHY11_C01_L03_015 - Hoạt động 2
   topic=shm_kinematics score=0.5636 type=hybrid
   Phương trình dao động của một vật là: $$ x=5\cos(4\pi t) \quad(cm) $$ Hãy: * Viết phương trình vận tốc. * Viết phương trình gia tốc. * Vẽ đồ thị li độ, vận tốc, gia tốc theo thời gian của vật. ---
7. TH_PHY11_C01_L03_002 - 1. Vận tốc của vật dao động điều hòa
   topic=shm_kinematics score=0.5538 type=hybrid
   Như đã biết, vận tốc tức thời của một vật được xác định bằng công thức: $$ v=\frac{\Delta x}{\Delta t} $$ (với (\Delta t) rất nhỏ), tức là bằng độ dốc của đồ thị ((x-t)) tại điểm đang xét. Để đơn giản, ta hãy xét một vật dao động điều hòa có đồ thị ((x-t)) được chỉ trên Hình 3.1. Ta nhận thấy độ dốc của đồ thị, tức vận tốc của vật, có giá trị cực đại khi ở vị trí cân bằng rồi giảm dần đến 0 khi vật ra đến vị trí biên. Sau đó độ dốc của đồ thị lại tăng dần đến giá trị cực đại khi vật về đến vị...
8. TH_PHY11_C01_L03_006 - Hình 3.2
   topic=shm_kinematics score=0.5233 type=hybrid
   ![Hình 3.2 - Đồ thị (v-t) của một vật dao động điều hòa](assets/images/hinh-3-2.png) **Nội dung hình** * Đồ thị vận tốc theo thời gian. * Pha ban đầu: $$ \varphi = 0 $$ ---
9. TH_PHY11_C03_L18_017 - Giải
   topic=shm_kinematics score=0.5191 type=hybrid
   Chọn gốc tọa độ $O$ tại điểm electron bắt đầu bay vào điện trường đều. Trục $Ox$ có hướng trùng với vectơ vận tốc ban đầu. Trục $Oy$ hướng thẳng đứng lên trên. Đổi đơn vị: $$ d=24\ cm=24 \times 10^{-2}\ m=0{,}24\ m $$ Độ lớn cường độ điện trường giữa hai bản phẳng là: $$ E=\frac{U}{d}=\frac{48}{24 \times 10^{-2}}=200\ V/m $$ Vectơ cường độ điện trường hướng từ trên xuống dưới và ngược chiều với trục $Oy$. Lực điện tác dụng lên electron có phương thẳng đứng, chiều hướng lên trên. Độ lớn lực đi...
10. TH_PHY11_C01_L03_010 - 2. Gia tốc của vật dao động điều hòa
   topic=shm_kinematics score=0.5184 type=hybrid
   Tương tự như vận tốc, gia tốc tức thời của một vật được xác định bằng công thức: $$ a=\frac{\Delta v}{\Delta t} $$ (với (\Delta t) rất nhỏ), tức là bằng độ dốc của đồ thị vận tốc tại điểm đang xét. Ta nhận thấy độ dốc của đồ thị Hình 3.2, hay gia tốc của vật, có giá trị bằng 0 khi vật ở vị trí cân bằng rồi tăng đến giá trị cực đại khi vật ở vị trí biên. ---

### REAL_EVAL_PHY11_SHM_ACCELERATION_001

- Question: Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào?
- Expected chunks: TH_PHY11_C01_L03_011
- Retrieved top chunks: TH_PHY11_C01_L03_021, TH_PHY11_C01_L03_010, TH_PHY11_C01_L03_011, TH_PHY11_C01_L04_011, TH_PHY11_C01_L03_002, TH_PHY11_C01_L03_018, TH_PHY11_C01_L03_004, TH_PHY11_C01_L03_001, TH_PHY11_C01_L03_015, TH_PHY11_C01_L04_006
- Gold rank: 3
- Error types: context_ok_answer_failed, formula_error
- Rule score: 0.3333
- Numeric correct: N/A
- Concept coverage: 0.3333
- LLM judge score: 4.9000
- Hallucination: false
- Recommendation: Use a calculation-oriented answer prompt: formula from context, substitution, calculation, unit, then final answer.

Expected answer/concepts:

```json
{
  "type": "conceptual",
  "reference_answer": "Gia tốc của dao động điều hòa thỏa mãn a = -ω²x, tức gia tốc luôn trái dấu với li độ và hướng về vị trí cân bằng.",
  "required_concepts": [
    {
      "label": "a = -ω²x",
      "anyOf": [
        "a = -ω²x",
        "a=-ω²x",
        "a = -omega^2 x",
        "a=-omega^2x"
      ]
    },
    {
      "label": "trái dấu với li độ",
      "anyOf": [
        "trái dấu với li độ",
        "ngược chiều với li độ"
      ]
    },
    {
      "label": "vị trí cân bằng",
      "anyOf": [
        "vị trí cân bằng",
        "hướng về vị trí cân bằng"
      ]
    }
  ]
}
```

Generated answer:

```text
> Phương trình của vận tốc và gia tốc của một vật dao động điều hòa có li độ: $$ x=A\cos(\omega t+\varphi) $$ là: $$ v=-\omega A\sin(\omega t+\varphi) $$ $$ a=-\omega^2A\cos(\omega t+\varphi) $$ > Đồ thị của vận tốc, gia tốc theo thời gian là đường hình sin. > Vận tốc của vật dao động sớm pha: $$ \frac{\pi}{2} $$ so với li độ. > Gia tốc của vật dao động ngược pha với li độ. > Vectơ gia tốc luôn hướng về vị trí cân bằng và có độ lớn tỉ lệ với độ lớn của li độ. > Tại vị trí biên, vận tốc của vật bằng 0, còn gia tốc của vật có độ lớn cực đại. > Tại vị trí cân bằng, gia tốc của vật bằn… Nguồn tham chiếu gần nhất: Em đã học. Dạng bài gần nhất: Tính vận tốc cực đại và gia tốc cực đại.
```

Retrieved chunks:

1. TH_PHY11_C01_L03_021 - Em đã học
   topic=shm_kinematics score=0.6699 type=hybrid
   > Phương trình của vận tốc và gia tốc của một vật dao động điều hòa có li độ: $$ x=A\cos(\omega t+\varphi) $$ là: $$ v=-\omega A\sin(\omega t+\varphi) $$ $$ a=-\omega^2A\cos(\omega t+\varphi) $$ > Đồ thị của vận tốc, gia tốc theo thời gian là đường hình sin. > Vận tốc của vật dao động sớm pha: $$ \frac{\pi}{2} $$ so với li độ. > Gia tốc của vật dao động ngược pha với li độ. > Vectơ gia tốc luôn hướng về vị trí cân bằng và có độ lớn tỉ lệ với độ lớn của li độ. > Tại vị trí biên, vận tốc của vậ...
2. TH_PHY11_C01_L03_010 - 2. Gia tốc của vật dao động điều hòa
   topic=shm_kinematics score=0.6104 type=hybrid
   Tương tự như vận tốc, gia tốc tức thời của một vật được xác định bằng công thức: $$ a=\frac{\Delta v}{\Delta t} $$ (với (\Delta t) rất nhỏ), tức là bằng độ dốc của đồ thị vận tốc tại điểm đang xét. Ta nhận thấy độ dốc của đồ thị Hình 3.2, hay gia tốc của vật, có giá trị bằng 0 khi vật ở vị trí cân bằng rồi tăng đến giá trị cực đại khi vật ở vị trí biên. ---
3. TH_PHY11_C01_L03_011 - 2.1. Phương trình gia tốc
   topic=shm_kinematics score=0.6055 type=hybrid
   Như vậy, gia tốc tức thời của một vật là đạo hàm của vận tốc theo thời gian, kí hiệu là: $$ v' $$ Ta có: $$ a=v' =-\omega^2A\cos(\omega t+\varphi) \tag{3.3} $$ Công thức (3.3) là phương trình của gia tốc. Thay: $$ x=A\cos(\omega t+\varphi) $$ vào (3.3) ta được: $$ a=-\omega^2x \tag{3.4} $$ Từ công thức (3.4) ta thấy: * Khi vật ở vị trí cân bằng: $$ a=0 $$ * Khi vật ở vị trí biên: $$ a=\pm\omega^2A $$ ---
4. TH_PHY11_C01_L04_011 - Ví dụ 3
   topic=shm_kinematics score=0.5807 type=hybrid
   Một vật dao động điều hòa với tần số góc: $$ \omega=1rad/s $$ có đồ thị của li độ (x), vận tốc (v) và gia tốc (a) theo thời gian (t) được mô tả trên Hình 4.1. ---
5. TH_PHY11_C01_L03_002 - 1. Vận tốc của vật dao động điều hòa
   topic=shm_kinematics score=0.5767 type=hybrid
   Như đã biết, vận tốc tức thời của một vật được xác định bằng công thức: $$ v=\frac{\Delta x}{\Delta t} $$ (với (\Delta t) rất nhỏ), tức là bằng độ dốc của đồ thị ((x-t)) tại điểm đang xét. Để đơn giản, ta hãy xét một vật dao động điều hòa có đồ thị ((x-t)) được chỉ trên Hình 3.1. Ta nhận thấy độ dốc của đồ thị, tức vận tốc của vật, có giá trị cực đại khi ở vị trí cân bằng rồi giảm dần đến 0 khi vật ra đến vị trí biên. Sau đó độ dốc của đồ thị lại tăng dần đến giá trị cực đại khi vật về đến vị...
6. TH_PHY11_C01_L03_018 - Câu 1
   topic=shm_kinematics score=0.5684 type=hybrid
   Một vật dao động điều hòa trên trục (Ox). Khi vật qua vị trí cân bằng thì tốc độ của nó là: $$ 20;cm/s $$ Khi vật có tốc độ là: $$ 10;cm/s $$ thì gia tốc của nó có độ lớn là: $$ 40\sqrt3;cm/s^2 $$ Tính biên độ dao động của vật. ---
7. TH_PHY11_C01_L03_004 - 1.1. Phương trình của vận tốc
   topic=shm_kinematics score=0.5430 type=hybrid
   Khi học phép tính đạo hàm, chúng ta sẽ biết: $$ v=\frac{\Delta x}{\Delta t} $$ (với (\Delta t) rất nhỏ) chính là đạo hàm của li độ (x) theo thời gian, kí hiệu là (x'). Ta có: $$ x=A\cos(\omega t+\varphi) $$ Suy ra: $$ v=x' =-\omega A\sin(\omega t+\varphi) \tag{3.1} $$ Công thức (3.1) là phương trình của vận tốc. Có thể biến đổi như sau: $$ v=\pm \omega A\sqrt{1-\cos^2(\omega t+\varphi)} $$ Thay: $$ x=A\cos(\omega t+\varphi) $$ vào ta được: $$ v=\pm \omega\sqrt{A^2-x^2} \tag{3.2} $$ Từ công th...
8. TH_PHY11_C01_L03_001 - Bài 3: Vận tốc, gia tốc trong dao động điều hòa
   topic=shm_kinematics score=0.5185 type=hybrid
   > Ta có thể dựa vào đồ thị ((x-t)) của dao động điều hòa để xác định vận tốc và gia tốc của vật được không? ---
9. TH_PHY11_C01_L03_015 - Hoạt động 2
   topic=shm_kinematics score=0.5055 type=hybrid
   Phương trình dao động của một vật là: $$ x=5\cos(4\pi t) \quad(cm) $$ Hãy: * Viết phương trình vận tốc. * Viết phương trình gia tốc. * Vẽ đồ thị li độ, vận tốc, gia tốc theo thời gian của vật. ---
10. TH_PHY11_C01_L04_006 - Ví dụ 2
   topic=shm_kinematics score=0.5013 type=hybrid
   Một vật dao động điều hòa với tần số: $$ f=2Hz $$ Tại thời điểm ban đầu vật có li độ: $$ x=5cm $$ và vận tốc: $$ v=-30cm/s $$ Xác định: a. Biên độ và pha ban đầu của dao động. b. Giá trị cực đại của vận tốc và gia tốc của vật khi dao động. ---

### REAL_EVAL_PHY11_WAVE_SPEED_001

- Question: Một sóng có tần số f = 5 Hz và tốc độ truyền sóng v = 2 m/s. Tính bước sóng.
- Expected chunks: TH_PHY11_C02_L14_004
- Retrieved top chunks: TH_PHY11_C02_L14_009, TH_PHY11_C02_L14_003, TH_PHY11_C02_L14_010, TH_PHY11_C02_L14_004, TH_PHY11_C02_L14_005, TH_PHY11_C02_L08_010, TH_PHY11_C02_L08_009, TH_PHY11_C02_L08_007, TH_PHY11_C02_L08_023, TH_PHY11_C02_L08_008
- Gold rank: 4
- Error types: context_ok_answer_failed, formula_error, numeric_error
- Rule score: 0.1667
- Numeric correct: false
- Concept coverage: 0.3333
- LLM judge score: 0.9500
- Hallucination: false
- Recommendation: Use a calculation-oriented answer prompt: formula from context, substitution, calculation, unit, then final answer.

Expected answer/concepts:

```json
{
  "type": "mixed",
  "value": 0.4,
  "unit": "m",
  "tolerance": 0.000001,
  "reference_answer": "Dùng v = λf nên λ = v/f = 2/5 = 0,4 m.",
  "required_concepts": [
    {
      "label": "v = λf",
      "anyOf": [
        "v = λf",
        "v=λf",
        "v = lambda f"
      ]
    },
    {
      "label": "λ = v/f",
      "anyOf": [
        "λ = v/f",
        "lambda = v/f",
        "bước sóng"
      ]
    },
    {
      "label": "0,4 m",
      "anyOf": [
        "0,4 m",
        "0.4 m",
        "0,4m",
        "0.4m"
      ]
    }
  ]
}
```

Generated answer:

```text
Một sóng âm có tần số: $$ f=192Hz $$ và truyền đi được quãng đường: $$ s=91,4m $$ trong: $$ t=0,27s $$ Hãy tính: a. Tốc độ truyền sóng. b. Bước sóng. c. Nếu tần số sóng là: $$ f'=442Hz $$ thì bước sóng và chu kì là bao nhiêu? --- Nguồn tham chiếu gần nhất: Ví dụ 1. Câu trả lời được rút từ theory chunk liên quan nhất.
```

Retrieved chunks:

1. TH_PHY11_C02_L14_009 - Giải
   topic=mechanical_wave score=0.5763 type=hybrid
   Bước sóng là khoảng cách giữa hai ngọn sóng liên tiếp. Theo đề bài ta có: $$ \lambda=14,3-12,4=1,90cm $$ Áp dụng công thức: $$ v=\lambda f $$ tính tốc độ truyền sóng: $$ v=1,9\cdot50=95cm/s $$ ---
2. TH_PHY11_C02_L14_003 - Giải
   topic=mechanical_wave score=0.4935 type=hybrid
   a. Tốc độ truyền sóng: $$ v=\frac{s}{t} =============
3. TH_PHY11_C02_L14_010 - Ví dụ 3
   topic=mechanical_wave score=0.4895 type=hybrid
   Một sóng hình sin đang lan truyền từ trái sang phải trên một dây dài. Hình 14.1 là hình ảnh của sóng ở một thời điểm xét. Cho biết tốc độ truyền sóng: $$ v=1m/s $$ ---
4. TH_PHY11_C02_L14_004 - \frac{91,4}{0,27}
   topic=mechanical_wave score=0.4418 type=hybrid
   338,5m/s $$ b. Sử dụng công thức: $$ v=\lambda f $$ Suy ra: $$ \lambda=\frac{v}{f} ===================
5. TH_PHY11_C02_L14_005 - \frac{338,5}{192}
   topic=mechanical_wave score=0.4296 type=hybrid
   1,76m $$ c. Với: $$ f'=442Hz $$ ta có: $$ \lambda' ========
6. TH_PHY11_C02_L08_010 - Câu hỏi
   topic=mechanical_wave score=0.4290 type=hybrid
   > Hãy quan sát chuyển động của miếng xốp trong thí nghiệm Hình 8.1 và cho biết miếng xốp có chuyển động ra xa nguồn cùng với sóng không? --- Các phần tử môi trường chỉ dao động trong một phạm vi không gian rất hẹp, trong khi sóng truyền đi rất xa. ---
7. TH_PHY11_C02_L08_009 - 2. Giải thích sự tạo thành sóng
   topic=mechanical_wave score=0.4146 type=hybrid
   Trong thí nghiệm Hình 8.1, các phần tử nước sát nguồn (O) dao động theo phương thẳng đứng. Nhờ có lực liên kết giữa các phần tử nước mà các phần tử nước ở điểm (M) lân cận điểm (O) dao động theo. Đến lượt các phần tử nước ở điểm (N) lân cận điểm (M) dao động. Ta nói có sự truyền dao động từ điểm này sang điểm khác tạo nên sóng mặt nước. Như vậy, có hai nguyên nhân tạo nên sóng truyền trong một môi trường. Đó là: * Nguồn dao động từ bên ngoài tác dụng lên môi trường tại điểm (O). * Có lực liên...
8. TH_PHY11_C02_L08_007 - Kết quả
   topic=mechanical_wave score=0.4088 type=hybrid
   Quan sát qua thành kênh thẳng đứng, ta thấy mặt cắt của nước có dạng hình sin. Miếng xốp (C) dao động lên xuống tại chỗ, còn những biến dạng của mặt nước lan truyền đi từ nguồn sóng (O) ra xa cho ta hình ảnh về sóng có trên mặt nước. (O) là nguồn sóng, nước là môi trường truyền sóng, đường thẳng (OC) là phương truyền sóng. Đồ thị sóng được mô tả như trên Hình 8.2. ---
9. TH_PHY11_C02_L08_023 - Em có thể
   topic=mechanical_wave score=0.3993 type=hybrid
   > Dùng đồ thị ((u-x)) của một sóng hình sin để nêu được các đại lượng đặc trưng của sóng.
10. TH_PHY11_C02_L08_008 - Hình 8.2
   topic=mechanical_wave score=0.3910 type=hybrid
   ![Hình 8.2 - Đồ thị u-x của một sóng hình sin](assets/images/hinh-8-2.png) **Nội dung hình** Hình 8.2 là đồ thị một sóng hình sin lan truyền trên mặt nước theo phương (Ox). Hình biểu diễn: * Li độ (u). * Ngọn sóng. * Bước sóng (\lambda). * Biên độ sóng. * Lõm sóng. * Phương truyền sóng. ---

### REAL_EVAL_PHY11_OHM_001

- Question: Một điện trở R = 10 Ω được đặt vào hiệu điện thế U = 5 V. Tính cường độ dòng điện.
- Expected chunks: TH_PHY11_C04_L23_010
- Retrieved top chunks: TH_PHY11_C04_L23_010, TH_PHY11_C04_L23_013, TH_PHY11_C04_L26_002, TH_PHY11_C04_L24_022, TH_PHY11_C04_L23_015, TH_PHY11_C04_L24_024, TH_PHY11_C04_L23_022, TH_PHY11_C04_L26_016, TH_PHY11_C04_L24_014, TH_PHY11_C04_L26_004
- Gold rank: 1
- Error types: context_ok_answer_failed, formula_error, numeric_error, hallucination
- Rule score: 0.0000
- Numeric correct: false
- Concept coverage: 0.0000
- LLM judge score: 0.0000
- Hallucination: true
- Recommendation: Constrain answer generation to retrieved references and require explicit missing-data acknowledgement.

Expected answer/concepts:

```json
{
  "type": "mixed",
  "value": 0.5,
  "unit": "A",
  "tolerance": 0.000001,
  "reference_answer": "Từ R = U/I suy ra I = U/R = 5/10 = 0,5 A.",
  "required_concepts": [
    {
      "label": "R = U/I",
      "anyOf": [
        "R = U/I",
        "R=U/I"
      ]
    },
    {
      "label": "I = U/R",
      "anyOf": [
        "I = U/R",
        "I=U/R"
      ]
    },
    {
      "label": "0,5 A",
      "anyOf": [
        "0,5 A",
        "0.5 A",
        "0,5A",
        "0.5A"
      ]
    }
  ]
}
```

Generated answer:

```text
Một vật dao động điều hòa với tần số góc: $$ \omega=1rad/s $$ có đồ thị của li độ (x), vận tốc (v) và gia tốc (a) theo thời gian (t) được mô tả trên Hình 4.1. --- Nguồn tham chiếu gần nhất: Ví dụ 3. Câu trả lời được rút từ theory chunk liên quan nhất.
```

Retrieved chunks:

1. TH_PHY11_C04_L23_010 - Đơn vị điện trở
   topic=ohms_law score=0.5801 type=hybrid
   Trong công thức: $$ R=\frac{U}{I} $$ nếu: * $U$ đo bằng vôn $(V)$. * $I$ đo bằng ampe $(A)$. thì điện trở đo bằng ôm, kí hiệu là: $$ \Omega $$ Ta có: $$ 1\Omega=\frac{1V}{1A} $$ Một số bội số của ôm: $$ 1k\Omega=1000\Omega $$ $$ 1M\Omega=1000k\Omega=1000000\Omega $$ ---
2. TH_PHY11_C04_L23_013 - Bảng 23.2. Kết quả thí nghiệm
   topic=ohms_law score=0.5263 type=hybrid
   | $U(V)$ | $I_1(mA)$ | $I_2(mA)$ | | -----: | --------: | --------: | | 0,0 | 0,00 | 0,00 | | 1,0 | 0,43 | 0,21 | | 2,0 | 0,86 | 0,43 | | 3,0 | 1,30 | 0,65 | | 4,0 | 1,73 | 0,87 | | 5,0 | 2,17 | 1,09 | | 6,0 | 2,60 | 1,31 | | 7,0 | 3,03 | 1,53 | | 8,0 | 3,45 | 1,75 | --- Từ bảng số liệu, ta vẽ được đường đặc trưng vôn - ampe của hai điện trở $R_1$ và $R_2$. Từ đường đặc trưng vôn - ampe, ta thấy đồ thị là một đường thẳng. Khi $U$ tăng thì $I$ cũng tăng. Như vậy, đường đặc trưng vôn - ampe của...
3. TH_PHY11_C04_L26_002 - I. Dụng cụ thí nghiệm
   topic=ohms_law score=0.5014 type=hybrid
   * Hai pin điện hóa loại: $$ 1,5V $$ (một pin cũ đã sử dụng gần hết điện, một pin mới chưa sử dụng). * Một biến trở: $$ 100\Omega $$ * Hai đồng hồ đo điện đa năng hiện số. * Dây nối. * Công tắc điện $K$. * Điện trở bảo vệ $R_b$. * Bảng lắp mạch điện. ---
4. TH_PHY11_C04_L24_022 - Bài 1
   topic=ohms_law score=0.4654 type=hybrid
   Cho mạch điện như Hình 24.5. Suất điện động của nguồn: $$ \mathcal{E}=10V $$ Bỏ qua điện trở trong của nguồn. Các giá trị điện trở: $$ R_1=20\Omega $$ $$ R_2=40\Omega $$ $$ R_3=50\Omega $$
5. TH_PHY11_C04_L23_015 - Hình 23.3
   topic=ohms_law score=0.4628 type=hybrid
   ![Hình 23.3 - Đường đặc trưng vôn-ampe của điện trở R](assets/images/hinh-23-3.png) **Nội dung hình** Đường đặc trưng vôn - ampe của một điện trở $R$. Từ công thức: $$ I=\frac{U}{R} $$ đường đặc trưng là đường thẳng đi qua gốc tọa độ. Độ dốc của đường đặc trưng càng lớn khi điện trở $R$ càng nhỏ. ---
6. TH_PHY11_C04_L24_024 - Bài 2
   topic=ohms_law score=0.4620 type=hybrid
   Cho mạch điện như Hình 24.6. Các giá trị điện trở: $$ R_1=3\Omega $$ $$ R_2=4\Omega $$ $$ R_3=6\Omega $$ Suất điện động của nguồn: $$ \mathcal{E}=12V $$ Điện trở trong của nguồn: $$ r=0{,}6\Omega $$
7. TH_PHY11_C04_L23_022 - Câu hỏi
   topic=ohms_law score=0.4417 type=hybrid
   Vận dụng công thức: $$ I=Snve $$ để giải thích tại sao điện trở $R$ của vật dẫn kim loại phụ thuộc vào chiều dài $l$, tiết diện $S$ và điện trở suất $\rho$ của dây theo công thức: $$ R=\rho\frac{l}{S} $$ ---
8. TH_PHY11_C04_L26_016 - Bước 2
   topic=ohms_law score=0.4211 type=hybrid
   Lặp lại toàn bộ các bước thí nghiệm như đối với pin cũ. Ghi số liệu vào Bảng 26.2. Vẽ đồ thị: $$ U=f(I) $$ Xác định: * Suất điện động. * Điện trở trong. của pin mới. ---
9. TH_PHY11_C04_L24_014 - Định luật Ohm đối với toàn mạch
   topic=ohms_law score=0.4142 type=hybrid
   Từ hệ thức: $$ \mathcal{E}=I(R+r) $$ ta có: $$ I=\frac{\mathcal{E}}{R+r} $$ Trong đó: * $R$ là điện trở mạch ngoài. * $r$ là điện trở trong của nguồn. * $R+r$ là điện trở toàn phần của mạch điện kín. > Cường độ dòng điện chạy trong mạch điện kín tỉ lệ thuận với suất điện động của nguồn điện và tỉ lệ nghịch với điện trở toàn phần của mạch điện đó. ---
10. TH_PHY11_C04_L26_004 - Câu a
   topic=ohms_law score=0.4024 type=hybrid
   Có thể sử dụng đồng hồ đo điện đa năng để đo trực tiếp: * Suất điện động của nguồn điện. * Điện trở trong của nguồn. được không? Tại sao? ---

### REAL_EVAL_PHY11_CAPACITOR_001

- Question: Một tụ điện có điện dung C = 2 μF được đặt vào hiệu điện thế U = 10 V. Tính điện tích của tụ.
- Expected chunks: TH_PHY11_C03_L21_012
- Retrieved top chunks: TH_PHY11_C03_L21_012, TH_PHY11_C03_L21_013, TH_PHY11_C03_L21_019, TH_PHY11_C03_L21_014, TH_PHY11_C03_L21_018, TH_PHY11_C03_L21_029, TH_PHY11_C03_L21_024, TH_PHY11_C03_L21_025, TH_PHY11_C03_L21_021, TH_PHY11_C03_L21_008
- Gold rank: 1
- Error types: context_ok_answer_failed, formula_error, numeric_error
- Rule score: 0.1667
- Numeric correct: false
- Concept coverage: 0.3333
- LLM judge score: 3.1000
- Hallucination: false
- Recommendation: Use a calculation-oriented answer prompt: formula from context, substitution, calculation, unit, then final answer.

Expected answer/concepts:

```json
{
  "type": "mixed",
  "value": 0.00002,
  "unit": "C",
  "tolerance": 1e-7,
  "reference_answer": "Đổi C = 2 μF = 2×10^-6 F. Dùng Q = CU nên Q = 2×10^-6 × 10 = 2×10^-5 C = 0,00002 C.",
  "required_concepts": [
    {
      "label": "Q = CU",
      "anyOf": [
        "Q = CU",
        "Q=CU"
      ]
    },
    {
      "label": "đổi μF sang F",
      "anyOf": [
        "2 μF",
        "2×10^-6 F",
        "2.10^-6 F",
        "0,000002 F"
      ]
    },
    {
      "label": "0,00002 C",
      "anyOf": [
        "0,00002 C",
        "0.00002 C",
        "2×10^-5 C",
        "2.10^-5 C"
      ]
    }
  ]
}
```

Generated answer:

```text
Thực nghiệm cho thấy: > Với một tụ điện xác định, điện tích tích được tỉ lệ thuận với hiệu điện thế đặt vào hai bản tụ. Biểu thức: $$ Q = CU $$ Trong đó: * $Q$ là điện tích của tụ điện. * $U$ là hiệu điện thế giữa hai bản tụ. * $C$ là điện dung của tụ điện. --- Nguồn tham chiếu gần nhất: 1. Điện dung. Câu trả lời được rút từ theory chunk liên quan nhất.
```

Retrieved chunks:

1. TH_PHY11_C03_L21_012 - 1. Điện dung
   topic=capacitor score=0.6212 type=hybrid
   Thực nghiệm cho thấy: > Với một tụ điện xác định, điện tích tích được tỉ lệ thuận với hiệu điện thế đặt vào hai bản tụ. Biểu thức: $$ Q = CU $$ Trong đó: * $Q$ là điện tích của tụ điện. * $U$ là hiệu điện thế giữa hai bản tụ. * $C$ là điện dung của tụ điện. ---
2. TH_PHY11_C03_L21_013 - Khái niệm điện dung
   topic=capacitor score=0.5530 type=hybrid
   > Điện dung của tụ điện là đại lượng đặc trưng cho khả năng tích điện của tụ điện. Được xác định bởi: $$ C=\frac{Q}{U} $$ ---
3. TH_PHY11_C03_L21_019 - a)
   topic=capacitor score=0.5440 type=hybrid
   Đặt vào hai bản tụ: $$ U=36V $$ Tính điện tích mà tụ tích được.
4. TH_PHY11_C03_L21_014 - Đơn vị điện dung
   topic=capacitor score=0.5286 type=hybrid
   Đơn vị SI: $$ F $$ (Fara) Một tụ điện có điện dung: $$ 1F $$ nghĩa là nếu đặt: $$ 1V $$ vào hai bản tụ thì tụ tích được: $$ 1C $$ điện tích. ---
5. TH_PHY11_C03_L21_018 - Câu 1
   topic=capacitor score=0.5163 type=hybrid
   Một tụ điện ghi: $$ 2\mu F - 200V $$
6. TH_PHY11_C03_L21_029 - Ghép song song
   topic=capacitor score=0.5021 type=hybrid
   $$ C=2+3+4 $$ $$ C=9\mu F $$ Vì: $$ 9\mu F > \frac{12}{13}\mu F $$ nên bộ tụ ghép song song có khả năng tích điện tốt hơn. ---
7. TH_PHY11_C03_L21_024 - Hình 21.7
   topic=capacitor score=0.4921 type=hybrid
   **Bộ tụ điện ghép nối tiếp** Các hệ thức: Hiệu điện thế: $$ U=U_1+U_2+\cdots+U_n $$ Điện tích: $$ Q=Q_1=Q_2=\cdots=Q_n $$ Điện dung tương đương: $$ \frac{1}{C} =========== \frac{1}{C_1} + \frac{1}{C_2} +\cdots+ \frac{1}{C_n} $$ ---
8. TH_PHY11_C03_L21_025 - Hình 21.8
   topic=capacitor score=0.4631 type=hybrid
   **Bộ tụ điện ghép song song** Hiệu điện thế: $$ U=U_1=U_2=\cdots=U_n $$ Điện tích: $$ Q=Q_1+Q_2+\cdots+Q_n $$ Điện dung tương đương: $$ C=C_1+C_2+\cdots+C_n $$ ---
9. TH_PHY11_C03_L21_021 - a)
   topic=capacitor score=0.4590 type=hybrid
   Khi tích điện cùng một hiệu điện thế, tụ nào tích được điện tích lớn hơn?
10. TH_PHY11_C03_L21_008 - Phóng điện
   topic=capacitor score=0.4498 type=hybrid
   Sau khi tích điện: * Ngắt nguồn điện. * Nối hai bản tụ qua điện trở hoặc bóng đèn. Khi đó: * Có dòng điện chạy qua điện trở. * Điện tích trên tụ giảm nhanh. Quá trình đó gọi là sự phóng điện của tụ điện. ---

### REAL_EVAL_PHY11_STANDING_WAVE_001

- Question: Điều kiện để có sóng dừng trên dây có hai đầu cố định là gì?
- Expected chunks: TH_PHY11_C02_L13_009
- Retrieved top chunks: TH_PHY11_C02_L13_009, TH_PHY11_C02_L13_010, TH_PHY11_C02_L13_019, TH_PHY11_C02_L13_020, TH_PHY11_C02_L13_017, TH_PHY11_C02_L13_005, TH_PHY11_C02_L13_004, TH_PHY11_C02_L13_008, TH_PHY11_C02_L13_011, TH_PHY11_C02_L13_001
- Gold rank: 1
- Error types: context_ok_answer_failed, formula_error
- Rule score: 0.6667
- Numeric correct: N/A
- Concept coverage: 0.6667
- LLM judge score: 5.0000
- Hallucination: false
- Recommendation: Use a calculation-oriented answer prompt: formula from context, substitution, calculation, unit, then final answer.

Expected answer/concepts:

```json
{
  "type": "conceptual",
  "reference_answer": "Với dây có hai đầu cố định, chiều dài dây phải bằng một số nguyên lần nửa bước sóng: L = nλ/2.",
  "required_concepts": [
    {
      "label": "hai đầu cố định",
      "anyOf": [
        "hai đầu cố định"
      ]
    },
    {
      "label": "số nguyên lần nửa bước sóng",
      "anyOf": [
        "số nguyên lần nửa bước sóng",
        "nguyên lần nửa bước sóng"
      ]
    },
    {
      "label": "L = nλ/2",
      "anyOf": [
        "L = nλ/2",
        "L=nλ/2",
        "L = n lambda/2"
      ]
    }
  ]
}
```

Generated answer:

```text
Điều kiện để có sóng dừng trên một sợi dây có hai đầu cố định là chiều dài của sợi dây phải bằng một số nguyên lần nửa bước sóng như Hình 13.3. $$ L=n\frac{\lambda}{2} $$ với: $$ n=1,2,3,... $$ [ \tag{13.1} ] --- Nguồn tham chiếu gần nhất: 2.2. Điều kiện để có sóng dừng. Câu trả lời được rút từ theory chunk liên quan nhất.
```

Retrieved chunks:

1. TH_PHY11_C02_L13_009 - 2.2. Điều kiện để có sóng dừng
   topic=standing_wave score=0.6950 type=hybrid
   Điều kiện để có sóng dừng trên một sợi dây có hai đầu cố định là chiều dài của sợi dây phải bằng một số nguyên lần nửa bước sóng như Hình 13.3. $$ L=n\frac{\lambda}{2} $$ với: $$ n=1,2,3,... $$ [ \tag{13.1} ] ---
2. TH_PHY11_C02_L13_010 - Hình 13.3
   topic=standing_wave score=0.6246 type=hybrid
   ![Hình 13.3 - Sóng dừng trên dây hai đầu cố định](assets/images/hinh-13-3.png) **Nội dung hình** * Sóng dừng trên dây hai đầu cố định. * Các nút sóng. * Các bụng sóng. * Chiều dài dây (L). * Bước sóng (\lambda). ---
3. TH_PHY11_C02_L13_019 - Hình 13.6
   topic=standing_wave score=0.6196 type=hybrid
   ![Hình 13.6 - Sóng dừng trên dây hai đầu cố định](assets/images/hinh-13-6.png) **Nội dung hình** Sóng dừng trên dây hai đầu cố định. ---
4. TH_PHY11_C02_L13_020 - Câu hỏi
   topic=standing_wave score=0.5944 type=hybrid
   > Tìm điều kiện để có sóng dừng trong cột không khí một đầu cố định, một đầu tự do như Hình 13.7. ---
5. TH_PHY11_C02_L13_017 - Câu 1
   topic=standing_wave score=0.5269 type=hybrid
   Một dây đàn hồi dài: $$ 0,6m $$ hai đầu cố định dao động với một bụng sóng. a. Tính bước sóng (\lambda) của sóng trên dây. b. Nếu dây dao động với 3 bụng sóng thì bước sóng là bao nhiêu? ---
6. TH_PHY11_C02_L13_005 - Câu hỏi
   topic=standing_wave score=0.5062 type=hybrid
   > Từ kết quả thí nghiệm rút ra điều kiện để có sóng dừng. ---
7. TH_PHY11_C02_L13_004 - Hình 13.1
   topic=standing_wave score=0.4667 type=hybrid
   ![Hình 13.1 - Bộ thí nghiệm tạo sóng dừng trên sợi dây](assets/images/hinh-13-1.png) **Nội dung hình** * Giá thí nghiệm. * Dây đàn hồi (PQ). * Bộ rung. * Máy phát âm tần. * Bố trí tạo sóng dừng trên sợi dây. ---
8. TH_PHY11_C02_L13_008 - Câu hỏi
   topic=standing_wave score=0.4621 type=hybrid
   > Hãy xác định số nút và số bụng của sóng dừng trên sợi dây Hình 13.3. ---
9. TH_PHY11_C02_L13_011 - Câu hỏi
   topic=standing_wave score=0.4605 type=hybrid
   > Hãy giải thích sự tạo thành sóng dừng trên dây (PQ) ở thí nghiệm Hình 13.1. ---
10. TH_PHY11_C02_L13_001 - Bài 13: Sóng dừng
   topic=standing_wave score=0.4371 type=hybrid
   > Khi vỗ tay đều trước miệng các ống của đàn Klông pút có độ dài khác nhau như hình bên, thì thấy âm phát ra ở các miệng ống trầm bổng khác nhau. > > Sóng âm lan truyền trong mỗi ống không phải là sóng chạy. > > Vậy đó là loại sóng gì và có những đặc điểm nào? ---

