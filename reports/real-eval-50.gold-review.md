# Real Eval 50 Gold Label Review

- Run time: 2026-07-02T12:42:05.542Z
- Diagnostics: `D:\LearnSimulator\C2-App-107\src\backend\reports\real-eval-50-retrieval-diagnostics-20260702T120343.json`
- Preview file: `D:\LearnSimulator\data\eval\real-eval-50.preview.json`
- Mode: auto-suggest only; no decision has been applied.

## Summary

| Metric | Count |
| --- | ---: |
| Review cases | 30 |
| Fail Hit@5 | 3 |
| Possible bad gold label | 30 |
| Gold not in top10 | 1 |
| Formula low rank | 6 |

## Cases

### REAL_EVAL50_MATH_007

- Subject/grade/type: math / 10 / formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Giải.
- Current expected chunks: GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S018_P01
- Best gold rank: not in top10
- Error classification: gold_not_in_top10, possible_bad_gold_label
- Gold label flags: expected_chunk_missing_question_keywords
- Recommendation: rewrite_question
- Human decision: _empty_

Current expected chunk excerpt:

```text
Giả sử cửa hàng cần nhập số máy điều hoà hai chiều là $x$ và số máy điều hoà một chiều là $y$. Khi đó ta có: $$ x \ge 0,\quad y \ge 0. $$ Vì nhu cầu của thị trường không quá 100 máy nên: $$ x + y \le 100. $$ Số tiền để nhập hai loại máy điều hoà với số lượng như trên là: $$ 20x + 10y $$ triệu đồng. Số tiền tối đa để đầu tư cho hai loại máy là 1,2 tỉ đồng, nên ta có: $$ 20x + 10y \le 1200 $$ hay: $$ 2x + y \le 120. $$ Từ đó ta thu được hệ bất phương trình bậc nhất hai ẩn sau: $$ \begin{cases} x \ge 0,\ y \ge 0,\ x + y \le 100,\ 2x + y \le 120. \end{cases} $$ Lợi nhuận thu được khi bán $x$ máy điều hoà hai chiều và $y$ máy điều hoà một chiều là: $$ F(x; y) = 3{,}5x + 2y. $$ Ta cần tìm giá trị lớn nhất của $F(x; y)$ khi $(x; y)$ thoả mãn hệ bất phương trình trên. ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S012_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Giải | 0.4048 | **Bước 1.** Xác định miền nghiệm $D_1$ của bất phương trình: $$ 7x + 4y \le 2400 $$ và gạch bỏ miền còn lại. Vẽ đường thẳng: $$ d: 7x + 4y = 2400. $$ Vì: $$ 7 \cdot 0 + 4 \cdot 0 = 0 < 2400 $$ nên toạ độ điểm $O(0; 0)$ thoả mãn bất phương trình: $$ 7x + 4y... |
| 2 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S016_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Nhận xét | 0.3911 | Tổng quát, người ta chứng minh được rằng giá trị lớn nhất hoặc nhỏ nhất của biểu thức: $$ F(x; y) = ax + by $$ với $(x; y)$ là toạ độ các điểm thuộc miền đa giác $A_1A_2...A_n$, tức là các điểm nằm bên trong hay nằm trên các cạnh của đa giác, đạt được tại m... |
| 3 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S013_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Cách xác định miền nghiệm của một hệ bất phương trình bậc nhất hai ẩn | 0.3892 | Trên cùng một mặt phẳng toạ độ, xác định miền nghiệm của mỗi bất phương trình bậc nhất hai ẩn trong hệ và gạch bỏ miền còn lại. Miền không bị gạch là miền nghiệm của hệ bất phương trình đã cho. > **Chú ý** > Nếu trong HĐ2, hệ được thay bởi: > > $$ > \begin{... |
| 4 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S010_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Kiến thức | 0.3776 | Trong mặt phẳng toạ độ, tập hợp các điểm có toạ độ là nghiệm của hệ bất phương trình bậc nhất hai ẩn là **miền nghiệm** của hệ bất phương trình đó. Miền nghiệm của hệ là giao các miền nghiệm của các bất phương trình trong hệ. --- |
| 5 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S015_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | HĐ3 | 0.3744 | Xét biểu thức: $$ F(x; y) = 2x + 3y $$ với $(x; y)$ thuộc miền tam giác $OAB$ ở HĐ2. Toạ độ ba đỉnh là: $$ O(0; 0),\quad A(150; 0),\quad B(0; 150). $$ a) Tính giá trị của biểu thức $F(x; y)$ tại mỗi đỉnh $O$, $A$ và $B$. b) Nêu nhận xét về dấu của hoành độ... |
| 6 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S005_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Kiến thức | 0.3708 | Như vậy, $x$ và $y$ trong HĐ1 phải thoả mãn một số bất phương trình bậc nhất hai ẩn. **Hệ bất phương trình bậc nhất hai ẩn** là một hệ gồm hai hay nhiều bất phương trình bậc nhất hai ẩn. Cặp số $(x_0; y_0)$ là nghiệm của một hệ bất phương trình bậc nhất hai... |
| 7 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S002_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Kiến thức, kĩ năng | 0.3656 | Sau bài học này, em có thể: * Nhận biết hệ bất phương trình bậc nhất hai ẩn. * Biết biểu diễn miền nghiệm của hệ bất phương trình bậc nhất hai ẩn trên mặt phẳng toạ độ. * Vận dụng kiến thức hệ bất phương trình bậc nhất hai ẩn vào giải quyết bài toán thực ti... |
| 8 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S007_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Giải | 0.3641 | a) Hệ bất phương trình đã cho là một hệ bất phương trình bậc nhất hai ẩn $x$ và $y$. b) Cặp số $(x; y) = (0; 0)$ thoả mãn cả ba bất phương trình của hệ nên nó là một nghiệm của hệ bất phương trình bậc nhất hai ẩn đã cho. --- |
| 9 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S019_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Bước 1 | 0.3553 | Xác định miền nghiệm của hệ bất phương trình trên. Miền nghiệm là miền tứ giác $OABC$ với toạ độ các đỉnh: $$ O(0; 0),\quad A(0; 100),\quad B(20; 80),\quad C(60; 0). $$ ![Miền nghiệm của hệ bất phương trình trong bài toán kinh doanh điều hoà](images/h2_7.pn... |
| 10 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S022_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Vận dụng | 0.3419 | Một cửa hàng có kế hoạch nhập về hai loại máy tính $A$ và $B$, giá mỗi chiếc lần lượt là 10 triệu đồng và 20 triệu đồng với số vốn ban đầu không vượt quá 4 tỉ đồng. Loại máy $A$ mang lại lợi nhuận 2,5 triệu đồng cho mỗi máy bán được và loại máy $B$ mang lại... |

### REAL_EVAL_PHY11_SHM_EQUATION_001

- Subject/grade/type: physics / 11 / formula
- Question: Trong phương trình dao động điều hòa x = A cos(ωt + φ), x, A, ω và φ có ý nghĩa gì?
- Current expected chunks: TH_PHY11_C01_L01_006
- Best gold rank: 6
- Error classification: gold_low_rank, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: add_candidate_as_additional_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Đồ thị hình sin có thể được biểu diễn bằng hàm sin hoặc hàm cosin. Ta chọn hàm cosin: $$ x=A\cos(\omega t+\varphi) \tag{1.1} $$ Đây được gọi là **phương trình của dao động điều hòa**. Trong phương trình: * $x$ là li độ của vật tại thời điểm $t$. * $A$ là biên độ dao động. * $\omega$ là tần số góc. * $\omega t+\varphi$ là pha của dao động tại thời điểm $t$. * $\varphi$ là pha ban đầu. Dao động được mô tả bằng phương trình: $$ x=A\cos(\omega t+\varphi) $$ được gọi là dao động điều hòa. Vật đang thực hiện dao động điều hòa được gọi là vật dao động điều hòa. ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | th_shm_002 | physics | 11 | dao_dong | N/A | Phương trình dao động điều hòa | 0.7693 | Phương trình dao động điều hòa thường có dạng x = A cos(ωt + φ), trong đó A là biên độ, ω là tần số góc và φ là pha ban đầu. |
| 2 | TH_PHY11_C01_L01_017 | physics | 11 | oscillation | PHY11_C01_L01_bai-1-dao-dong-dieu-hoa | 5. Em đã học | 0.6957 | > Dao động cơ là chuyển động qua lại của vật quanh vị trí cân bằng. > Dao động tuần hoàn là dao động trong đó, sau những khoảng thời gian bằng nhau, vật trở lại vị trí cũ theo hướng cũ. > Dao động điều hòa là dao động trong đó li độ của vật là một hàm cosin... |
| 3 | TH_PHY11_C01_L02_008 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | 2.1. Pha ban đầu | 0.6843 | Hình 2.2 là đồ thị của hai vật dao động điều hòa cùng chu kì, cùng biên độ nhưng dao động 1 luôn đạt tới giá trị cực đại sớm hơn dao động 2 một thời gian là: $$ \frac{T}{4} $$ Từ đồ thị ta thấy: * Tại thời điểm ban đầu ((t=0)), vật dao động điều hòa 1 đang... |
| 4 | TH_PHY11_C01_L04_003 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Giải | 0.6709 | So sánh phương trình dao động của vật với phương trình dạng cơ bản: $$ x=A\cos(\omega t+\varphi) $$ Ta có: * Biên độ: $$ A=5cm $$ * Tần số: $$ f=\frac{\omega}{2\pi} =\frac{10\pi}{2\pi} =5Hz $$ * Pha ban đầu: $$ \varphi=\frac{\pi}{6} \quad(rad) $$ * Li độ lú... |
| 5 | TH_PHY11_C01_L02_005 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | Hình 2.1 | 0.6639 | ![Hình 2.1 - Đồ thị dao động điều hòa](assets/images/hinh-2-1.png) **Mô tả sơ bộ** * Đồ thị hình sin. * Trục tung: (x(m)), từ (-0,2) đến (0,2). * Đỉnh tại: $$ x=0,2 $$ ứng với: $$ t=0,1s;\qquad t=0,5s $$ * Cực tiểu tại: $$ x=-0,2 $$ ứng với: $$ t=0,3s $$ *... |
| 6 | TH_PHY11_C01_L01_006 | physics | 11 | oscillation | PHY11_C01_L01_bai-1-dao-dong-dieu-hoa | 2.2. Phương trình của dao động điều hòa | 0.6473 | Đồ thị hình sin có thể được biểu diễn bằng hàm sin hoặc hàm cosin. Ta chọn hàm cosin: $$ x=A\cos(\omega t+\varphi) \tag{1.1} $$ Đây được gọi là **phương trình của dao động điều hòa**. Trong phương trình: * $x$ là li độ của vật tại thời điểm $t$. * $A$ là bi... |
| 7 | TH_PHY11_C01_L04_007 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Giải | 0.6345 | a. Tần số góc của dao động: $$ \omega=2\pi f=4\pi \quad(rad/s) $$ Khi: $$ t=0 $$ ta có: $$ x_0=A\cos\varphi=5cm $$ $$ v_0=-\omega A\sin\varphi=-30cm/s $$ Biên độ và pha ban đầu của dao động: $$ A=\sqrt{x^2+\frac{v^2}{\omega^2}} =\sqrt{5^2+\frac{(-30)^2}{(4\... |
| 8 | TH_PHY11_C01_L04_002 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Ví dụ 1 | 0.6226 | Cho phương trình của một vật dao động điều hòa: $$ x=5\cos\left(10\pi t+\frac{\pi}{6}\right) \quad(cm) $$ Xác định biên độ (A), tần số (f), pha ban đầu (\varphi), và li độ (x), tại thời điểm: $$ t_1=0,05s $$ --- |
| 9 | TH_PHY11_C01_L02_025 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | Hoạt động 1 | 0.6225 | Xét một vật dao động điều hòa có: * Biên độ: $$ A=10cm $$ * Tần số: $$ f=5Hz $$ Tại thời điểm ban đầu ((t=0)), vật có li độ cực đại theo chiều dương. Yêu cầu: * Xác định chu kì, tần số góc, pha ban đầu của dao động. * Viết phương trình và vẽ đồ thị ((x-t))... |
| 10 | TH_PHY11_C01_L04_014 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Bài 1 | 0.6090 | Một vật dao động điều hòa có phương trình là: $$ x=2\cos\left(4\pi t-\frac{\pi}{6}\right) \quad(cm) $$ Hãy cho biết: * Biên độ * Tần số góc * Chu kì * Tần số * Pha ban đầu * Pha của dao động ở thời điểm: $$ t=1s $$ --- |

### REAL_EVAL50_CHEM_013

- Subject/grade/type: chemistry / 11 / concept
- Question: Trình bày ý chính của mục Khái niệm.
- Current expected chunks: GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S003_P01
- Best gold rank: 8
- Error classification: gold_low_rank, possible_bad_gold_label
- Gold label flags: expected_chunk_missing_question_keywords, candidate_may_be_better_than_gold
- Recommendation: add_candidate_as_additional_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Nhiều carboxylic acid tồn tại trong tự nhiên. Ví dụ: | Công thức | Tên | Nguồn gốc | |---|---|---| | HCOOH | formic acid | có trong nọc kiến | | CH₃COOH | acetic acid | có trong giấm | | CH₃CH₂CH₂COOH | butyric acid | có trong bơ | | HOOC–COOH | oxalic acid | có trong quả khế | **Carboxylic acid** là các hợp chất hữu cơ trong phân tử có nhóm **–COOH** liên kết với nguyên tử carbon trong gốc hydrocarbon, nhóm –COOH hoặc nguyên tử hydrogen. Nhóm chức: ```text –COOH ``` được gọi là **nhóm carboxyl**. Công thức của carboxylic acid đơn chức thường viết dưới dạng: ```text RCOOH ``` Ví dụ: ```text CH₃COOH CH₂=CHCOOH C₆H₅COOH ``` ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S001_P01 | chemistry | 11 | chemistry_chapter_06 | chemistry_g11_bai24_e642343b | MỤC TIÊU | 0.5001 | - Nêu được khái niệm carboxylic acid. - Viết được công thức cấu tạo và gọi tên một số acid theo danh pháp thay thế C₁–C₅ và một vài acid thường gặp theo tên thông thường. - Trình bày được đặc điểm cấu tạo và hình dạng phân tử acetic acid. - Nêu và giải thíc... |
| 2 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S017_P01 | chemistry | 11 | chemistry_chapter_06 | chemistry_g11_bai24_e642343b | Yêu cầu | 0.3707 | - Mô tả hiện tượng xảy ra. - Viết phương trình hóa học của các phản ứng. - Giải thích hiện tượng. --- Trong dung dịch nước, chỉ một phần nhỏ carboxylic acid phân li thành ion, vì vậy carboxylic acid là **acid yếu**. Carboxylic acid thể hiện đầy đủ tính chất... |
| 3 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S005_P01 | chemistry | 11 | chemistry_chapter_06 | chemistry_g11_bai24_e642343b | Chú ý | 0.3503 | - Mạch chính là mạch carbon dài nhất chứa nhóm –COOH. - Đánh số mạch chính bắt đầu từ carbon của nhóm –COOH. - Nếu mạch carbon có nhánh thì thêm vị trí và tên nhánh ở phía trước. Ví dụ: \| Công thức \| Tên \| \|---\|---\| \| CH₃–CH(CH₃)–COOH \| 2-methylpropanoic ac... |
| 4 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S018_P01 | chemistry | 11 | chemistry_chapter_06 | chemistry_g11_bai24_e642343b | Câu hỏi | 0.3430 | **4.** Viết phương trình hóa học phản ứng giữa acetic acid với các chất sau: a) Ca; b) Cu(OH)₂; c) CaO; d) K₂CO₃. **5.** a) Khi có cặn màu trắng, thành phần chính là CaCO₃, bám ở đáy ấm đun nước, vòi nước, thiết bị vệ sinh,... có thể dùng giấm để loại bỏ cá... |
| 5 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S022_P01 | chemistry | 11 | chemistry_chapter_06 | chemistry_g11_bai24_e642343b | Yêu cầu | 0.3346 | 1. Mô tả hiện tượng và viết phương trình phản ứng ester hóa. 2. Nêu vai trò của sulfuric acid trong thí nghiệm. --- |
| 6 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S014_P01 | chemistry | 11 | chemistry_chapter_06 | chemistry_g11_bai24_e642343b | Câu hỏi | 0.3139 | Nhận xét về khả năng phân li của carboxylic acid. Chúng là acid mạnh hay yếu và có các phản ứng đặc trưng nào? |
| 7 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S007_P01 | chemistry | 11 | chemistry_chapter_06 | chemistry_g11_bai24_e642343b | Câu hỏi | 0.3114 | **1.** Viết các công thức cấu tạo và gọi tên theo danh pháp thay thế của các acid có công thức C₄H₉COOH. **2.** Viết công thức cấu tạo của các carboxylic acid có tên gọi dưới đây: a) pentanoic acid; b) but-3-enoic acid; c) 2-methylbutanoic acid; d) 2,2-dime... |
| 8 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S003_P01 | chemistry | 11 | chemistry_chapter_06 | chemistry_g11_bai24_e642343b | 1. Khái niệm | 0.3041 | Nhiều carboxylic acid tồn tại trong tự nhiên. Ví dụ: \| Công thức \| Tên \| Nguồn gốc \| \|---\|---\|---\| \| HCOOH \| formic acid \| có trong nọc kiến \| \| CH₃COOH \| acetic acid \| có trong giấm \| \| CH₃CH₂CH₂COOH \| butyric acid \| có trong bơ \| \| HOOC–COOH \| oxalic acid... |
| 9 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S013_P01 | chemistry | 11 | chemistry_chapter_06 | chemistry_g11_bai24_e642343b | Bảng 24.3. Hằng số cân bằng của phương trình phân li một số carboxylic acid | 0.3037 | \| Carboxylic acid \| Hằng số cân bằng của phương trình phân li \| Phần trăm phân li trong dung dịch 0,1 M (%) \| \|---\|---:\|---:\| \| HCOOH \| 1,8 × 10⁻⁴ \| 4,2 \| \| CH₃COOH \| 1,8 × 10⁻⁵ \| 1,3 \| \| CH₃CH₂COOH \| 1,3 × 10⁻⁵ \| 1,2 \| \| CH₃CH₂CH₂COOH \| 1,5 × 10⁻⁵ \| 1,2 \| |
| 10 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S011_P01 | chemistry | 11 | chemistry_chapter_06 | chemistry_g11_bai24_e642343b | Bảng 24.2. Nhiệt độ sôi và tính tan của một số carboxylic acid | 0.2949 | \| Công thức \| Tên gọi \| Nhiệt độ nóng chảy (°C) \| Nhiệt độ sôi (°C) \| Độ tan trong nước ở 25 °C (g/100 g) \| \|---\|---\|---:\|---:\|---:\| \| HCOOH \| methanoic acid \| 8 \| 101 \| tan vô hạn \| \| CH₃COOH \| ethanoic acid \| 17 \| 118 \| tan vô hạn \| \| CH₃CH₂COOH \| propano... |

### REAL_EVAL50_CHEM_012

- Subject/grade/type: chemistry / 10 / formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Khái niệm tương tác van der Waals.
- Current expected chunks: GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S011_P01
- Best gold rank: 5
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Cùng là phân tử không phân cực, ở nhiệt độ phòng: - fluorine và chlorine là chất khí; - bromine là chất lỏng. Như vậy, ở trạng thái lỏng, giữa các phân tử bromine tồn tại một tương tác yếu. Tương tác yếu đó gọi là tương tác van der Waals. Các khí hiếm như neon, argon,... tồn tại dưới dạng các nguyên tử độc lập. Tuy nhiên, ở nhiệt độ thấp, khí hiếm có thể hoá lỏng. Như vậy, ở nhiệt độ thấp, giữa các nguyên tử khí hiếm tồn tại một tương tác yếu để giữ các nguyên tử khí hiếm lại với nhau trong trạng thái lỏng. Tương tác đó cũng là tương tác van der Waals. > **Tương tác van der Waals** là tương tác tĩnh điện lưỡng cực - lưỡng cực giữa các nguyên tử hay phân tử. ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S002_P01 | chemistry | 10 | chemistry_chapter_03 | chemistry_g10_bai13_e52c3adf | MỤC TIÊU | 0.6406 | - Trình bày được khái niệm liên kết hydrogen. - Vận dụng được khái niệm liên kết hydrogen để giải thích sự xuất hiện liên kết hydrogen với các nguyên tố có độ âm điện lớn như N, O, F. - Nêu được vai trò, ảnh hưởng của liên kết hydrogen tới tính chất vật lí... |
| 2 | GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S003_P01 | chemistry | 10 | chemistry_chapter_03 | chemistry_g10_bai13_e52c3adf | MỞ ĐẦU | 0.5652 | Ở áp suất khí quyển, nhiệt độ sôi của: - `H₂O` là `100 °C`. - `CH₄` là `−161,58 °C`. - `H₂S` là `−60,28 °C`. Vì sao các chất trên có nhiệt độ sôi khác nhau? Các tính chất vật lí của các chất có liên kết cộng hoá trị được quyết định bởi: - lực tương tác giữa... |
| 3 | GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S018_P01 | chemistry | 10 | chemistry_chapter_03 | chemistry_g10_bai13_e52c3adf | EM CÓ THỂ | 0.5606 | - So sánh được tính chất vật lí giữa các phân tử dựa vào liên kết hydrogen và tương tác van der Waals. ``` ```` |
| 4 | GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S012_P01 | chemistry | 10 | chemistry_chapter_03 | chemistry_g10_bai13_e52c3adf | Sự hình thành tương tác van der Waals | 0.5541 | Tương tác van der Waals thể hiện rõ ở các chất cộng hoá trị phân cực do chúng có cấu tạo lưỡng cực, một đầu mang một phần điện tích âm và một đầu mang một phần điện tích dương. Các nguyên tử khí hiếm hoặc các chất cộng hoá trị không phân cực, do đám mây ele... |
| 5 | GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S011_P01 | chemistry | 10 | chemistry_chapter_03 | chemistry_g10_bai13_e52c3adf | 1. Khái niệm tương tác van der Waals | 0.5353 | Cùng là phân tử không phân cực, ở nhiệt độ phòng: - fluorine và chlorine là chất khí; - bromine là chất lỏng. Như vậy, ở trạng thái lỏng, giữa các phân tử bromine tồn tại một tương tác yếu. Tương tác yếu đó gọi là tương tác van der Waals. Các khí hiếm như n... |
| 6 | GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S004_P01 | chemistry | 10 | chemistry_chapter_03 | chemistry_g10_bai13_e52c3adf | 1. Bản chất của liên kết hydrogen | 0.4671 | Các phân tử `HF`, `H₂O`, `NH₃` có chứa nguyên tử H và các nguyên tử phi kim có độ âm điện lớn: - F = 3,98. - O = 3,44. - N = 3,04. - H = 2,20. Sự chênh lệch độ âm điện lớn làm cho các liên kết phân cực. Cặp electron dùng chung trong liên kết cộng hoá trị bị... |
| 7 | GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S015_P01 | chemistry | 10 | chemistry_chapter_03 | chemistry_g10_bai13_e52c3adf | EM CÓ BIẾT | 0.4465 | Khi khối lượng phân tử tăng thì tương tác van der Waals tăng. Ví dụ: Tổng tương tác van der Waals giữa các phân tử polyethene lớn hơn rất nhiều so với giữa các phân tử ethene. Đó là lí do tại sao polyethene là một chất rắn ở điều kiện thường. --- |
| 8 | GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S017_P01 | chemistry | 10 | chemistry_chapter_03 | chemistry_g10_bai13_e52c3adf | EM ĐÃ HỌC | 0.4403 | - Liên kết hydrogen được hình thành giữa nguyên tử H đã liên kết với một nguyên tử có độ âm điện lớn với một nguyên tử khác có độ âm điện lớn còn cặp electron hoá trị chưa tham gia liên kết. - Liên kết hydrogen làm tăng nhiệt độ nóng chảy và nhiệt độ sôi củ... |
| 9 | GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S014_P01 | chemistry | 10 | chemistry_chapter_03 | chemistry_g10_bai13_e52c3adf | Ví dụ 2 | 0.4381 | Pentane là hydrocarbon no có công thức `C₅H₁₂`. Đồng phân mạch không phân nhánh pentane có nhiệt độ sôi `36 °C`, cao hơn so với đồng phân mạch nhánh neopentane có nhiệt độ sôi `9,5 °C`. Nguyên nhân là diện tích tiếp xúc giữa các phân tử pentane lớn hơn nhiề... |
| 10 | GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S008_P01 | chemistry | 10 | chemistry_chapter_03 | chemistry_g10_bai13_e52c3adf | Liên kết hydrogen ảnh hưởng đến tính chất của nước đá | 0.4335 | Nguyên tử O có 2 cặp electron chưa liên kết nên có thể tạo 2 liên kết hydrogen với 2 nguyên tử H của các phân tử nước khác. Hai nguyên tử H của phân tử nước đủ điều kiện để tạo liên kết hydrogen với 2 nguyên tử O của các phân tử nước khác. Như vậy, một phân... |

### REAL_EVAL50_MATH_010

- Subject/grade/type: math / 10 / formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Giải.
- Current expected chunks: GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S020_P01
- Best gold rank: 5
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: expected_chunk_missing_question_keywords
- Recommendation: rewrite_question
- Human decision: _empty_

Current expected chunk excerpt:

```text
**Bước 1.** Vẽ đường thẳng: $$ d: 5x - 7y = 0 $$ trên mặt phẳng toạ độ $Oxy$. **Bước 2.** Lấy điểm $M_0(0; 1)$ không thuộc $d$ và thay $x = 0$, $y = 1$ vào biểu thức $5x - 7y$, ta được: $$ 5 \cdot 0 - 7 \cdot 1 = -7 < 0. $$ Do đó miền nghiệm của bất phương trình là nửa mặt phẳng bờ $d$ chứa điểm $M_0$, miền không bị gạch. ![Miền nghiệm của bất phương trình 5x - 7y <= 0](images/h2_3.png) *Hình 2.3. Miền nghiệm của bất phương trình $5x - 7y \le 0$.* > **Chú ý** > Miền nghiệm của bất phương trình $ax + by < c$ là miền nghiệm của bất phương trình $ax + by \le c$ bỏ đi đường thẳng $ax + by = c$ và biểu diễn đường thẳng bằng nét đứt. ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S006_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Kiến thức | 0.4495 | Mỗi hệ thức liên hệ giữa $x$ và $y$ thu được trong HĐ1a và HĐ1b được gọi là một **bất phương trình bậc nhất hai ẩn**. Bất phương trình bậc nhất hai ẩn $x$, $y$ có dạng tổng quát là: $$ ax + by \le c $$ hoặc $$ ax + by \ge c,\quad ax + by < c,\quad ax + by >... |
| 2 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S005_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | HĐ1 | 0.3926 | Trong tình huống mở đầu, gọi $x$ là số vé loại 1 bán được và $y$ là số vé loại 2 bán được. Viết biểu thức tính số tiền bán vé thu được, đơn vị nghìn đồng, ở rạp chiếu phim đó theo $x$ và $y$. a) Các số nguyên không âm $x$ và $y$ phải thoả mãn điều kiện gì đ... |
| 3 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S023_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Giải | 0.3827 | Gọi $x$ là số lượng vé loại 1 bán được, $x \in \mathbb{N}$, và $y$ là số lượng vé loại 2 bán được, $y \in \mathbb{N}$. Số tiền bán vé thu được là: $$ 50x + 100y $$ nghìn đồng. Người ta sẽ phải bù lỗ trong trường hợp số tiền bán vé nhỏ hơn 20 triệu đồng, tức... |
| 4 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S027_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | 2.3 | 0.3821 | Ông An muốn thuê một chiếc ô tô có lái xe trong một tuần. Giá thuê xe được cho như bảng sau: \| Thời gian \| Phí cố định (nghìn đồng/ngày) \| Phí tính theo quãng đường di chuyển (nghìn đồng/kilômét) \| \| ---------------------- \| ----------------------------: \|... |
| 5 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S020_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Giải | 0.3818 | **Bước 1.** Vẽ đường thẳng: $$ d: 5x - 7y = 0 $$ trên mặt phẳng toạ độ $Oxy$. **Bước 2.** Lấy điểm $M_0(0; 1)$ không thuộc $d$ và thay $x = 0$, $y = 1$ vào biểu thức $5x - 7y$, ta được: $$ 5 \cdot 0 - 7 \cdot 1 = -7 < 0. $$ Do đó miền nghiệm của bất phương... |
| 6 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S017_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Giải | 0.3785 | Ta biểu diễn miền nghiệm của bất phương trình bậc nhất hai ẩn: $$ x + y \ge 100 $$ như sau: **Bước 1.** Vẽ đường thẳng: $$ d: x + y = 100 $$ trên mặt phẳng toạ độ $Oxy$. **Bước 2.** Lấy một điểm bất kì không thuộc $d$ trên mặt phẳng rồi thay vào biểu thức $... |
| 7 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S010_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Kiến thức | 0.3741 | Cặp số $(x_0; y_0)$ được gọi là một **nghiệm** của bất phương trình bậc nhất hai ẩn: $$ ax + by \le c $$ nếu bất đẳng thức: $$ ax_0 + by_0 \le c $$ đúng. --- |
| 8 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S018_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Cách biểu diễn miền nghiệm của bất phương trình bậc nhất hai ẩn | 0.3664 | Xét bất phương trình: $$ ax + by \le c. $$ Cách biểu diễn miền nghiệm: **Bước 1.** Vẽ đường thẳng: $$ d: ax + by = c $$ trên mặt phẳng toạ độ $Oxy$. **Bước 2.** Lấy một điểm $M_0(x_0; y_0)$ không thuộc $d$. **Bước 3.** Tính $ax_0 + by_0$ và so sánh với $c$.... |
| 9 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S015_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Kiến thức | 0.3662 | Trong mặt phẳng toạ độ $Oxy$, tập hợp các điểm có toạ độ là nghiệm của bất phương trình: $$ ax + by \le c $$ được gọi là **miền nghiệm** của bất phương trình đó. Người ta chứng minh được rằng đường thẳng $d$ có phương trình: $$ ax + by = c $$ chia mặt phẳng... |
| 10 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S001_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Giới thiệu chương | 0.3649 | Các bất phương trình bậc nhất hai ẩn và hệ bất phương trình bậc nhất hai ẩn xuất hiện trong nhiều bài toán kinh tế, như là những ràng buộc trong các bài toán sản xuất, bài toán phân phối hàng hoá,... Chương này cung cấp cách biểu diễn miền nghiệm của các bấ... |

### REAL_EVAL50_PHYS_002

- Subject/grade/type: physics / 12 / formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Độ phóng xạ.
- Current expected chunks: GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S023_P01
- Best gold rank: 4
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Để đặc trưng cho tính phóng xạ mạnh hay yếu của một lượng chất phóng xạ, người ta dùng đại lượng **độ phóng xạ**, hay **hoạt độ phóng xạ**, kí hiệu là: $$ H $$ Độ phóng xạ có giá trị bằng số hạt nhân phân rã trong một giây. Đơn vị độ phóng xạ là **becquerel**, kí hiệu là: $$ Bq $$ Ta có: $$ 1\text{ Bq}=1\text{ phân rã/s} $$ Trong thực tế, độ phóng xạ còn có đơn vị khác là **curie**, kí hiệu là: $$ Ci $$ Ta có: $$ 1\text{ Ci}=3{,}7\cdot10^{10}\text{ Bq} $$ Giá trị này xấp xỉ bằng độ phóng xạ của $1\text{ g}$ ${}^{226}Ra$. Độ phóng xạ có thể được đo nhờ các thiết bị đo phóng xạ. Vì số hạt nhân của một lượng chất phóng xạ giảm dần nên độ phóng xạ $H$ của chất phóng xạ cũng giảm theo thời gian. Xét một mẫu chất phóng xạ có $N_t$ hạt nhân tại thời điểm $t$. Tại thời điểm $t+\Delta t$, số hạt nhân đó giảm đi và trở thành: $$ N_t+\Delta N_t $$ với: $$ \Delta N_t<0 $$ Số hạt nhân đã phân rã t...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S044_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai23_e88f58e2 | 8. Em đã học | 0.5471 | > Phân rã phóng xạ có tính tự phát và ngẫu nhiên. > Tia phóng xạ là tia không nhìn thấy được, nhưng có các tính chất như: ion hóa, gây ra các hiệu ứng quang điện, phát xạ thứ cấp, làm đen kính ảnh, xuyên thấu lớp vật chất mỏng, phá hủy tế bào, kích thích mộ... |
| 2 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S039_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai23_e88f58e2 | Câu hỏi | 0.5232 | 1. Hãy tìm hiểu và nêu thêm nguyên tắc an toàn phóng xạ. Việc tuân thủ quy tắc an toàn phóng xạ có vai trò gì? 2. Trong y học và công nghiệp, nguồn phóng xạ và chất thải phóng xạ được bảo quản trong các thiết bị lưu trữ hoặc đặt trong các hầm cách li với cá... |
| 3 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S019_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai23_e88f58e2 | 3.1. Định luật phóng xạ | 0.5071 | Các quá trình phân rã phóng xạ đã nêu ở trên là quá trình ngẫu nhiên. Mặc dù với một hạt nhân phóng xạ cho trước, thời điểm phân rã của nó là không xác định, nhưng khi xét một mẫu chất phóng xạ gồm số lượng rất lớn các hạt nhân phóng xạ thì ta có thể khảo s... |
| 4 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S023_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai23_e88f58e2 | 3.2. Độ phóng xạ | 0.5008 | Để đặc trưng cho tính phóng xạ mạnh hay yếu của một lượng chất phóng xạ, người ta dùng đại lượng **độ phóng xạ**, hay **hoạt độ phóng xạ**, kí hiệu là: $$ H $$ Độ phóng xạ có giá trị bằng số hạt nhân phân rã trong một giây. Đơn vị độ phóng xạ là **becquerel... |
| 5 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S028_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai23_e88f58e2 | Hình 23.7 | 0.4896 | ![Hình 23.7 - Cà chua đột biến do phơi nhiễm phóng xạ](assets/images/hinh-23-7.png) **Nội dung hình** Hình minh họa quả cà chua bị đột biến khi phơi nhiễm phóng xạ, có hình dạng không bình thường. --- Trong một số trường hợp, với nguồn phóng xạ mạnh, dù chỉ... |
| 6 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S017_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai23_e88f58e2 | Câu hỏi | 0.4837 | 1. Hãy nêu các tính chất của phóng xạ $\gamma$. 2. Technetium $(Tc)$ là đồng vị phóng xạ $\gamma$, được sử dụng rất phổ biến trong y học hạt nhân để chụp ảnh cơ quan bên trong cơ thể người. Viết phương trình phân rã của đồng vị này. --- |
| 7 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S003_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai23_e88f58e2 | Hình 23.1 | 0.4819 | ![Hình 23.1 - Các vết sương dạng tia quanh mẫu quặng uranium](assets/images/hinh-23-1.png) **Nội dung hình** Hình biểu diễn các vết sương dạng tia xuất hiện quanh mẫu quặng uranium trong buồng sương. Các tia này cho thấy đường đi của các hạt phóng xạ phát r... |
| 8 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S014_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai23_e88f58e2 | 2.2. Phóng xạ beta | 0.4732 | Phóng xạ $\beta$ gồm hai loại: * Phóng xạ $\beta^-$. * Phóng xạ $\beta^+$. Hai loại tia phóng xạ $\beta^-$ và $\beta^+$ có bản chất tương ứng là: * Hạt electron: $$ {}^0_{-1}e $$ * Hạt positron: $$ {}^0_{+1}e $$ Các hạt này được phóng ra từ hạt nhân mẹ với... |
| 9 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S043_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai23_e88f58e2 | 7.2. Nguyên tắc an toàn định lượng | 0.4494 | Liều hấp thụ phóng xạ hiệu dụng $D_{hd}$ cho con người được tính bởi hệ thức: $$ D_{hd}=DW $$ Trong đó: * $D$ là liều hấp thụ phóng xạ, tức năng lượng hấp thụ phóng xạ trên mỗi kilôgam của vật. * Đơn vị của $D$ là: $$ J/kg $$ và được gọi là **gray**, kí hiệ... |
| 10 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S033_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai23_e88f58e2 | 6. Nguyên tắc an toàn phóng xạ | 0.4427 | Ngoài các nguồn phóng xạ được kiểm soát trong nghiên cứu và ứng dụng, con người còn có nguy cơ bị nhiễm phóng xạ thụ động từ: * Phóng xạ có sẵn trong không khí, ví dụ ${}^{222}Rn$. * Tia vũ trụ, ví dụ ${}^{14}C$. * Đá và vật liệu xây dựng có chứa đồng vị ph... |

### REAL_EVAL50_PHYS_014

- Subject/grade/type: physics / 12 / formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục a) Thang nhiệt độ Celsius.
- Current expected chunks: GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S010_P01
- Best gold rank: 4
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Thang nhiệt độ chúng ta vẫn dùng hằng ngày là **thang Celsius**. Hai nhiệt độ dùng làm mốc của thang này là: * Nhiệt độ đóng băng của nước tinh khiết. * Nhiệt độ sôi của nước tinh khiết. Các mốc nhiệt độ này được xác định ở áp suất tiêu chuẩn. Khoảng cách giữa hai nhiệt độ này được chia thành $100$ phần bằng nhau, mỗi phần là $1$ độ. Vì được chia thành $100$ phần bằng nhau nên ban đầu thang nhiệt độ này được gọi là **thang nhiệt độ bách phân**. Năm 1948, Hội đồng quốc tế về trọng lượng và đo lường đã quyết định công nhận thang nhiệt độ này và đổi tên nó thành **thang nhiệt độ Celsius** để vinh danh nhà khoa học Thụy Điển **Anders Celsius** (An-đơ Xen-si-út) (1701–1774), người đầu tiên xây dựng thang nhiệt độ này vào năm 1742. Nhiệt độ trong thang Celsius thường được kí hiệu bằng chữ: $$ t $$ Đơn vị là độ Celsius, kí hiệu: $$ ^\circ C $$ Các nhiệt độ: * Cao hơn $0^\circ C$ có giá trị d...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S025_P01 | physics | 12 | physics_chapter_01 | physics_g12_bai03_df06bfb6 | Em đã học | 0.5492 | > Nhiệt độ cho biết trạng thái cân bằng nhiệt của các vật tiếp xúc nhau và chiều truyền nhiệt năng. * Khi hai vật có nhiệt độ khác nhau tiếp xúc nhau thì nhiệt năng truyền từ vật có nhiệt độ cao sang vật có nhiệt độ thấp. * Khi hai vật có nhiệt độ bằng nhau... |
| 2 | GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S013_P01 | physics | 12 | physics_chapter_01 | physics_g12_bai03_df06bfb6 | Hình 3.3 | 0.5371 | ![Hình 3.3 - Nhiệt độ của một số sự vật, hiện tượng, quá trình](assets/images/hinh-3-3.png) **Nội dung hình** Hình giới thiệu nhiệt độ của một số sự vật, hiện tượng và quá trình trong tự nhiên, đời sống và kĩ thuật. Một số ví dụ được biểu diễn trong hình: *... |
| 3 | GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S011_P01 | physics | 12 | physics_chapter_01 | physics_g12_bai03_df06bfb6 | b) Thang nhiệt độ Kelvin | 0.5171 | Năm 1848, nhà vật lí người Ireland là **William Thomson** (Wi-li-am Tôm-son), Nam tước Kelvin thứ nhất (1824–1907), đề xuất một thang nhiệt độ trong đó mọi nhiệt độ đều có giá trị dương. Hai nhiệt độ được dùng làm mốc là: --- ##### Mốc 1: Độ không tuyệt đối... |
| 4 | GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S010_P01 | physics | 12 | physics_chapter_01 | physics_g12_bai03_df06bfb6 | a) Thang nhiệt độ Celsius | 0.5122 | Thang nhiệt độ chúng ta vẫn dùng hằng ngày là **thang Celsius**. Hai nhiệt độ dùng làm mốc của thang này là: * Nhiệt độ đóng băng của nước tinh khiết. * Nhiệt độ sôi của nước tinh khiết. Các mốc nhiệt độ này được xác định ở áp suất tiêu chuẩn. Khoảng cách g... |
| 5 | GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S014_P01 | physics | 12 | physics_chapter_01 | physics_g12_bai03_df06bfb6 | Câu hỏi | 0.5056 | 1. Nhiệt độ không tuyệt đối là nhiệt độ nào trong hai thang nhiệt độ Celsius và Kelvin? 2. Nêu ý nghĩa của nhiệt độ không tuyệt đối. 3. Hãy dựa vào bảng so sánh hai thang nhiệt độ Celsius và Kelvin ở Hình 3.2 để chứng minh rằng mỗi độ chia $(1^\circ C)$ tro... |
| 6 | GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S026_P01 | physics | 12 | physics_chapter_01 | physics_g12_bai03_df06bfb6 | Em có thể | 0.4992 | > Giải thích được các hiện tượng truyền nhiệt năng thường gặp trong đời sống. > Phân biệt được hai thang nhiệt độ Celsius và Kelvin. > Chuyển đổi được nhiệt độ từ thang Celsius sang thang Kelvin và ngược lại. |
| 7 | GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S016_P01 | physics | 12 | physics_chapter_01 | physics_g12_bai03_df06bfb6 | Câu hỏi | 0.4908 | 1. Chuyển đổi nhiệt độ: a) Từ thang Celsius sang thang Kelvin: * $270^\circ C$ * $-270^\circ C$ * $500^\circ C$ b) Từ thang Kelvin sang thang Celsius: * $0\text{ K}$ * $500\text{ K}$ * $1000\text{ K}$ 2. Một vật được làm lạnh từ: $$ 100^\circ C $$ xuống: $$... |
| 8 | GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S012_P01 | physics | 12 | physics_chapter_01 | physics_g12_bai03_df06bfb6 | Hình 3.2 | 0.4778 | ![Hình 3.2 - Các nhiệt độ mốc trong thang nhiệt độ Celsius và Kelvin](assets/images/hinh-3-2.png) **Nội dung hình** Hình biểu diễn các nhiệt độ mốc trong hai thang nhiệt độ Celsius và Kelvin: * Điểm sôi của nước: $$ 100^\circ C = 373{,}15\text{ K} $$ * Điểm... |
| 9 | GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S019_P01 | physics | 12 | physics_chapter_01 | physics_g12_bai03_df06bfb6 | 2. Nhiệt kế | 0.4697 | Nhiệt kế là thiết bị dùng để đo nhiệt độ. Nhiệt kế được chế tạo dựa trên một số tính chất vật lí phụ thuộc vào nhiệt độ của các chất, vật liệu, linh kiện điện và điện tử,... Tính chất vật lí được sử dụng phổ biến nhất để chế tạo nhiệt kế là **sự nở vì nhiệt... |
| 10 | GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S015_P01 | physics | 12 | physics_chapter_01 | physics_g12_bai03_df06bfb6 | Lưu ý | 0.4652 | Trong thực tế, người ta thường làm tròn các công thức chuyển đổi nhiệt độ như sau: $$ t(^\circ C)=T(K)-273 \tag{1} $$ $$ T(K)=t(^\circ C)+273 \tag{2} $$ --- |

### REAL_EVAL_PHY11_SHM_VELOCITY_001

- Subject/grade/type: physics / 11 / formula
- Question: Từ x = A cos(ωt + φ), hãy viết phương trình vận tốc của vật dao động điều hòa.
- Current expected chunks: TH_PHY11_C01_L03_004
- Best gold rank: 2
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Khi học phép tính đạo hàm, chúng ta sẽ biết: $$ v=\frac{\Delta x}{\Delta t} $$ (với (\Delta t) rất nhỏ) chính là đạo hàm của li độ (x) theo thời gian, kí hiệu là (x'). Ta có: $$ x=A\cos(\omega t+\varphi) $$ Suy ra: $$ v=x' =-\omega A\sin(\omega t+\varphi) \tag{3.1} $$ Công thức (3.1) là phương trình của vận tốc. Có thể biến đổi như sau: $$ v=\pm \omega A\sqrt{1-\cos^2(\omega t+\varphi)} $$ Thay: $$ x=A\cos(\omega t+\varphi) $$ vào ta được: $$ v=\pm \omega\sqrt{A^2-x^2} \tag{3.2} $$ Từ công thức trên: * Khi vật ở vị trí cân bằng: $$ v=\pm \omega A $$ * Khi vật ở vị trí biên: $$ v=0 $$ ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | TH_PHY11_C01_L03_011 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | 2.1. Phương trình gia tốc | 0.6674 | Như vậy, gia tốc tức thời của một vật là đạo hàm của vận tốc theo thời gian, kí hiệu là: $$ v' $$ Ta có: $$ a=v' =-\omega^2A\cos(\omega t+\varphi) \tag{3.3} $$ Công thức (3.3) là phương trình của gia tốc. Thay: $$ x=A\cos(\omega t+\varphi) $$ vào (3.3) ta đ... |
| 2 | TH_PHY11_C01_L03_004 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | 1.1. Phương trình của vận tốc | 0.6653 | Khi học phép tính đạo hàm, chúng ta sẽ biết: $$ v=\frac{\Delta x}{\Delta t} $$ (với (\Delta t) rất nhỏ) chính là đạo hàm của li độ (x) theo thời gian, kí hiệu là (x'). Ta có: $$ x=A\cos(\omega t+\varphi) $$ Suy ra: $$ v=x' =-\omega A\sin(\omega t+\varphi) \... |
| 3 | TH_PHY11_C01_L03_021 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | Em đã học | 0.6632 | > Phương trình của vận tốc và gia tốc của một vật dao động điều hòa có li độ: $$ x=A\cos(\omega t+\varphi) $$ là: $$ v=-\omega A\sin(\omega t+\varphi) $$ $$ a=-\omega^2A\cos(\omega t+\varphi) $$ > Đồ thị của vận tốc, gia tốc theo thời gian là đường hình sin... |
| 4 | TH_PHY11_C01_L04_011 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Ví dụ 3 | 0.6421 | Một vật dao động điều hòa với tần số góc: $$ \omega=1rad/s $$ có đồ thị của li độ (x), vận tốc (v) và gia tốc (a) theo thời gian (t) được mô tả trên Hình 4.1. --- |
| 5 | TH_PHY11_C01_L04_006 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Ví dụ 2 | 0.6262 | Một vật dao động điều hòa với tần số: $$ f=2Hz $$ Tại thời điểm ban đầu vật có li độ: $$ x=5cm $$ và vận tốc: $$ v=-30cm/s $$ Xác định: a. Biên độ và pha ban đầu của dao động. b. Giá trị cực đại của vận tốc và gia tốc của vật khi dao động. --- |
| 6 | TH_PHY11_C01_L03_015 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | Hoạt động 2 | 0.5879 | Phương trình dao động của một vật là: $$ x=5\cos(4\pi t) \quad(cm) $$ Hãy: * Viết phương trình vận tốc. * Viết phương trình gia tốc. * Vẽ đồ thị li độ, vận tốc, gia tốc theo thời gian của vật. --- |
| 7 | TH_PHY11_C01_L03_002 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | 1. Vận tốc của vật dao động điều hòa | 0.5782 | Như đã biết, vận tốc tức thời của một vật được xác định bằng công thức: $$ v=\frac{\Delta x}{\Delta t} $$ (với (\Delta t) rất nhỏ), tức là bằng độ dốc của đồ thị ((x-t)) tại điểm đang xét. Để đơn giản, ta hãy xét một vật dao động điều hòa có đồ thị ((x-t))... |
| 8 | TH_PHY11_C01_L03_006 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | Hình 3.2 | 0.5469 | ![Hình 3.2 - Đồ thị (v-t) của một vật dao động điều hòa](assets/images/hinh-3-2.png) **Nội dung hình** * Đồ thị vận tốc theo thời gian. * Pha ban đầu: $$ \varphi = 0 $$ --- |
| 9 | TH_PHY11_C03_L18_017 | physics | 11 | electric_field | PHY11_C03_L18_bai-18-dien-truong-deu | Giải | 0.5434 | Chọn gốc tọa độ $O$ tại điểm electron bắt đầu bay vào điện trường đều. Trục $Ox$ có hướng trùng với vectơ vận tốc ban đầu. Trục $Oy$ hướng thẳng đứng lên trên. Đổi đơn vị: $$ d=24\ cm=24 \times 10^{-2}\ m=0{,}24\ m $$ Độ lớn cường độ điện trường giữa hai bả... |
| 10 | TH_PHY11_C01_L03_010 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | 2. Gia tốc của vật dao động điều hòa | 0.5427 | Tương tự như vận tốc, gia tốc tức thời của một vật được xác định bằng công thức: $$ a=\frac{\Delta v}{\Delta t} $$ (với (\Delta t) rất nhỏ), tức là bằng độ dốc của đồ thị vận tốc tại điểm đang xét. Ta nhận thấy độ dốc của đồ thị Hình 3.2, hay gia tốc của vậ... |

### REAL_EVAL_PHY11_SHM_ACCELERATION_001

- Subject/grade/type: physics / 11 / formula
- Question: Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào?
- Current expected chunks: TH_PHY11_C01_L03_011
- Best gold rank: 3
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Như vậy, gia tốc tức thời của một vật là đạo hàm của vận tốc theo thời gian, kí hiệu là: $$ v' $$ Ta có: $$ a=v' =-\omega^2A\cos(\omega t+\varphi) \tag{3.3} $$ Công thức (3.3) là phương trình của gia tốc. Thay: $$ x=A\cos(\omega t+\varphi) $$ vào (3.3) ta được: $$ a=-\omega^2x \tag{3.4} $$ Từ công thức (3.4) ta thấy: * Khi vật ở vị trí cân bằng: $$ a=0 $$ * Khi vật ở vị trí biên: $$ a=\pm\omega^2A $$ ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | TH_PHY11_C01_L03_021 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | Em đã học | 0.6940 | > Phương trình của vận tốc và gia tốc của một vật dao động điều hòa có li độ: $$ x=A\cos(\omega t+\varphi) $$ là: $$ v=-\omega A\sin(\omega t+\varphi) $$ $$ a=-\omega^2A\cos(\omega t+\varphi) $$ > Đồ thị của vận tốc, gia tốc theo thời gian là đường hình sin... |
| 2 | TH_PHY11_C01_L03_010 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | 2. Gia tốc của vật dao động điều hòa | 0.6345 | Tương tự như vận tốc, gia tốc tức thời của một vật được xác định bằng công thức: $$ a=\frac{\Delta v}{\Delta t} $$ (với (\Delta t) rất nhỏ), tức là bằng độ dốc của đồ thị vận tốc tại điểm đang xét. Ta nhận thấy độ dốc của đồ thị Hình 3.2, hay gia tốc của vậ... |
| 3 | TH_PHY11_C01_L03_011 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | 2.1. Phương trình gia tốc | 0.6275 | Như vậy, gia tốc tức thời của một vật là đạo hàm của vận tốc theo thời gian, kí hiệu là: $$ v' $$ Ta có: $$ a=v' =-\omega^2A\cos(\omega t+\varphi) \tag{3.3} $$ Công thức (3.3) là phương trình của gia tốc. Thay: $$ x=A\cos(\omega t+\varphi) $$ vào (3.3) ta đ... |
| 4 | TH_PHY11_C01_L04_011 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Ví dụ 3 | 0.6049 | Một vật dao động điều hòa với tần số góc: $$ \omega=1rad/s $$ có đồ thị của li độ (x), vận tốc (v) và gia tốc (a) theo thời gian (t) được mô tả trên Hình 4.1. --- |
| 5 | TH_PHY11_C01_L03_002 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | 1. Vận tốc của vật dao động điều hòa | 0.6009 | Như đã biết, vận tốc tức thời của một vật được xác định bằng công thức: $$ v=\frac{\Delta x}{\Delta t} $$ (với (\Delta t) rất nhỏ), tức là bằng độ dốc của đồ thị ((x-t)) tại điểm đang xét. Để đơn giản, ta hãy xét một vật dao động điều hòa có đồ thị ((x-t))... |
| 6 | TH_PHY11_C01_L03_018 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | Câu 1 | 0.5913 | Một vật dao động điều hòa trên trục (Ox). Khi vật qua vị trí cân bằng thì tốc độ của nó là: $$ 20;cm/s $$ Khi vật có tốc độ là: $$ 10;cm/s $$ thì gia tốc của nó có độ lớn là: $$ 40\sqrt3;cm/s^2 $$ Tính biên độ dao động của vật. --- |
| 7 | TH_PHY11_C01_L03_004 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | 1.1. Phương trình của vận tốc | 0.5683 | Khi học phép tính đạo hàm, chúng ta sẽ biết: $$ v=\frac{\Delta x}{\Delta t} $$ (với (\Delta t) rất nhỏ) chính là đạo hàm của li độ (x) theo thời gian, kí hiệu là (x'). Ta có: $$ x=A\cos(\omega t+\varphi) $$ Suy ra: $$ v=x' =-\omega A\sin(\omega t+\varphi) \... |
| 8 | TH_PHY11_C01_L03_001 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | Bài 3: Vận tốc, gia tốc trong dao động điều hòa | 0.5438 | > Ta có thể dựa vào đồ thị ((x-t)) của dao động điều hòa để xác định vận tốc và gia tốc của vật được không? --- |
| 9 | TH_PHY11_C01_L03_015 | physics | 11 | oscillation | PHY11_C01_L03_bai-3-van-toc-gia-toc-trong-dao-dong-dieu-hoa | Hoạt động 2 | 0.5285 | Phương trình dao động của một vật là: $$ x=5\cos(4\pi t) \quad(cm) $$ Hãy: * Viết phương trình vận tốc. * Viết phương trình gia tốc. * Vẽ đồ thị li độ, vận tốc, gia tốc theo thời gian của vật. --- |
| 10 | TH_PHY11_C01_L04_006 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Ví dụ 2 | 0.5254 | Một vật dao động điều hòa với tần số: $$ f=2Hz $$ Tại thời điểm ban đầu vật có li độ: $$ x=5cm $$ và vận tốc: $$ v=-30cm/s $$ Xác định: a. Biên độ và pha ban đầu của dao động. b. Giá trị cực đại của vận tốc và gia tốc của vật khi dao động. --- |

### REAL_EVAL50_PHYS_008

- Subject/grade/type: physics / 12 / formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Biểu thức dòng điện xoay chiều.
- Current expected chunks: GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S007_P01
- Best gold rank: 2
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Nếu nối hai đầu của khung dây dẫn $MNPQ$ với đoạn mạch tiêu thụ điện thì giữa hai đầu đoạn mạch có một hiệu điện thế. Hiệu điện thế này biến thiên theo thời gian theo quy luật dạng cosin hoặc sin, gọi là **hiệu điện thế xoay chiều** hay **điện áp xoay chiều**. Điện áp xoay chiều có cùng chu kì, tần số với suất điện động xoay chiều và có dạng: $$ u=U_0\cos(\omega t+\varphi_u) \tag{17.2} $$ Khi đó, dòng điện chạy qua mạch điện tiêu thụ là dòng điện xoay chiều có dạng: $$ i=I_0\cos(\omega t+\varphi_i) \tag{17.3} $$ Trong các biểu thức (17.2), (17.3): * $u$ là giá trị điện áp tức thời tại thời điểm $t$. * $i$ là giá trị cường độ dòng điện tức thời tại thời điểm $t$. * $U_0$ là giá trị cực đại của điện áp xoay chiều. * $I_0$ là giá trị cực đại của cường độ dòng điện xoay chiều. * $\omega$ là tần số góc của dòng điện xoay chiều, đơn vị là rad/s. * $\varphi_u$ là pha ban đầu của điện áp xoay...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S025_P01 | physics | 12 | physics_chapter_03 | physics_g12_bai17_aecd69de | 5. Em đã học | 0.5779 | > Dòng điện xoay chiều là dòng điện có cường độ biến thiên điều hòa với thời gian theo quy luật hàm số sin hoặc cosin. Biểu thức dòng điện xoay chiều: $$ i=I_0\cos(\omega t+\varphi_i) $$ Mối liên hệ giữa giá trị hiệu dụng và giá trị cực đại của dòng điện xo... |
| 2 | GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S007_P01 | physics | 12 | physics_chapter_03 | physics_g12_bai17_aecd69de | 2.1. Biểu thức dòng điện xoay chiều | 0.5743 | Nếu nối hai đầu của khung dây dẫn $MNPQ$ với đoạn mạch tiêu thụ điện thì giữa hai đầu đoạn mạch có một hiệu điện thế. Hiệu điện thế này biến thiên theo thời gian theo quy luật dạng cosin hoặc sin, gọi là **hiệu điện thế xoay chiều** hay **điện áp xoay chiều... |
| 3 | GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S002_P01 | physics | 12 | physics_chapter_03 | physics_g12_bai17_aecd69de | 1. Nguyên tắc tạo ra dòng điện xoay chiều | 0.5691 | Xét một khung dây dẫn $MNPQ$ có diện tích $S$, quay đều với tốc độ góc $\omega$ quanh một trục $OO'$ vuông góc với các đường sức của một từ trường đều có cảm ứng từ $\vec{B}$. Theo hiện tượng cảm ứng điện từ đã học ở Bài 16, trong khung dây xuất hiện một su... |
| 4 | GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S020_P01 | physics | 12 | physics_chapter_03 | physics_g12_bai17_aecd69de | 4.1. Ứng dụng của dòng điện xoay chiều trong cuộc sống | 0.5328 | Dòng điện xoay chiều có ưu thế trong việc truyền tải điện năng đi xa. Dòng điện xoay chiều được dùng để: * Truyền tải điện năng đến các nhà máy. * Truyền tải điện năng đến xí nghiệp sản xuất. * Truyền tải điện năng đến nơi tiêu thụ sử dụng dòng điện xoay ch... |
| 5 | GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S026_P01 | physics | 12 | physics_chapter_03 | physics_g12_bai17_aecd69de | 6. Em có thể | 0.5122 | > Nêu được ý nghĩa của các thông số ghi trên các thiết bị điện. > Giải thích được cách tạo ra dòng điện xoay chiều trong nhà máy thủy điện. > Đề xuất được một số biện pháp sử dụng điện an toàn trong gia đình. --- |
| 6 | GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S006_P01 | physics | 12 | physics_chapter_03 | physics_g12_bai17_aecd69de | Câu hỏi | 0.4983 | Dựa trên nguyên tắc tạo ra dòng điện xoay chiều, hãy thực hiện các nhiệm vụ sau: 1. Làm thế nào để dẫn dòng điện ra mạch ngoài khi khung dây dẫn quay đều trong từ trường? 2. Thảo luận về: * Nguyên tắc tạo ra suất điện động xoay chiều. * Các yếu tố cần để tạ... |
| 7 | GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S010_P01 | physics | 12 | physics_chapter_03 | physics_g12_bai17_aecd69de | Câu hỏi | 0.4925 | Dựa vào đồ thị biểu diễn cường độ dòng điện xoay chiều theo thời gian như Hình 17.3, hãy thực hiện các yêu cầu sau: 1. Xác định chu kì $T$ và tần số $f$ của dòng điện xoay chiều. 2. Xác định: * Giá trị cực đại. * Giá trị hiệu dụng. * Pha ban đầu của cường đ... |
| 8 | GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S017_P01 | physics | 12 | physics_chapter_03 | physics_g12_bai17_aecd69de | Câu hỏi | 0.4869 | 1. Hãy viết biểu thức suất điện động của máy phát điện xoay chiều trong trường hợp khung dây có $N$ vòng dây, quay với tốc độ góc $\omega$ trong từ trường đều có cảm ứng từ $B$, với $B$ vuông góc với trục quay của khung. 2. Vì sao cần sử dụng vành khuyên và... |
| 9 | GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S008_P01 | physics | 12 | physics_chapter_03 | physics_g12_bai17_aecd69de | 2.2. Giá trị hiệu dụng | 0.4760 | Dòng điện xoay chiều cũng có tác dụng nhiệt như dòng điện không đổi. Cho dòng điện xoay chiều có cường độ: $$ i=I_0\cos(\omega t+\varphi_i) $$ chạy qua đoạn mạch chỉ có điện trở $R$. Nhiệt lượng tỏa ra trong thời gian $t$ đủ lớn so với chu kì $T$ của dòng đ... |
| 10 | GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S021_P01 | physics | 12 | physics_chapter_03 | physics_g12_bai17_aecd69de | Câu hỏi | 0.4723 | 1. Ngoài thắp sáng và chạy máy thì dòng điện xoay chiều còn được sử dụng vào những việc gì? 2. Tìm hiểu thông qua sách báo, internet về các biện pháp giảm hao phí trong truyền tải điện năng đi xa bằng dòng điện xoay chiều. --- |

### REAL_EVAL50_MATH_002

- Subject/grade/type: math / 10 / formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Giải.
- Current expected chunks: GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S023_P01
- Best gold rank: 3
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: expected_chunk_missing_question_keywords
- Recommendation: rewrite_question
- Human decision: _empty_

Current expected chunk excerpt:

```text
Gọi $x$ là số lượng vé loại 1 bán được, $x \in \mathbb{N}$, và $y$ là số lượng vé loại 2 bán được, $y \in \mathbb{N}$. Số tiền bán vé thu được là: $$ 50x + 100y $$ nghìn đồng. Người ta sẽ phải bù lỗ trong trường hợp số tiền bán vé nhỏ hơn 20 triệu đồng, tức là: $$ 50x + 100y < 20000 $$ hay: $$ x + 2y < 400. $$ Như vậy, việc giải quyết bài toán mở đầu dẫn đến việc đi tìm miền nghiệm của bất phương trình: $$ x + 2y < 400. $$ Miền nghiệm của bất phương trình bậc nhất hai ẩn này được xác định như sau: Vẽ đường thẳng: $$ d: x + 2y = 400. $$ Ta lấy gốc toạ độ $O(0; 0)$ và tính: $$ 0 + 2 \cdot 0 = 0 < 400. $$ Do đó, miền nghiệm của bất phương trình là nửa mặt phẳng bờ $d$ chứa gốc toạ độ không kể đường thẳng $d$. ![Miền nghiệm của bất phương trình x + 2y < 400](images/h2_4.png) *Hình 2.4. Miền nghiệm của bất phương trình $x + 2y < 400$.* Vậy, nếu bán được số vé loại 1 là $x$ và số vé loại 2...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S006_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Kiến thức | 0.4495 | Mỗi hệ thức liên hệ giữa $x$ và $y$ thu được trong HĐ1a và HĐ1b được gọi là một **bất phương trình bậc nhất hai ẩn**. Bất phương trình bậc nhất hai ẩn $x$, $y$ có dạng tổng quát là: $$ ax + by \le c $$ hoặc $$ ax + by \ge c,\quad ax + by < c,\quad ax + by >... |
| 2 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S005_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | HĐ1 | 0.3926 | Trong tình huống mở đầu, gọi $x$ là số vé loại 1 bán được và $y$ là số vé loại 2 bán được. Viết biểu thức tính số tiền bán vé thu được, đơn vị nghìn đồng, ở rạp chiếu phim đó theo $x$ và $y$. a) Các số nguyên không âm $x$ và $y$ phải thoả mãn điều kiện gì đ... |
| 3 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S023_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Giải | 0.3827 | Gọi $x$ là số lượng vé loại 1 bán được, $x \in \mathbb{N}$, và $y$ là số lượng vé loại 2 bán được, $y \in \mathbb{N}$. Số tiền bán vé thu được là: $$ 50x + 100y $$ nghìn đồng. Người ta sẽ phải bù lỗ trong trường hợp số tiền bán vé nhỏ hơn 20 triệu đồng, tức... |
| 4 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S027_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | 2.3 | 0.3821 | Ông An muốn thuê một chiếc ô tô có lái xe trong một tuần. Giá thuê xe được cho như bảng sau: \| Thời gian \| Phí cố định (nghìn đồng/ngày) \| Phí tính theo quãng đường di chuyển (nghìn đồng/kilômét) \| \| ---------------------- \| ----------------------------: \|... |
| 5 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S020_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Giải | 0.3818 | **Bước 1.** Vẽ đường thẳng: $$ d: 5x - 7y = 0 $$ trên mặt phẳng toạ độ $Oxy$. **Bước 2.** Lấy điểm $M_0(0; 1)$ không thuộc $d$ và thay $x = 0$, $y = 1$ vào biểu thức $5x - 7y$, ta được: $$ 5 \cdot 0 - 7 \cdot 1 = -7 < 0. $$ Do đó miền nghiệm của bất phương... |
| 6 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S017_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Giải | 0.3785 | Ta biểu diễn miền nghiệm của bất phương trình bậc nhất hai ẩn: $$ x + y \ge 100 $$ như sau: **Bước 1.** Vẽ đường thẳng: $$ d: x + y = 100 $$ trên mặt phẳng toạ độ $Oxy$. **Bước 2.** Lấy một điểm bất kì không thuộc $d$ trên mặt phẳng rồi thay vào biểu thức $... |
| 7 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S010_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Kiến thức | 0.3741 | Cặp số $(x_0; y_0)$ được gọi là một **nghiệm** của bất phương trình bậc nhất hai ẩn: $$ ax + by \le c $$ nếu bất đẳng thức: $$ ax_0 + by_0 \le c $$ đúng. --- |
| 8 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S018_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Cách biểu diễn miền nghiệm của bất phương trình bậc nhất hai ẩn | 0.3664 | Xét bất phương trình: $$ ax + by \le c. $$ Cách biểu diễn miền nghiệm: **Bước 1.** Vẽ đường thẳng: $$ d: ax + by = c $$ trên mặt phẳng toạ độ $Oxy$. **Bước 2.** Lấy một điểm $M_0(x_0; y_0)$ không thuộc $d$. **Bước 3.** Tính $ax_0 + by_0$ và so sánh với $c$.... |
| 9 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S015_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Kiến thức | 0.3662 | Trong mặt phẳng toạ độ $Oxy$, tập hợp các điểm có toạ độ là nghiệm của bất phương trình: $$ ax + by \le c $$ được gọi là **miền nghiệm** của bất phương trình đó. Người ta chứng minh được rằng đường thẳng $d$ có phương trình: $$ ax + by = c $$ chia mặt phẳng... |
| 10 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S001_P01 | math | 10 | math_chapter_02 | math_g10_bai03_984fc33e | Giới thiệu chương | 0.3649 | Các bất phương trình bậc nhất hai ẩn và hệ bất phương trình bậc nhất hai ẩn xuất hiện trong nhiều bài toán kinh tế, như là những ràng buộc trong các bài toán sản xuất, bài toán phân phối hàng hoá,... Chương này cung cấp cách biểu diễn miền nghiệm của các bấ... |

### REAL_EVAL_PHY11_WAVE_SPEED_001

- Subject/grade/type: physics / 11 / calculation
- Question: Một sóng có tần số f = 5 Hz và tốc độ truyền sóng v = 2 m/s. Tính bước sóng.
- Current expected chunks: TH_PHY11_C02_L14_004
- Best gold rank: 4
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: expected_chunk_too_short_or_noisy, expected_chunk_missing_question_keywords, candidate_may_be_better_than_gold
- Recommendation: rewrite_question
- Human decision: _empty_

Current expected chunk excerpt:

```text
338,5m/s $$ b. Sử dụng công thức: $$ v=\lambda f $$ Suy ra: $$ \lambda=\frac{v}{f} ===================
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | TH_PHY11_C02_L14_009 | physics | 11 | waves | PHY11_C02_L14_bai-14-bai-tap-ve-song | Giải | 0.6031 | Bước sóng là khoảng cách giữa hai ngọn sóng liên tiếp. Theo đề bài ta có: $$ \lambda=14,3-12,4=1,90cm $$ Áp dụng công thức: $$ v=\lambda f $$ tính tốc độ truyền sóng: $$ v=1,9\cdot50=95cm/s $$ --- |
| 2 | TH_PHY11_C02_L14_010 | physics | 11 | waves | PHY11_C02_L14_bai-14-bai-tap-ve-song | Ví dụ 3 | 0.5171 | Một sóng hình sin đang lan truyền từ trái sang phải trên một dây dài. Hình 14.1 là hình ảnh của sóng ở một thời điểm xét. Cho biết tốc độ truyền sóng: $$ v=1m/s $$ --- |
| 3 | TH_PHY11_C02_L14_003 | physics | 11 | waves | PHY11_C02_L14_bai-14-bai-tap-ve-song | Giải | 0.5167 | a. Tốc độ truyền sóng: $$ v=\frac{s}{t} ============= |
| 4 | TH_PHY11_C02_L14_004 | physics | 11 | waves | PHY11_C02_L14_bai-14-bai-tap-ve-song | \frac{91,4}{0,27} | 0.4662 | 338,5m/s $$ b. Sử dụng công thức: $$ v=\lambda f $$ Suy ra: $$ \lambda=\frac{v}{f} =================== |
| 5 | TH_PHY11_C02_L08_010 | physics | 11 | waves | PHY11_C02_L08_chuong-ii-song | Câu hỏi | 0.4542 | > Hãy quan sát chuyển động của miếng xốp trong thí nghiệm Hình 8.1 và cho biết miếng xốp có chuyển động ra xa nguồn cùng với sóng không? --- Các phần tử môi trường chỉ dao động trong một phạm vi không gian rất hẹp, trong khi sóng truyền đi rất xa. --- |
| 6 | TH_PHY11_C02_L14_005 | physics | 11 | waves | PHY11_C02_L14_bai-14-bai-tap-ve-song | \frac{338,5}{192} | 0.4524 | 1,76m $$ c. Với: $$ f'=442Hz $$ ta có: $$ \lambda' ======== |
| 7 | TH_PHY11_C02_L08_009 | physics | 11 | waves | PHY11_C02_L08_chuong-ii-song | 2. Giải thích sự tạo thành sóng | 0.4390 | Trong thí nghiệm Hình 8.1, các phần tử nước sát nguồn (O) dao động theo phương thẳng đứng. Nhờ có lực liên kết giữa các phần tử nước mà các phần tử nước ở điểm (M) lân cận điểm (O) dao động theo. Đến lượt các phần tử nước ở điểm (N) lân cận điểm (M) dao độn... |
| 8 | TH_PHY11_C02_L08_007 | physics | 11 | waves | PHY11_C02_L08_chuong-ii-song | Kết quả | 0.4340 | Quan sát qua thành kênh thẳng đứng, ta thấy mặt cắt của nước có dạng hình sin. Miếng xốp (C) dao động lên xuống tại chỗ, còn những biến dạng của mặt nước lan truyền đi từ nguồn sóng (O) ra xa cho ta hình ảnh về sóng có trên mặt nước. (O) là nguồn sóng, nước... |
| 9 | TH_PHY11_C02_L08_023 | physics | 11 | waves | PHY11_C02_L08_chuong-ii-song | Em có thể | 0.4253 | > Dùng đồ thị ((u-x)) của một sóng hình sin để nêu được các đại lượng đặc trưng của sóng. |
| 10 | TH_PHY11_C02_L08_008 | physics | 11 | waves | PHY11_C02_L08_chuong-ii-song | Hình 8.2 | 0.4194 | ![Hình 8.2 - Đồ thị u-x của một sóng hình sin](assets/images/hinh-8-2.png) **Nội dung hình** Hình 8.2 là đồ thị một sóng hình sin lan truyền trên mặt nước theo phương (Ox). Hình biểu diễn: * Li độ (u). * Ngọn sóng. * Bước sóng (\lambda). * Biên độ sóng. * L... |

### REAL_EVAL50_PHYS_015

- Subject/grade/type: physics / 10 / concept
- Question: Trình bày ý chính của mục a) Khái niệm áp lực.
- Current expected chunks: GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S006_P01
- Best gold rank: 5
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: expected_chunk_missing_question_keywords
- Recommendation: rewrite_question
- Human decision: _empty_

Current expected chunk excerpt:

```text
Một cuốn sách nằm yên trên mặt bàn nằm ngang chịu tác dụng của hai lực cân bằng: - Lực hút của Trái Đất. - Lực đẩy của mặt bàn. Do mặt bàn tác dụng lên cuốn sách lực \(\vec{F}\) có: - Phương thẳng đứng. - Chiều hướng lên trên. - Độ lớn bằng trọng lượng \(P\) của cuốn sách. Nên theo định luật III Newton, cuốn sách tác dụng lên mặt bàn lực \(\vec{F}_N\) có: - Phương thẳng đứng. - Chiều hướng xuống dưới. - Độ lớn bằng \(F\). Lực \(\vec{F}_N\) ép lên mặt bàn theo phương vuông góc với mặt bàn, được gọi là **áp lực**. ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S033_P01 | physics | 10 | physics_chapter_07 | physics_g10_bai34_3814499e | Em đã học | 0.4595 | - Công thức tính khối lượng riêng: \[ \rho=\frac{m}{V} \] Đơn vị: - \(kg/m^3\) - \(g/cm^3\) Trong đó: \[ 1g/cm^3=1000kg/m^3 \] --- - Công thức tính áp suất: \[ p=\frac{F_N}{S} \] Trong đó: - \(F_N\): áp lực vuông góc với mặt bị ép. - \(S\): diện tích mặt bị... |
| 2 | GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S022_P01 | physics | 10 | physics_chapter_07 | physics_g10_bai34_3814499e | Câu hỏi | 0.4380 | Một khối chất lỏng đứng yên có: - Khối lượng riêng \(\rho\). - Hình trụ có diện tích đáy \(S\). - Chiều cao \(h\). (Hình 34.8) Hãy dùng công thức tính áp suất đã học để chứng minh rằng áp suất của khối chất lỏng tác dụng lên đáy bình có độ lớn là: \[ p=\rho... |
| 3 | GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S013_P01 | physics | 10 | physics_chapter_07 | physics_g10_bai34_3814499e | 2. Áp suất | 0.4326 | Do tác dụng của áp lực lên mặt bị ép càng mạnh khi: - Cường độ của áp lực càng lớn. - Diện tích mặt bị ép càng nhỏ. Nên để đặc trưng cho tác dụng của áp lực, người ta dùng khái niệm **áp suất**. Áp suất có độ lớn bằng áp lực chia cho diện tích bị ép: \[ \te... |
| 4 | GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S024_P01 | physics | 10 | physics_chapter_07 | physics_g10_bai34_3814499e | Câu hỏi | 0.4220 | Một khối lập phương cạnh: \[ a=0,30\,m \] được nhúng chìm hoàn toàn trong nước. Biết: \[ \rho_{\text{nước}}=1000\,kg/m^3 \] Hãy: 1. Tính áp suất của nước tác dụng lên mặt dưới của khối lập phương. 2. Xác định phương, chiều và độ lớn của lực do áp suất này g... |
| 5 | GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S006_P01 | physics | 10 | physics_chapter_07 | physics_g10_bai34_3814499e | a) Khái niệm áp lực | 0.4212 | Một cuốn sách nằm yên trên mặt bàn nằm ngang chịu tác dụng của hai lực cân bằng: - Lực hút của Trái Đất. - Lực đẩy của mặt bàn. Do mặt bàn tác dụng lên cuốn sách lực \(\vec{F}\) có: - Phương thẳng đứng. - Chiều hướng lên trên. - Độ lớn bằng trọng lượng \(P\... |
| 6 | GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S029_P01 | physics | 10 | physics_chapter_07 | physics_g10_bai34_3814499e | Câu hỏi | 0.4150 | 1. Tính độ chênh lệch áp suất của nước giữa hai điểm nằm trên hai mặt phẳng ngang cách nhau: \[ 20\,cm \] 2. Dùng phương trình cơ bản của chất lưu đứng yên để chứng minh: > Áp suất tại các điểm nằm trên cùng một mặt phẳng ngang trong chất lỏng là bằng nhau.... |
| 7 | GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S009_P01 | physics | 10 | physics_chapter_07 | physics_g10_bai34_3814499e | Câu hỏi | 0.4080 | Hãy dựa vào thí nghiệm vẽ ở Hình 34.2, cho biết độ lớn của áp lực phụ thuộc vào những yếu tố nào và phụ thuộc như thế nào. --- |
| 8 | GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S031_P01 | physics | 10 | physics_chapter_07 | physics_g10_bai34_3814499e | Em có biết? | 0.4065 | Phương trình cơ bản của thủy tĩnh học cho thấy: Sự chênh lệch áp suất của chất lỏng **không phụ thuộc vào lượng chất lỏng**, mà chỉ phụ thuộc vào **độ chênh lệch độ sâu**. Vì vậy: - Một ống nước rất nhỏ. - Một hồ nước lớn. - Một đại dương. nếu có cùng độ sâ... |
| 9 | GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S011_P01 | physics | 10 | physics_chapter_07 | physics_g10_bai34_3814499e | Câu hỏi | 0.3968 | 1. Trong Hình 34.3, lực nào sau đây là lực đàn hồi, lực ma sát, áp lực? a) Lực của chân em bé tác dụng lên sàn nhà. b) Lực của tay em bé kéo hộp đồ chơi. c) Lực của hộp đồ chơi tác dụng lên sàn nhà. 2. Chứng minh rằng áp lực của cuốn sách tác dụng lên mặt b... |
| 10 | GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S027_P01 | physics | 10 | physics_chapter_07 | physics_g10_bai34_3814499e | 3. Phương trình cơ bản của chất lưu đứng yên | 0.3796 | Xét hai điểm \(M\) và \(N\) trong chất lỏng đứng yên. Độ sâu của chúng so với mặt thoáng lần lượt là: - \(h_1\) - \(h_2\) Ta có: \[ p_M=p_a+\rho gh_1 \] \[ p_N=p_a+\rho gh_2 \] Suy ra: \[ p_N-p_M=\rho g(h_2-h_1) \] Hay: \[ \Delta p=\rho g\Delta h \tag{34.3}... |

### REAL_EVAL50_CHEM_004

- Subject/grade/type: chemistry / 12 / comparison
- Question: So sánh các khái niệm hoặc đại lượng chính được nêu trong mục Thế điện cực chuẩn.
- Current expected chunks: GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S009_P02
- Best gold rank: 5
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
| Nguyên tố | Bán phản ứng | Thế điện cực chuẩn E°, V | | --------- | --------------------- | -----------------------: | | Li | Li⁺ + 1e ⇌ Li | -3,040 | | K | K⁺ + 1e ⇌ K | -2,924 | | Ba | Ba²⁺ + 2e ⇌ Ba | -2,92 | | Ca | Ca²⁺ + 2e ⇌ Ca | -2,84 | | Na | Na⁺ + 1e ⇌ Na | -2,713 | | Mg | Mg²⁺ + 2e ⇌ Mg | -2,356 | | Al | Al³⁺ + 3e ⇌ Al | -1,676 | | Zn | Zn²⁺ + 2e ⇌ Zn | -0,762 | | Cr | Cr³⁺ + 3e ⇌ Cr | -0,74 | | Fe | Fe²⁺ + 2e ⇌ Fe | -0,44 | | H₂ | 2H₂O + 2e ⇌ H₂ + 2OH⁻ | -0,414 | | Cd | Cd²⁺ + 2e ⇌ Cd | -0,403 | | Ni | Ni²⁺ + 2e ⇌ Ni | -0,257 | | Sn | Sn²⁺ + 2e ⇌ Sn | -0,137 | | Pb | Pb²⁺ + 2e ⇌ Pb | -0,126 | | H₂ | 2H⁺ + 2e ⇌ H₂ | 0,000 | | Cu | Cu²⁺ + 2e ⇌ Cu | +0,340 | | Fe | Fe³⁺ + 1e ⇌ Fe²⁺ | +0,771 | | Ag | Ag⁺ + 1e ⇌ Ag | +0,799 | | Hg | Hg²⁺ + 2e ⇌ Hg | +0,853 | | Br | Br₂(aq) + 2e ⇌ 2Br⁻ | +1,087 | | O | O₂ + 4H⁺ + 4e ⇌ 2H₂O | +1,229 | | Cl | Cl₂(aq) + 2e ⇌ 2Cl⁻ | +1,358 | | Au |...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S009_P01 | chemistry | 12 | chemistry_chapter_05 | chemistry_g12_bai15_c9b589b8 | 2. Thế điện cực chuẩn | 0.5332 | Mỗi điện cực ở điều kiện chuẩn có một đại lượng đặc trưng về điện thế, gọi là **thế điện cực chuẩn**. Thế điện cực chuẩn gắn liền với cặp oxi hoá – khử tương ứng nên thường được kí hiệu là: ```text E°oxi hoá/khử ``` và thường có đơn vị là volt (V). Thực ngh... |
| 2 | GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S001_P01 | chemistry | 12 | chemistry_chapter_05 | chemistry_g12_bai15_c9b589b8 | MỤC TIÊU | 0.5141 | * Mô tả được cặp oxi hoá – khử của kim loại. * Nêu được giá trị thế điện cực chuẩn là đại lượng đánh giá khả năng khử giữa các dạng khử, khả năng oxi hoá giữa các dạng oxi hoá trong điều kiện chuẩn. * Sử dụng bảng giá trị thế điện cực chuẩn để: * So sánh đư... |
| 3 | GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S017_P01 | chemistry | 12 | chemistry_chapter_05 | chemistry_g12_bai15_c9b589b8 | Cách xác định thế điện cực chuẩn | 0.4962 | Thế điện cực chuẩn của một điện cực được xác định bằng cách thiết lập pin điện gồm điện cực ở điều kiện chuẩn cần xác định và điện cực hydrogen chuẩn. 📷 **Hình 15.9.** Thí nghiệm xác định thế điện cực chuẩn của cặp Cu²⁺/Cu. --- |
| 4 | GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S007_P01 | chemistry | 12 | chemistry_chapter_05 | chemistry_g12_bai15_c9b589b8 | 1. Điện cực | 0.4936 | Ứng với mỗi cặp oxi hoá – khử có thể thiết lập một điện cực, tại đó tồn tại cân bằng giữa dạng oxi hoá và dạng khử. Ví dụ: Đối với cặp Zn²⁺/Zn, thiết lập được điện cực kẽm bằng cách cho thanh Zn tiếp xúc trực tiếp với dung dịch muối chứa ion Zn²⁺. Tương tự,... |
| 5 | GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S009_P02 | chemistry | 12 | chemistry_chapter_05 | chemistry_g12_bai15_c9b589b8 | 2. Thế điện cực chuẩn | 0.4900 | \| Nguyên tố \| Bán phản ứng \| Thế điện cực chuẩn E°, V \| \| --------- \| --------------------- \| -----------------------: \| \| Li \| Li⁺ + 1e ⇌ Li \| -3,040 \| \| K \| K⁺ + 1e ⇌ K \| -2,924 \| \| Ba \| Ba²⁺ + 2e ⇌ Ba \| -2,92 \| \| Ca \| Ca²⁺ + 2e ⇌ Ca \| -2,84 \| \| Na \| Na⁺... |
| 6 | GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S012_P01 | chemistry | 12 | chemistry_chapter_05 | chemistry_g12_bai15_c9b589b8 | a) So sánh tính khử, tính oxi hoá giữa các cặp oxi hoá – khử | 0.4646 | Giữa hai cặp oxi hoá – khử, cặp có giá trị thế điện cực chuẩn nhỏ hơn thì dạng khử có tính khử mạnh hơn, còn dạng oxi hoá có tính oxi hoá yếu hơn và ngược lại. Ví dụ: ```text E°Cu²⁺/Cu = +0,340 V < E°Ag⁺/Ag = +0,799 V ``` nên tính khử của Cu mạnh hơn Ag, tí... |
| 7 | GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S011_P01 | chemistry | 12 | chemistry_chapter_05 | chemistry_g12_bai15_c9b589b8 | Nguyên nhân xuất hiện thế điện cực | 0.4507 | Khi cân bằng sau được thiết lập: ```text Mⁿ⁺ + ne ⇌ M ``` thì tại ranh giới giữa kim loại và dung dịch điện li xuất hiện hai lớp tích điện trái dấu rất gần nhau, gọi là lớp điện kép. Sự xuất hiện lớp điện kép tạo ra sự chênh lệch điện thế và điện thế chênh... |
| 8 | GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S013_P01 | chemistry | 12 | chemistry_chapter_05 | chemistry_g12_bai15_c9b589b8 | Nghiên cứu về chiều phản ứng giữa các cặp oxi hoá – khử | 0.4374 | Xét hai phản ứng oxi hoá – khử sau: ```text Zn + Cu²⁺ → Zn²⁺ + Cu ``` ```text Cu + 2Ag⁺ → Cu²⁺ + 2Ag ``` **Yêu cầu:** 1. Dựa vào Bảng 15.1, so sánh thế điện cực chuẩn của các cặp oxi hoá – khử: Zn²⁺/Zn với Cu²⁺/Cu; Cu²⁺/Cu với Ag⁺/Ag. 2. Chỉ ra chất khử mạn... |
| 9 | GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S016_P01 | chemistry | 12 | chemistry_chapter_05 | chemistry_g12_bai15_c9b589b8 | 2. Pin Galvani | 0.4289 | Ở 25 °C, nhúng một thanh Zn vào cốc đựng dung dịch ZnSO₄ 1 M, nhúng một thanh Cu vào cốc đựng dung dịch CuSO₄ 1 M. Nối thanh Zn và thanh Cu bằng dây dẫn, lắp một vôn kế để đo hiệu điện thế. Đóng kín mạch bằng một cầu muối. 📷 **Hình 15.8.** Sơ đồ pin Zn – C... |
| 10 | GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S015_P01 | chemistry | 12 | chemistry_chapter_05 | chemistry_g12_bai15_c9b589b8 | 1. Phản ứng oxi hoá – khử và dòng điện | 0.4168 | Phản ứng oxi hoá – khử luôn kèm theo sự chuyển electron từ chất khử sang chất oxi hoá. Nếu các quá trình oxi hoá, quá trình khử xảy ra trên hai điện cực và electron được truyền từ chất khử sang chất oxi hoá qua dây dẫn thì năng lượng của phản ứng hoá học sẽ... |

### REAL_EVAL50_CHEM_005

- Subject/grade/type: chemistry / 10 / cross-topic-noise
- Question: Bỏ qua các từ gây nhiễu như dao động, acid, phương trình bậc hai; theo đúng mục Viết cấu hình electron của nguyên tử, nội dung chính là gì?
- Current expected chunks: GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S014_P01
- Best gold rank: 5
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
**Bước 1.** Xác định số electron trong nguyên tử. **Bước 2.** Viết thứ tự các lớp và phân lớp electron theo chiều tăng của năng lượng: ```text 1s 2s 2p 3s 3p 4s ... ```` **Bước 3.** Điền các electron vào các phân lớp theo nguyên lí vững bền cho đến electron cuối cùng. Ví dụ: Viết cấu hình electron của nguyên tử oxygen `(Z = 8)` và potassium `(Z = 19)`. Nguyên tử oxygen có tổng số electron là 8. Thứ tự các lớp và phân lớp electron đến phân lớp `4s` theo chiều tăng của năng lượng là: ```text 1s 2s 2p 3s 3p 4s ... ``` Điền electron: ```text 1s²2s²2p⁴ ``` Có thể thay `1s²` bằng kí hiệu `[He]`. Cấu hình electron của nguyên tử oxygen là: ```text 1s²2s²2p⁴ ``` hoặc: ```text [He]2s²2p⁴ ``` hoặc: ```text (2, 6) ``` Electron cuối cùng điền vào phân lớp `p` nên oxygen là nguyên tố p. Nguyên tử potassium có tổng số electron là 19. Thứ tự các lớp và phân lớp electron đến phân lớp `4s` theo chiều t...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S004_P01 | chemistry | 10 | chemistry_chapter_01 | chemistry_g10_bai03_54de3f11 | I. CHUYỂN ĐỘNG CỦA ELECTRON TRONG NGUYÊN TỬ | 0.5909 | Đến đầu thế kỉ XX, người ta vẫn cho rằng các electron chuyển động xung quanh hạt nhân nguyên tử theo những quỹ đạo tròn hay bầu dục, giống như quỹ đạo của các hành tinh quay xung quanh Mặt Trời. Mô hình hành tinh nguyên tử đã có ảnh hưởng rất lớn, thúc đẩy... |
| 2 | GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S013_P01 | chemistry | 10 | chemistry_chapter_01 | chemistry_g10_bai03_54de3f11 | III. CẤU HÌNH ELECTRON CỦA NGUYÊN TỬ | 0.5835 | Cấu hình electron của nguyên tử biểu diễn sự phân bố electron trên các phân lớp thuộc các lớp khác nhau. Các electron trong nguyên tử ở trạng thái cơ bản lần lượt chiếm các orbital có mức năng lượng từ thấp đến cao: ```text 1s 2s 2p 3s 3p 4s ... ``` Đây là... |
| 3 | GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S020_P01 | chemistry | 10 | chemistry_chapter_01 | chemistry_g10_bai03_54de3f11 | EM CÓ THỂ | 0.5534 | * Viết được cấu hình electron nguyên tử của một số nguyên tố hoá học quen thuộc trong thực tế như nitrogen, oxygen, aluminium,... * Dự đoán được tính chất hoá học cơ bản của các nguyên tố dựa vào cấu hình electron lớp ngoài cùng. ``` ``` |
| 4 | GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S002_P01 | chemistry | 10 | chemistry_chapter_01 | chemistry_g10_bai03_54de3f11 | MỤC TIÊU | 0.5532 | - Trình bày và so sánh được mô hình của Rutherford - Bohr với mô hình hiện đại mô tả sự chuyển động của electron trong nguyên tử. - Nêu được khái niệm về orbital nguyên tử (AO), mô tả được hình dạng của AO s, p và số lượng electron trong một AO. - Trình bày... |
| 5 | GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S014_P01 | chemistry | 10 | chemistry_chapter_01 | chemistry_g10_bai03_54de3f11 | 4. Viết cấu hình electron của nguyên tử | 0.5194 | **Bước 1.** Xác định số electron trong nguyên tử. **Bước 2.** Viết thứ tự các lớp và phân lớp electron theo chiều tăng của năng lượng: ```text 1s 2s 2p 3s 3p 4s ... ```` **Bước 3.** Điền các electron vào các phân lớp theo nguyên lí vững bền cho đến electron... |
| 6 | GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S003_P01 | chemistry | 10 | chemistry_chapter_01 | chemistry_g10_bai03_54de3f11 | MỞ ĐẦU | 0.4911 | Trong nguyên tử, các electron chuyển động như thế nào? Sự sắp xếp các electron ở các lớp, các phân lớp tuân theo nguyên lí và quy tắc nào? --- |
| 7 | GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S007_P01 | chemistry | 10 | chemistry_chapter_01 | chemistry_g10_bai03_54de3f11 | Câu hỏi | 0.4822 | 1. Mô hình hiện đại mô tả sự chuyển động của electron trong nguyên tử như thế nào? 2. Orbital s có dạng nào? * A. Hình tròn. * B. Hình số tám nổi. * C. Hình cầu. * D. Hình bầu dục. 3. Quan sát Hình 3.3 và nêu sự định hướng của các AO p trong không gian. --- |
| 8 | GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S017_P01 | chemistry | 10 | chemistry_chapter_01 | chemistry_g10_bai03_54de3f11 | 6. Đặc điểm của lớp electron ngoài cùng | 0.4813 | Các electron lớp ngoài cùng quyết định tính chất hoá học cơ bản của nguyên tố: kim loại, phi kim hay khí hiếm. Các nguyên tử có 8 electron lớp ngoài cùng đều rất bền vững, chúng hầu như không tham gia vào các phản ứng hoá học. Đó là các nguyên tử khí hiếm.... |
| 9 | GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S016_P01 | chemistry | 10 | chemistry_chapter_01 | chemistry_g10_bai03_54de3f11 | Câu hỏi | 0.4764 | 6. Cấu hình electron của nguyên tử có `Z = 16` là: * A. `1s²2s²2p⁶3s²3p³`. * B. `1s²2s²2p⁶3s²3p⁵`. * C. `1s²2s²2p⁶3s²3p⁴`. * D. `1s²2s²2p⁵3s²3p⁵`. 7. Biểu diễn cấu hình electron của các nguyên tử có `Z = 8` và `Z = 11` theo ô orbital. --- |
| 10 | GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S015_P01 | chemistry | 10 | chemistry_chapter_01 | chemistry_g10_bai03_54de3f11 | 5. Biểu diễn cấu hình electron theo ô orbital | 0.4480 | Ví dụ: Cấu hình electron của nguyên tử nitrogen có `Z = 7` là: ```text 1s²2s²2p³ ``` Có thể được biểu diễn theo ô orbital như sau: ```text 1s 2s 2p ↑↓ ↑↓ ↑ ↑ ↑ ``` Hai ô orbital `1s` và `2s` có đủ 2 electron được biểu diễn bằng hai mũi tên ngược chiều nhau... |

### REAL_EVAL50_MATH_009

- Subject/grade/type: math / 10 / definition
- Question: Theo học liệu, Luyện tập 1 là gì?
- Current expected chunks: GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S009_P01
- Best gold rank: 5
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: expected_chunk_missing_question_keywords
- Recommendation: rewrite_question
- Human decision: _empty_

Current expected chunk excerpt:

```text
Thay dấu “?” bằng dấu “✓” vào ô thích hợp trong bảng sau: | Câu | Không là mệnh đề | Mệnh đề đúng | Mệnh đề sai | | ------------------------------------------------------------------------- | ---------------- | ------------ | ----------- | | 13 là số nguyên tố. | ? | ? | ? | | Tổng độ dài hai cạnh bất kì của một tam giác nhỏ hơn độ dài cạnh còn lại. | ? | ? | ? | | Bạn đã làm bài tập chưa? | ? | ? | ? | | Thời tiết hôm nay thật đẹp! | ? | ? | ? | ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S001_P01 | math | 10 | math_chapter_01 | math_g10_bai01_3b75b9bd | Giới thiệu chương | 0.4947 | Chương này cung cấp những khái niệm và kí hiệu lôgic thường dùng, củng cố và mở rộng hiểu biết ban đầu về lí thuyết tập hợp đã được học ở các lớp dưới. Từ đó góp phần hình thành khả năng suy luận có lí, khả năng tiếp nhận, diễn đạt các vấn đề một cách chính... |
| 2 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S023_P01 | math | 10 | math_chapter_01 | math_g10_bai01_3b75b9bd | Kiến thức | 0.4760 | Các định lí toán học là những mệnh đề đúng và thường có dạng: $$ P \Rightarrow Q $$ Khi đó ta nói: * $P$ là giả thiết của định lí, $Q$ là kết luận của định lí; hoặc * $P$ là điều kiện đủ để có $Q$; hoặc * $Q$ là điều kiện cần để có $P$. --- |
| 3 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S003_P01 | math | 10 | math_chapter_01 | math_g10_bai01_3b75b9bd | Kiến thức, kĩ năng | 0.4742 | Sau bài học này, em có thể: * Thiết lập và phát biểu mệnh đề phủ định, mệnh đề đảo, mệnh đề kéo theo, mệnh đề tương đương. * Thiết lập và phát biểu các mệnh đề có chứa kí hiệu $\forall$, $\exists$. * Xác định tính đúng sai của một mệnh đề trong những trường... |
| 4 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S047_P01 | math | 10 | math_chapter_01 | math_g10_bai01_3b75b9bd | Em có biết? | 0.4612 | Lôgic mệnh đề lần đầu tiên được phát triển một cách có hệ thống bởi nhà triết học Hy Lạp Aristotle hơn 2300 năm trước và được thảo luận bởi nhà toán học người Anh George Boole vào năm 1854 trong cuốn sách *The Laws of Thought*. |
| 5 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S009_P01 | math | 10 | math_chapter_01 | math_g10_bai01_3b75b9bd | Luyện tập 1 | 0.4489 | Thay dấu “?” bằng dấu “✓” vào ô thích hợp trong bảng sau: \| Câu \| Không là mệnh đề \| Mệnh đề đúng \| Mệnh đề sai \| \| ------------------------------------------------------------------------- \| ---------------- \| ------------ \| ----------- \| \| 13 là số nguyên... |
| 6 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S039_P01 | math | 10 | math_chapter_01 | math_g10_bai01_3b75b9bd | Luyện tập 6 | 0.4232 | Trong tiết học môn Toán, Nam phát biểu: > Mọi số thực đều có bình phương khác 1. Mai phát biểu: > Có một số thực mà bình phương của nó bằng 1. a) Hãy cho biết bạn nào phát biểu đúng. b) Dùng kí hiệu $\forall$, $\exists$ để viết lại các phát biểu của Nam và... |
| 7 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S008_P01 | math | 10 | math_chapter_01 | math_g10_bai01_3b75b9bd | Giải | 0.4207 | Vì phương trình $3x^2 - 5x + 2 = 0$ có nghiệm nguyên $x = 1$ nên câu a là đúng. Câu b là sai. Do đó, câu a và câu b là những mệnh đề. Câu c là câu hỏi; câu d là câu cảm thán, nêu lên ý kiến của người nói. Do đó, không xác định được tính đúng sai. Vậy các câ... |
| 8 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S028_P01 | math | 10 | math_chapter_01 | math_g10_bai01_3b75b9bd | Luyện tập 3 | 0.3936 | Cho các mệnh đề: $P$: “$a$ và $b$ chia hết cho $c$”; $Q$: “$a + b$ chia hết cho $c$”. a) Hãy phát biểu định lí $P \Rightarrow Q$. Nêu giả thiết, kết luận của định lí và phát biểu định lí này dưới dạng điều kiện cần, điều kiện đủ. b) Hãy phát biểu mệnh đề đả... |
| 9 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S040_P01 | math | 10 | math_chapter_01 | math_g10_bai01_3b75b9bd | 1.1 | 0.3815 | Trong các câu sau, câu nào là mệnh đề? a) Trung Quốc là nước đông dân nhất thế giới; b) Bạn học trường nào? c) Không được làm việc riêng trong giờ học; d) Tôi sẽ sút bóng trúng xà ngang. --- |
| 10 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S027_P01 | math | 10 | math_chapter_01 | math_g10_bai01_3b75b9bd | Giải | 0.3584 | Mệnh đề đảo là: > Nếu tam giác $ABC$ là tam giác cân thì tam giác $ABC$ là tam giác đều. Mệnh đề đảo này là sai. --- |

### REAL_EVAL50_PHYS_013

- Subject/grade/type: physics / 12 / comparison
- Question: So sánh các khái niệm hoặc đại lượng chính được nêu trong mục Phản ứng tổng hợp hạt nhân.
- Current expected chunks: GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S031_P01
- Best gold rank: 4
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
**Phản ứng tổng hợp hạt nhân** là phản ứng hạt nhân trong đó hai hay nhiều hạt nhân nhẹ tổng hợp lại thành một hạt nhân nặng hơn. Từ đồ thị Hình 22.5, có thể thấy quá trình các hạt nhân nhẹ, ứng với đoạn đồ thị $MN$, tổng hợp thành hạt nhân có số khối nặng hơn, ứng với đoạn đồ thị $NT$, sẽ thu được hạt nhân bền vững hơn vì hạt nhân đó có năng lượng liên kết riêng lớn hơn. Vào năm 1927, **Oliphant** đã dùng máy gia tốc để các hạt nhân hydrogen tương tác với nhau, tạo ra phản ứng tổng hợp hạt nhân đầu tiên trên thế giới: $$ {}^2_1H+{}^3_1H\rightarrow{}^4_2He+{}^1_0n $$ Phản ứng này tỏa năng lượng khoảng: $$ 4\text{ MeV} $$ Vì các hạt nhân đều mang điện tích dương, nên muốn cho hai hạt nhân nhẹ có thể hợp lại thành hạt nhân nặng hơn, ta phải cung cấp cho chúng một động năng đủ lớn để: * Thắng lực đẩy tĩnh điện Coulomb giữa chúng. * Làm chúng tiến lại gần nhau đến mức lực hạt nhân phát hu...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S033_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai22_f183c801 | Câu hỏi | 0.5898 | 1. Sự tổng hợp hạt nhân là gì? Nêu điều kiện xảy ra phản ứng tổng hợp hạt nhân. 2. So sánh định tính phản ứng tổng hợp hạt nhân và phản ứng phân hạch về các đặc điểm: * Nhiên liệu phản ứng. * Điều kiện xảy ra phản ứng. --- |
| 2 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S007_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai22_f183c801 | a) Phản ứng hạt nhân kích thích | 0.5692 | Phản ứng hạt nhân kích thích là quá trình các hạt nhân tương tác với các hạt khác, ví dụ như hạt nhân, neutron,... tạo ra các hạt nhân mới. Ví dụ: * Phản ứng phân hạch. * Phản ứng tổng hợp hạt nhân. --- |
| 3 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S010_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai22_f183c801 | 1.3. Định luật bảo toàn số khối và bảo toàn điện tích trong phản ứng hạt nhân | 0.5600 | Phản ứng hạt nhân là một quá trình vật lí. Trong đó, hệ các hạt tương tác được xem là hệ kín. Do đó, phản ứng hạt nhân tuân theo nhiều định luật bảo toàn. --- |
| 4 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S031_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai22_f183c801 | 4. Phản ứng tổng hợp hạt nhân | 0.5585 | **Phản ứng tổng hợp hạt nhân** là phản ứng hạt nhân trong đó hai hay nhiều hạt nhân nhẹ tổng hợp lại thành một hạt nhân nặng hơn. Từ đồ thị Hình 22.5, có thể thấy quá trình các hạt nhân nhẹ, ứng với đoạn đồ thị $MN$, tổng hợp thành hạt nhân có số khối nặng... |
| 5 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S034_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai22_f183c801 | 5. Em đã học | 0.5565 | > Phản ứng hạt nhân là quá trình biến đổi từ hạt nhân này thành hạt nhân khác, bao gồm phản ứng hạt nhân kích thích và phản ứng hạt nhân tự phát. > Trong phản ứng hạt nhân, số khối và điện tích của hệ được bảo toàn. > Phản ứng phân hạch là phản ứng hạt nhân... |
| 6 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S014_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai22_f183c801 | 2.1. Lực hạt nhân và năng lượng liên kết | 0.5055 | Lực tương tác giữa các nucleon trong hạt nhân là lực hút, gọi là **lực hạt nhân**. Lực hạt nhân có tác dụng liên kết các nucleon với nhau. Lực hạt nhân không phải là lực tĩnh điện, vì nó không phụ thuộc vào điện tích của nucleon. So với lực điện từ và lực h... |
| 7 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S013_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai22_f183c801 | Câu hỏi | 0.5043 | 1. Hãy viết biểu thức liên hệ giữa các số khối và biểu thức liên hệ giữa các điện tích của các hạt nhân trong phản ứng hạt nhân. 2. Khi bắn phá uranium bằng neutron $n$, người ta thấy chúng hợp nhất thành hạt nhân $X$, ngay sau đó hạt nhân $X$ phân rã thành... |
| 8 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S035_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai22_f183c801 | 6. Em có thể | 0.4932 | > Nêu được nguyên tắc để biến một chất bất kì thành một chất mong muốn. > Nêu được tiềm năng khai thác sử dụng năng lượng hạt nhân. > Giải thích được vì sao phản ứng phân hạch và tổng hợp hạt nhân tỏa năng lượng. > Giải thích được nguồn gốc vạn vật. |
| 9 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S005_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai22_f183c801 | Câu hỏi | 0.4703 | > So sánh tổng số điện tích, tổng số nucleon của các hạt nhân trước và sau khi tương tác trong thí nghiệm như mô tả ở Hình 22.2. --- |
| 10 | GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S003_P01 | physics | 12 | physics_chapter_04 | physics_g12_bai22_f183c801 | Hình 22.1 | 0.4615 | ![Hình 22.1 - Sơ đồ thí nghiệm của Rutherford](assets/images/hinh-22-1.png) **Nội dung hình** Hình biểu diễn sơ đồ thí nghiệm của Rutherford về phản ứng hạt nhân, gồm: * Nguồn phát hạt alpha. * Không khí chứa hạt nhân nitrogen. * Màn huỳnh quang. * Kính hiể... |

### REAL_EVAL50_CHEM_008

- Subject/grade/type: chemistry / 12 / concept
- Question: Trình bày ý chính của mục a) Khái niệm.
- Current expected chunks: GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S003_P01
- Best gold rank: 4
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: expected_chunk_missing_question_keywords
- Recommendation: rewrite_question
- Human decision: _empty_

Current expected chunk excerpt:

```text
Hãy nhận xét đặc điểm chung về cấu tạo của các amino acid dưới đây: 📷 **Hình 9.1.** Cấu tạo, tên thông thường, kí hiệu của một số amino acid: glycine (Gly), alanine (Ala), valine (Val), lysine (Lys), glutamic acid (Glu). Amino acid là hợp chất hữu cơ tạp chức, trong phân tử chứa đồng thời nhóm amino (-NH₂) và nhóm carboxyl (-COOH). Các amino acid thiên nhiên hầu hết là α-amino acid, có công thức chung dạng: ```text H₂N-CH(R)-COOH ``` Trong đó, chỉ có khoảng 20 amino acid cấu thành nên phần lớn protein trong cơ thể người, gọi là những amino acid tiêu chuẩn. Một số amino acid tiêu chuẩn mà cơ thể người không thể tự tổng hợp được gọi là amino acid thiết yếu. Con người tiếp nhận amino acid thiết yếu qua thức ăn như thịt, cá, trứng, sữa,... ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S001_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai09_f4bd23ac | MỤC TIÊU | 0.4023 | * Nêu được khái niệm về amino acid, amino acid thiên nhiên, amino acid trong cơ thể; gọi được tên một số amino acid thông dụng, đặc điểm cấu tạo phân tử của amino acid. * Nêu được đặc điểm về tính chất vật lí của amino acid: trạng thái, nhiệt độ nóng chảy,... |
| 2 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S005_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai09_f4bd23ac | 2. Đặc điểm cấu tạo | 0.3217 | Các amino acid tồn tại chủ yếu ở dạng ion lưỡng cực do tương tác giữa nhóm -COOH và nhóm -NH₂: ```text H₂N-CH(R)-COOH ⇌ ⁺H₃N-CH(R)-COO⁻ ``` ```text Dạng phân tử trung hoà ⇌ Dạng ion lưỡng cực ``` Trong một số trường hợp, để đơn giản amino acid thường được b... |
| 3 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S004_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai09_f4bd23ac | b) Danh pháp | 0.2986 | Tên gọi amino acid xuất phát từ tên carboxylic acid tương ứng. Tên thay thế: chọn mạch chính chứa nhóm carboxyl, nhóm amino là nhóm thế trên mạch chính này. Tên bán hệ thống: vị trí của nhóm amino được kí hiệu bằng chữ cái Hy Lạp (α, β,...) và tên gọi acid... |
| 4 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S003_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai09_f4bd23ac | a) Khái niệm | 0.2945 | Hãy nhận xét đặc điểm chung về cấu tạo của các amino acid dưới đây: 📷 **Hình 9.1.** Cấu tạo, tên thông thường, kí hiệu của một số amino acid: glycine (Gly), alanine (Ala), valine (Val), lysine (Lys), glutamic acid (Glu). Amino acid là hợp chất hữu cơ tạp c... |
| 5 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S006_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai09_f4bd23ac | 3. Tính chất vật lí | 0.2730 | Ở điều kiện thường, các amino acid là chất rắn. Khi ở dạng tinh thể, chúng không có màu, có nhiệt độ nóng chảy cao và thường tan tốt trong nước vì tồn tại ở dạng ion lưỡng cực. --- |
| 6 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S009_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai09_f4bd23ac | b) Tính chất lưỡng tính | 0.2723 | Nhóm amino có tính base và nhóm carboxyl có tính acid nên các amino acid có tính lưỡng tính, có thể tác dụng với acid mạnh cũng như base mạnh. ```text HCl + H₂N-CH₂-COOH → Cl⁻H₃N⁺-CH₂-COOH ``` ```text H₂N-CH₂-COOH + NaOH → H₂N-CH₂-COONa + H₂O ``` Tính lưỡng... |
| 7 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S010_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai09_f4bd23ac | c) Tính chất điện di | 0.2702 | Các amino acid có khả năng di chuyển khác nhau trong điện trường tuỳ thuộc vào pH của môi trường, gọi là tính chất điện di. Ví dụ: Ở pH ≈ 6, Gly tồn tại chủ yếu ở dạng ion lưỡng cực có tổng điện tích bằng không. Khi đặt trong điện trường, Gly hầu như không... |
| 8 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S021_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai09_f4bd23ac | EM ĐÃ HỌC | 0.2695 | * Amino acid là hợp chất hữu cơ tạp chức, trong phân tử chứa đồng thời nhóm amino và nhóm carboxyl, tồn tại chủ yếu ở dạng ion lưỡng cực. * Hầu hết amino acid thiên nhiên là α-amino acid. * Amino acid là chất rắn, thường tan tốt trong nước, có nhiệt độ nóng... |
| 9 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S007_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai09_f4bd23ac | 4. Tính chất hoá học | 0.2660 | Tương tự các hợp chất hữu cơ tạp chức khác, amino acid có tính chất của các nhóm chức cấu thành: tính chất của nhóm amino và nhóm carboxyl; đồng thời có thêm tính chất gây ra bởi cả hai nhóm chức này. |
| 10 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S018_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai09_f4bd23ac | Thí nghiệm: Phản ứng màu biuret của peptide | 0.2606 | **Chuẩn bị:** * **Hoá chất:** dung dịch lòng trắng trứng (polypeptide), dung dịch CuSO₄ 2%, dung dịch NaOH 30%. * **Dụng cụ:** ống nghiệm. **Tiến hành:** * Cho khoảng 1 mL dung dịch NaOH 30% vào ống nghiệm. * Nhỏ thêm 2–3 giọt dung dịch CuSO₄ 2%, lắc đều. *... |

### REAL_EVAL50_MATH_008

- Subject/grade/type: math / 10 / concept
- Question: Trình bày ý chính của mục ận dụng.
- Current expected chunks: GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S022_P01
- Best gold rank: 4
- Error classification: success_top5, possible_bad_gold_label
- Gold label flags: expected_chunk_missing_question_keywords
- Recommendation: rewrite_question
- Human decision: _empty_

Current expected chunk excerpt:

```text
Một cửa hàng có kế hoạch nhập về hai loại máy tính $A$ và $B$, giá mỗi chiếc lần lượt là 10 triệu đồng và 20 triệu đồng với số vốn ban đầu không vượt quá 4 tỉ đồng. Loại máy $A$ mang lại lợi nhuận 2,5 triệu đồng cho mỗi máy bán được và loại máy $B$ mang lại lợi nhuận là 4 triệu đồng cho mỗi máy bán được. Cửa hàng ước tính rằng tổng nhu cầu hằng tháng sẽ không vượt quá 250 máy. Giả sử trong một tháng cửa hàng cần nhập số máy tính loại $A$ là $x$ và số máy tính loại $B$ là $y$. a) Viết các bất phương trình biểu thị các điều kiện của bài toán thành một hệ bất phương trình rồi xác định miền nghiệm của hệ đó. b) Gọi $F$ triệu đồng là lợi nhuận mà cửa hàng thu được trong tháng đó khi bán $x$ máy tính loại $A$ và $y$ máy tính loại $B$. Hãy biểu diễn $F$ theo $x$ và $y$. c) Tìm số lượng máy tính mỗi loại cửa hàng cần nhập về trong tháng đó để lợi nhuận thu được là lớn nhất. ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S012_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Giải | 0.4237 | **Bước 1.** Xác định miền nghiệm $D_1$ của bất phương trình: $$ 7x + 4y \le 2400 $$ và gạch bỏ miền còn lại. Vẽ đường thẳng: $$ d: 7x + 4y = 2400. $$ Vì: $$ 7 \cdot 0 + 4 \cdot 0 = 0 < 2400 $$ nên toạ độ điểm $O(0; 0)$ thoả mãn bất phương trình: $$ 7x + 4y... |
| 2 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S014_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Luyện tập 2 | 0.4108 | Biểu diễn miền nghiệm của hệ bất phương trình bậc nhất hai ẩn sau trên mặt phẳng toạ độ: $$ \begin{cases} x \ge 0,\ y > 0,\ x + y \le 100,\ 2x + y < 120. \end{cases} $$ --- |
| 3 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S024_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | 2.5 | 0.4065 | Biểu diễn miền nghiệm của mỗi hệ bất phương trình sau trên mặt phẳng toạ độ: a) $$ \begin{cases} y - x < -1,\ x > 0,\ y < 0. \end{cases} $$ b) $$ \begin{cases} x \le 0,\ y \ge 0,\ 2x + y \le 4. \end{cases} $$ c) $$ \begin{cases} x + y > 5,\ x - y < 0. \end{... |
| 4 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S022_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Vận dụng | 0.4065 | Một cửa hàng có kế hoạch nhập về hai loại máy tính $A$ và $B$, giá mỗi chiếc lần lượt là 10 triệu đồng và 20 triệu đồng với số vốn ban đầu không vượt quá 4 tỉ đồng. Loại máy $A$ mang lại lợi nhuận 2,5 triệu đồng cho mỗi máy bán được và loại máy $B$ mang lại... |
| 5 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S015_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | HĐ3 | 0.3852 | Xét biểu thức: $$ F(x; y) = 2x + 3y $$ với $(x; y)$ thuộc miền tam giác $OAB$ ở HĐ2. Toạ độ ba đỉnh là: $$ O(0; 0),\quad A(150; 0),\quad B(0; 150). $$ a) Tính giá trị của biểu thức $F(x; y)$ tại mỗi đỉnh $O$, $A$ và $B$. b) Nêu nhận xét về dấu của hoành độ... |
| 6 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S009_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | HĐ2 | 0.3845 | Cho đường thẳng: $$ d: x + y = 150 $$ trên mặt phẳng toạ độ $Oxy$. Đường thẳng này cắt hai trục toạ độ $Ox$ và $Oy$ tại hai điểm $A$ và $B$. a) Xác định các miền nghiệm $D_1$, $D_2$, $D_3$ của các bất phương trình tương ứng: $$ x \ge 0;\quad y \ge 0;\quad x... |
| 7 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S011_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Đề bài | 0.3834 | Biểu diễn miền nghiệm của hệ bất phương trình sau trên mặt phẳng toạ độ: $$ \begin{cases} 7x + 4y \le 2400,\ x + y \le 100,\ x \ge 0. \end{cases} $$ |
| 8 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S002_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Kiến thức, kĩ năng | 0.3812 | Sau bài học này, em có thể: * Nhận biết hệ bất phương trình bậc nhất hai ẩn. * Biết biểu diễn miền nghiệm của hệ bất phương trình bậc nhất hai ẩn trên mặt phẳng toạ độ. * Vận dụng kiến thức hệ bất phương trình bậc nhất hai ẩn vào giải quyết bài toán thực ti... |
| 9 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S016_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Nhận xét | 0.3786 | Tổng quát, người ta chứng minh được rằng giá trị lớn nhất hoặc nhỏ nhất của biểu thức: $$ F(x; y) = ax + by $$ với $(x; y)$ là toạ độ các điểm thuộc miền đa giác $A_1A_2...A_n$, tức là các điểm nằm bên trong hay nằm trên các cạnh của đa giác, đạt được tại m... |
| 10 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S020_P01 | math | 10 | math_chapter_02 | math_g10_bai04_5a72087c | Bước 2 | 0.3769 | Tính giá trị của biểu thức $F$ tại các đỉnh của tứ giác này: $$ F(0; 0) = 0, $$ $$ F(0; 100) = 200, $$ $$ F(20; 80) = 230, $$ $$ F(60; 0) = 210. $$ --- |

### REAL_EVAL_PHY11_SHM_PERIOD_001

- Subject/grade/type: physics / 11 / calculation
- Question: Một vật dao động điều hòa có ω = 4π rad/s. Tính chu kì T.
- Current expected chunks: TH_PHY11_C01_L02_029
- Best gold rank: 2
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
> Chu kì (T) là khoảng thời gian để vật thực hiện một dao động. > Đơn vị của chu kì là giây (s). > Tần số (f) là số dao động mà vật thực hiện được trong một giây. > Đơn vị của tần số là (1/s), gọi là héc (Hz). > Trong dao động điều hòa, giữa tần số góc (\omega), chu kì (T) và tần số (f) có mối liên hệ: > > $$ > \omega=\frac{2\pi}{T}=2\pi f > $$ > Đơn vị của tần số góc là rad/s. > Độ lệch pha giữa hai dao động điều hòa cùng chu kì luôn bằng độ lệch pha ban đầu. ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | TH_PHY11_C01_L02_005 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | Hình 2.1 | 0.7639 | ![Hình 2.1 - Đồ thị dao động điều hòa](assets/images/hinh-2-1.png) **Mô tả sơ bộ** * Đồ thị hình sin. * Trục tung: (x(m)), từ (-0,2) đến (0,2). * Đỉnh tại: $$ x=0,2 $$ ứng với: $$ t=0,1s;\qquad t=0,5s $$ * Cực tiểu tại: $$ x=-0,2 $$ ứng với: $$ t=0,3s $$ *... |
| 2 | TH_PHY11_C01_L02_029 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | Em đã học | 0.7311 | > Chu kì (T) là khoảng thời gian để vật thực hiện một dao động. > Đơn vị của chu kì là giây (s). > Tần số (f) là số dao động mà vật thực hiện được trong một giây. > Đơn vị của tần số là (1/s), gọi là héc (Hz). > Trong dao động điều hòa, giữa tần số góc (\om... |
| 3 | TH_PHY11_C01_L04_014 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Bài 1 | 0.6999 | Một vật dao động điều hòa có phương trình là: $$ x=2\cos\left(4\pi t-\frac{\pi}{6}\right) \quad(cm) $$ Hãy cho biết: * Biên độ * Tần số góc * Chu kì * Tần số * Pha ban đầu * Pha của dao động ở thời điểm: $$ t=1s $$ --- |
| 4 | TH_PHY11_C01_L02_025 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | Hoạt động 1 | 0.6667 | Xét một vật dao động điều hòa có: * Biên độ: $$ A=10cm $$ * Tần số: $$ f=5Hz $$ Tại thời điểm ban đầu ((t=0)), vật có li độ cực đại theo chiều dương. Yêu cầu: * Xác định chu kì, tần số góc, pha ban đầu của dao động. * Viết phương trình và vẽ đồ thị ((x-t))... |
| 5 | TH_PHY11_C01_L04_007 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Giải | 0.6438 | a. Tần số góc của dao động: $$ \omega=2\pi f=4\pi \quad(rad/s) $$ Khi: $$ t=0 $$ ta có: $$ x_0=A\cos\varphi=5cm $$ $$ v_0=-\omega A\sin\varphi=-30cm/s $$ Biên độ và pha ban đầu của dao động: $$ A=\sqrt{x^2+\frac{v^2}{\omega^2}} =\sqrt{5^2+\frac{(-30)^2}{(4\... |
| 6 | TH_PHY11_C01_L02_003 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | Các đại lượng đặc trưng | 0.6385 | * **Li độ**: (x) là độ dịch chuyển từ vị trí cân bằng đến vị trí của vật tại thời điểm (t). * **Biên độ**: (A) là độ dịch chuyển cực đại của vật tính từ vị trí cân bằng. * **Chu kì**: là khoảng thời gian để vật thực hiện được một dao động, kí hiệu là (T). *... |
| 7 | TH_PHY11_C01_L01_017 | physics | 11 | oscillation | PHY11_C01_L01_bai-1-dao-dong-dieu-hoa | 5. Em đã học | 0.6314 | > Dao động cơ là chuyển động qua lại của vật quanh vị trí cân bằng. > Dao động tuần hoàn là dao động trong đó, sau những khoảng thời gian bằng nhau, vật trở lại vị trí cũ theo hướng cũ. > Dao động điều hòa là dao động trong đó li độ của vật là một hàm cosin... |
| 8 | TH_PHY11_C01_L02_008 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | 2.1. Pha ban đầu | 0.6226 | Hình 2.2 là đồ thị của hai vật dao động điều hòa cùng chu kì, cùng biên độ nhưng dao động 1 luôn đạt tới giá trị cực đại sớm hơn dao động 2 một thời gian là: $$ \frac{T}{4} $$ Từ đồ thị ta thấy: * Tại thời điểm ban đầu ((t=0)), vật dao động điều hòa 1 đang... |
| 9 | TH_PHY11_C01_L04_023 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Em có thể | 0.6221 | > Xác định được chu kì, tần số, tần số góc và viết phương trình của vật dao động điều hòa. Ví dụ: Đồng hồ quả lắc. |
| 10 | TH_PHY11_C01_L04_018 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Bài 4 | 0.6158 | Hình 4.3 là đồ thị li độ – thời gian của một vật dao động điều hòa. a. Xác định biên độ, chu kì, tần số, tần số góc và pha ban đầu của vật dao động. b. Viết phương trình của dao động của vật. --- |

### REAL_EVAL_PHY11_SHM_POSITION_001

- Subject/grade/type: physics / 11 / calculation
- Question: Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Tính li độ tại t = 2 s.
- Current expected chunks: TH_PHY11_C01_L01_007, TH_PHY11_C01_L01_006
- Best gold rank: 2
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Một vật dao động điều hòa có phương trình: $$ x=2\cos\left(4\pi t+\frac{\pi}{2}\right)\text{ cm} $$ Hãy xác định: 1. Biên độ và pha ban đầu của dao động. 2. Pha và li độ của dao động tại thời điểm: $$ t=2\text{ s} $$ ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | TH_PHY11_C01_L04_014 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Bài 1 | 0.7436 | Một vật dao động điều hòa có phương trình là: $$ x=2\cos\left(4\pi t-\frac{\pi}{6}\right) \quad(cm) $$ Hãy cho biết: * Biên độ * Tần số góc * Chu kì * Tần số * Pha ban đầu * Pha của dao động ở thời điểm: $$ t=1s $$ --- |
| 2 | TH_PHY11_C01_L01_007 | physics | 11 | oscillation | PHY11_C01_L01_bai-1-dao-dong-dieu-hoa | Bài tập 1: Xác định các đại lượng từ phương trình dao động | 0.7364 | Một vật dao động điều hòa có phương trình: $$ x=2\cos\left(4\pi t+\frac{\pi}{2}\right)\text{ cm} $$ Hãy xác định: 1. Biên độ và pha ban đầu của dao động. 2. Pha và li độ của dao động tại thời điểm: $$ t=2\text{ s} $$ --- |
| 3 | TH_PHY11_C01_L04_002 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Ví dụ 1 | 0.6873 | Cho phương trình của một vật dao động điều hòa: $$ x=5\cos\left(10\pi t+\frac{\pi}{6}\right) \quad(cm) $$ Xác định biên độ (A), tần số (f), pha ban đầu (\varphi), và li độ (x), tại thời điểm: $$ t_1=0,05s $$ --- |
| 4 | TH_PHY11_C01_L04_015 | physics | 11 | oscillation | PHY11_C01_L04_bai-4-bai-tap-ve-dao-dong-dieu-hoa | Bài 2 | 0.6785 | Một vật dao động điều hòa dọc theo trục (Ox), quanh điểm gốc (O), với biên độ: $$ A=10cm $$ và chu kì: $$ T=2s $$ Tại thời điểm: $$ t=0 $$ vật có li độ: $$ x=A $$ a. Viết phương trình dao động của vật. b. Xác định thời điểm đầu tiên vật qua vị trí có li độ:... |
| 5 | TH_PHY11_C01_L02_008 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | 2.1. Pha ban đầu | 0.6728 | Hình 2.2 là đồ thị của hai vật dao động điều hòa cùng chu kì, cùng biên độ nhưng dao động 1 luôn đạt tới giá trị cực đại sớm hơn dao động 2 một thời gian là: $$ \frac{T}{4} $$ Từ đồ thị ta thấy: * Tại thời điểm ban đầu ((t=0)), vật dao động điều hòa 1 đang... |
| 6 | TH_PHY11_C01_L02_005 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | Hình 2.1 | 0.6470 | ![Hình 2.1 - Đồ thị dao động điều hòa](assets/images/hinh-2-1.png) **Mô tả sơ bộ** * Đồ thị hình sin. * Trục tung: (x(m)), từ (-0,2) đến (0,2). * Đỉnh tại: $$ x=0,2 $$ ứng với: $$ t=0,1s;\qquad t=0,5s $$ * Cực tiểu tại: $$ x=-0,2 $$ ứng với: $$ t=0,3s $$ *... |
| 7 | TH_PHY11_C01_L02_025 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | Hoạt động 1 | 0.6425 | Xét một vật dao động điều hòa có: * Biên độ: $$ A=10cm $$ * Tần số: $$ f=5Hz $$ Tại thời điểm ban đầu ((t=0)), vật có li độ cực đại theo chiều dương. Yêu cầu: * Xác định chu kì, tần số góc, pha ban đầu của dao động. * Viết phương trình và vẽ đồ thị ((x-t))... |
| 8 | TH_PHY11_C01_L02_026 | physics | 11 | oscillation | PHY11_C01_L02_bai-2-mo-ta-dao-dong-dieu-hoa | Hoạt động 2 | 0.6321 | Cho hai con lắc đơn dao động điều hòa. Biết phương trình dao động của con lắc thứ nhất là: $$ x=20\cos\left(20\pi t+\frac{\pi}{2}\right) \quad(cm) $$ Con lắc thứ hai có cùng biên độ và tần số nhưng lệch về thời gian so với con lắc thứ nhất một phần tư chu k... |
| 9 | TH_PHY11_C01_L01_017 | physics | 11 | oscillation | PHY11_C01_L01_bai-1-dao-dong-dieu-hoa | 5. Em đã học | 0.6143 | > Dao động cơ là chuyển động qua lại của vật quanh vị trí cân bằng. > Dao động tuần hoàn là dao động trong đó, sau những khoảng thời gian bằng nhau, vật trở lại vị trí cũ theo hướng cũ. > Dao động điều hòa là dao động trong đó li độ của vật là một hàm cosin... |
| 10 | TH_PHY11_C01_L01_006 | physics | 11 | oscillation | PHY11_C01_L01_bai-1-dao-dong-dieu-hoa | 2.2. Phương trình của dao động điều hòa | 0.6043 | Đồ thị hình sin có thể được biểu diễn bằng hàm sin hoặc hàm cosin. Ta chọn hàm cosin: $$ x=A\cos(\omega t+\varphi) \tag{1.1} $$ Đây được gọi là **phương trình của dao động điều hòa**. Trong phương trình: * $x$ là li độ của vật tại thời điểm $t$. * $A$ là bi... |

### REAL_EVAL50_PHYS_005

- Subject/grade/type: physics / 11 / phenomenon/experiment
- Question: Mô tả hiện tượng hoặc thí nghiệm được nêu trong mục Hiện tượng cộng hưởng trong đời sống.
- Current expected chunks: GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S019_P01
- Best gold rank: 3
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Cộng hưởng là một hiện tượng vật lí quan trọng có thể xuất hiện trong nhiều tình huống khác nhau. Trong một số trường hợp, hiện tượng cộng hưởng có lợi, như: * Hộp đàn của các đàn ghi ta, violon,... là những hộp cộng hưởng được cấu tạo sao cho không khí trong hộp có thể dao động cộng hưởng với nhiều tần số dao động khác nhau của dây đàn. * Nguyên tắc hoạt động của lò vi sóng dựa trên cộng hưởng. Ở các lò vi sóng này, sóng được sử dụng có tần số phù hợp với tần số dao động riêng của các phân tử nước trong thực phẩm. Các phân tử nước đóng vai trò là hệ cộng hưởng cũng dao động cưỡng bức, nên hấp thụ năng lượng của sóng được sử dụng và nóng lên. Tuy nhiên, trong một số trường hợp khác hiện tượng cộng hưởng lại có hại. Nhiều hệ dao động như tòa nhà, cầu, bệ máy, khung xe,... đều có một hay nhiều tần số riêng. Do vậy khi thiết kế cần tránh không để cho các hệ ấy chịu tác dụng của những lực...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S016_P01 | physics | 11 | physics_chapter_01 | physics_g11_bai06_5ddd353a | 3.1. Định nghĩa | 0.5250 | Từ kết quả thí nghiệm trên, ta có thể rút ra điều kiện để xảy ra hiện tượng cộng hưởng. Hiện tượng biên độ dao động cưỡng bức tăng đến giá trị cực đại khi tần số (f) của lực cưỡng bức tiến đến bằng tần số riêng (f_0) của hệ dao động gọi là **hiện tượng cộng... |
| 2 | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S022_P01 | physics | 11 | physics_chapter_01 | physics_g11_bai06_5ddd353a | Em có thể | 0.5173 | > Lấy được ví dụ thực tế về dao động tắt dần, dao động cưỡng bức và hiện tượng cộng hưởng. > Nhận biết được sự có lợi hay có hại của cộng hưởng và vận dụng nó vào cuộc sống. |
| 3 | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S019_P01 | physics | 11 | physics_chapter_01 | physics_g11_bai06_5ddd353a | 3.3. Hiện tượng cộng hưởng trong đời sống | 0.4968 | Cộng hưởng là một hiện tượng vật lí quan trọng có thể xuất hiện trong nhiều tình huống khác nhau. Trong một số trường hợp, hiện tượng cộng hưởng có lợi, như: * Hộp đàn của các đàn ghi ta, violon,... là những hộp cộng hưởng được cấu tạo sao cho không khí tro... |
| 4 | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S014_P01 | physics | 11 | physics_chapter_01 | physics_g11_bai06_5ddd353a | Thí nghiệm | 0.4261 | **Chuẩn bị** * Một thanh cứng hình trụ, hai đầu thanh được gắn vào hai ổ trục để thanh có thể xoay dễ dàng quanh trục của nó. * Một con lắc điều khiển Đ, ba con lắc thử 1, 2 và 3 được treo vào thanh cứng hình trụ. * Bố trí thí nghiệm như Hình 6.3. **Tiến hà... |
| 5 | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S017_P01 | physics | 11 | physics_chapter_01 | physics_g11_bai06_5ddd353a | Hình 6.4 | 0.4256 | ![Hình 6.4 - Đồ thị cộng hưởng](assets/images/hinh-6-4.png) **Nội dung hình** Đồ thị cộng hưởng biểu diễn sự phụ thuộc của biên độ dao động cưỡng bức vào tần số của lực cưỡng bức. --- |
| 6 | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S021_P01 | physics | 11 | physics_chapter_01 | physics_g11_bai06_5ddd353a | Em đã học | 0.4185 | > Dao động có biên độ giảm dần theo thời gian gọi là dao động tắt dần. > Nguyên nhân làm dao động tắt dần là do lực ma sát và lực cản của môi trường. > Dao động chịu tác dụng của một ngoại lực cưỡng bức tuần hoàn gọi là dao động cưỡng bức. > Dao động cưỡng... |
| 7 | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S009_P01 | physics | 11 | physics_chapter_01 | physics_g11_bai06_5ddd353a | Câu hỏi | 0.4058 | > Hãy tìm trong thực tế ví dụ về dao động tắt dần và cho biết trong mỗi trường hợp thì dao động tắt dần là có lợi hay có hại. --- |
| 8 | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S015_P01 | physics | 11 | physics_chapter_01 | physics_g11_bai06_5ddd353a | Hình 6.3 | 0.4029 | ![Hình 6.3 - Thí nghiệm về dao động cưỡng bức](assets/images/hinh-6-3.png) **Nội dung hình** Thí nghiệm về dao động cưỡng bức gồm một con lắc điều khiển Đ và ba con lắc thử 1, 2, 3 treo vào thanh cứng hình trụ. --- |
| 9 | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S005_P01 | physics | 11 | physics_chapter_01 | physics_g11_bai06_5ddd353a | Thí nghiệm | 0.3906 | **Chuẩn bị** * Con lắc có quả nặng gắn bút dạ. * Tấm nhựa để ghi đồ thị dao động. * Bộ phận tạo chuyển động đều cho tấm nhựa. **Tiến hành** * Bố trí thí nghiệm như Hình 6.1b. * Cho con lắc dao động ổn định và tấm nhựa chuyển động đều, bút dạ gắn ở vật nặng... |
| 10 | GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S004_P01 | physics | 11 | physics_chapter_01 | physics_g11_bai06_5ddd353a | Câu hỏi | 0.3822 | > Hãy giải thích tại sao dao động của em bé chơi xích đu trong ví dụ ở đầu bài lại tắt dần nếu không có người mẹ thỉnh thoảng đẩy nhẹ vào em bé. --- |

### REAL_EVAL50_PHYS_010

- Subject/grade/type: physics / 11 / definition
- Question: Theo học liệu, Đặc điểm của sóng dừng là gì?
- Current expected chunks: TH_PHY11_C02_L13_006
- Best gold rank: 2
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Sóng dừng được tạo thành mỗi khi có hai sóng cùng biên độ, cùng bước sóng lan truyền theo hai hướng ngược nhau. Hai sóng này gặp nhau, giao thoa nhau tạo nên sóng tổng hợp là **sóng dừng**. Những điểm tại đó hai sóng ngược pha nhau thì không dao động và được gọi là **nút sóng**. Những điểm tại đó hai sóng đồng pha với nhau thì dao động với biên độ cực đại và được gọi là **bụng sóng** như Hình 13.2. Trong thực tế, ta thường gặp một trong hai sóng là sóng phản xạ của sóng kia. Sóng dừng là tổng hợp của nhiều sóng tới và sóng phản xạ. ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | TH_PHY11_C02_L13_022 | physics | 11 | waves | PHY11_C02_L13_bai-13-song-dung | Em đã học | 0.6658 | > Hai sóng cùng biên độ, cùng tần số lan truyền theo hai hướng ngược nhau trên một dây giao thoa với nhau tạo nên một sóng tổng hợp gọi là sóng dừng. > Trong sóng dừng có những điểm luôn đứng yên gọi là nút sóng và những điểm luôn dao động với biên độ cực đ... |
| 2 | TH_PHY11_C02_L13_006 | physics | 11 | waves | PHY11_C02_L13_bai-13-song-dung | 2.1. Đặc điểm của sóng dừng | 0.6543 | Sóng dừng được tạo thành mỗi khi có hai sóng cùng biên độ, cùng bước sóng lan truyền theo hai hướng ngược nhau. Hai sóng này gặp nhau, giao thoa nhau tạo nên sóng tổng hợp là **sóng dừng**. Những điểm tại đó hai sóng ngược pha nhau thì không dao động và đượ... |
| 3 | TH_PHY11_C02_L12_006 | physics | 11 | waves | PHY11_C02_L12_bai-12-giao-thoa-song | 1.2. Giải thích | 0.6015 | a. Để giải thích hiện tượng trên, ta cần biết thêm một đặc điểm nữa của chuyển động sóng: Mỗi nguồn sóng phát ra một sóng có các gợn sóng là những đường tròn giống hệt như khi không có các nguồn sóng khác ở bên cạnh. Những điểm nào cách nguồn một khoảng bằn... |
| 4 | TH_PHY11_C02_L13_003 | physics | 11 | waves | PHY11_C02_L13_bai-13-song-dung | Tiến hành | 0.5601 | **Bước 1:** Giữ cho dây căng, đầu (P) mắc vào ròng rọc, đầu rung mắc vào dây như Hình 13.1. **Bước 2:** Cho bộ rung hoạt động để rung đầu (P). Điều chỉnh tần số của bộ rung cho đến khi trên dây xuất hiện những điểm dao động với biên độ cực đại và có những đ... |
| 5 | TH_PHY11_C02_L12_019 | physics | 11 | waves | PHY11_C02_L12_bai-12-giao-thoa-song | Em đã học | 0.5516 | > Hai nguồn sóng kết hợp là hai nguồn có cùng tần số và có độ lệch pha không đổi theo thời gian. > Hai sóng do hai nguồn kết hợp phát ra là hai sóng kết hợp. > Hiện tượng giao thoa là hiện tượng khi hai sóng kết hợp gặp nhau thì có những điểm ở đó hai sóng... |
| 6 | TH_PHY11_C02_L08_021 | physics | 11 | waves | PHY11_C02_L08_chuong-ii-song | Em đã học | 0.5474 | > Sóng cơ là những biến dạng cơ lan truyền trong một môi trường đàn hồi. > Biên độ sóng (A) là độ cao hay độ sâu của một ngọn sóng so với mức cân bằng. > Biên độ sóng bằng biên độ dao động của nguồn sóng. > Chu kì (T) của sóng là khoảng thời gian để hai ngọ... |
| 7 | TH_PHY11_C02_L12_008 | physics | 11 | waves | PHY11_C02_L12_bai-12-giao-thoa-song | 1.3. Điều kiện để xảy ra giao thoa | 0.5464 | Để xảy ra hiện tượng giao thoa, hai nguồn sóng phải: * Dao động cùng phương, cùng tần số. * Có độ lệch pha không đổi theo thời gian. Hai nguồn như vậy gọi là **hai nguồn kết hợp**. Hai sóng do hai nguồn kết hợp phát ra gọi là **hai sóng kết hợp**. Hiện tượn... |
| 8 | TH_PHY11_C02_L08_013 | physics | 11 | waves | PHY11_C02_L08_chuong-ii-song | Sự lệch pha của các phần tử môi trường trên phương truyền sóng | 0.5444 | Giả sử có một sóng mặt nước hình sin lan truyền từ nguồn (O) theo phương (Ox) như Hình 8.3. Tại thời điểm bắt đầu quan sát: $$ t=0 $$ phần tử nước tại (O) bắt đầu đi lên, còn các điểm khác chưa dao động. Tại: $$ t=\frac{T}{4} $$ phần tử nước tại (O) đi lên... |
| 9 | TH_PHY11_C02_L14_022 | physics | 11 | waves | PHY11_C02_L14_bai-14-bai-tap-ve-song | Em đã học | 0.5003 | > Cách xác định các đại lượng đặc trưng như chu kì, bước sóng, tốc độ truyền sóng,... khi biết phương trình hoặc đồ thị của sóng và ngược lại. --- |
| 10 | TH_PHY11_C02_L08_018 | physics | 11 | waves | PHY11_C02_L08_chuong-ii-song | Câu 2 | 0.4567 | Hình 8.4 là đồ thị ((u-t)) của một sóng âm trên màn hình của một dao động kí. Biết mỗi cạnh của ô vuông theo phương ngang trên hình tương ứng với: $$ 1ms $$ Tính tần số của sóng. --- |

### REAL_EVAL50_PHYS_011

- Subject/grade/type: physics / 12 / calculation
- Question: Trong mục Phương trình Clapeyron, bài hoặc công thức đang yêu cầu xác định đại lượng nào và dựa trên quan hệ nào?
- Current expected chunks: GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S009_P01
- Best gold rank: 3
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Có thể xác định được độ lớn của hằng số trong phương trình trạng thái của một lượng $n$ mol khí xác định. Số mol khí được xác định bởi: $$ n=\frac{m}{M} $$ Trong đó: * $m$ là khối lượng khí. * $M$ là khối lượng mol của lượng khí. Trước hết, cần xác định độ lớn của hằng số này đối với $1$ mol khí. Ở điều kiện tiêu chuẩn, một mol của bất kì khí nào đều có: * Thể tích: $$ V=22{,}4\cdot10^{-3}\text{ m}^3 $$ * Áp suất: $$ p=1{,}013\cdot10^5\text{ Pa} $$ * Nhiệt độ: $$ T=273\text{ K} $$ Do đó, đối với $1$ mol khí: $$ \frac{pV}{T} = \frac{1{,}013\cdot10^5\cdot22{,}4\cdot10^{-3}}{273} $$ $$ \frac{pV}{T}=8{,}31 $$ Hằng số: $$ R=8{,}31 $$ được gọi là **hằng số khí lí tưởng**. Đơn vị của hằng số khí lí tưởng là: $$ J/mol.K $$ Vì thể tích của $n$ mol khí bằng $n$ lần thể tích của $1$ mol khí ở cùng nhiệt độ và áp suất, nên nếu phương trình trạng thái của $1$ mol khí là: $$ \frac{pV}{T}=R $$ thì p...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S002_P01 | physics | 12 | physics_chapter_02 | physics_g12_bai11_52004a8e | 1.1. Phương trình trạng thái của một lượng khí xác định | 0.5408 | Hãy dựa vào các định luật Boyle, Charles và Hình 11.1 về quá trình chuyển trạng thái của một khối lượng khí xác định để lập phương trình về mối liên hệ giữa ba thông số trạng thái của một khối lượng khí xác định. Ta có: $$ \frac{p_1V_1}{T_1}=\frac{p_2V_2}{T... |
| 2 | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S016_P01 | physics | 12 | physics_chapter_02 | physics_g12_bai11_52004a8e | 3. Em đã học | 0.5301 | > Phương trình trạng thái của một khối lượng khí lí tưởng xác định: $$ \frac{pV}{T}=\text{hằng số} $$ Độ lớn của hằng số phụ thuộc vào lượng khí mà ta xét. > Phương trình trạng thái của khí lí tưởng, hay phương trình Clapeyron: $$ pV=nRT $$ Trong đó: * $R$... |
| 3 | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S009_P01 | physics | 12 | physics_chapter_02 | physics_g12_bai11_52004a8e | 1.2. Phương trình Clapeyron | 0.5158 | Có thể xác định được độ lớn của hằng số trong phương trình trạng thái của một lượng $n$ mol khí xác định. Số mol khí được xác định bởi: $$ n=\frac{m}{M} $$ Trong đó: * $m$ là khối lượng khí. * $M$ là khối lượng mol của lượng khí. Trước hết, cần xác định độ... |
| 4 | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S001_P01 | physics | 12 | physics_chapter_02 | physics_g12_bai11_52004a8e | Bài 11: Phương trình trạng thái của khí lí tưởng | 0.4928 | > Các định luật Boyle và Charles chỉ xác định mối liên hệ giữa hai cặp thông số “áp suất – thể tích” và “thể tích – nhiệt độ” của một khối lượng khí xác định. > > Vậy, làm thế nào để xác định được mối liên hệ của cả ba thông số trạng thái của một khối lượng... |
| 5 | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S004_P01 | physics | 12 | physics_chapter_02 | physics_g12_bai11_52004a8e | Câu hỏi | 0.4752 | 1. Hãy lập phương trình: $$ \frac{p_1V_1}{T_1}=\frac{p_2V_2}{T_2} $$ bằng một cách biến đổi trạng thái khác cách trong Hình 11.1 để chứng tỏ: > Quá trình chuyển trạng thái không phụ thuộc cách chuyển trạng thái mà chỉ phụ thuộc trạng thái đầu và trạng thái... |
| 6 | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S003_P01 | physics | 12 | physics_chapter_02 | physics_g12_bai11_52004a8e | Hình 11.1 | 0.4566 | ![Hình 11.1 - Quá trình chuyển trạng thái của một khối lượng khí xác định](assets/images/hinh-11-1.png) **Nội dung hình** Hình biểu diễn quá trình chuyển từ trạng thái $(1)$ qua trạng thái trung gian $(1')$ tới trạng thái $(2)$ của một khối lượng khí xác đị... |
| 7 | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S008_P01 | physics | 12 | physics_chapter_02 | physics_g12_bai11_52004a8e | Bước 3. Áp dụng phương trình trạng thái | 0.4483 | Theo phương trình trạng thái của một khối lượng khí xác định: $$ \frac{p_1V_1}{T_1}=\frac{p_2V_2}{T_2} $$ Suy ra: $$ p_2=\frac{p_1V_1T_2}{V_2T_1} $$ Thay số: $$ p_2=\frac{10^5\cdot100\cdot312}{20\cdot300} $$ $$ p_2=5{,}2\cdot10^5\text{ Pa} $$ --- |
| 8 | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S010_P01 | physics | 12 | physics_chapter_02 | physics_g12_bai11_52004a8e | 2. Vận dụng | 0.4351 | Phương trình trạng thái của khí lí tưởng có nhiều ứng dụng thực tế. Nó được dùng vào việc nghiên cứu, chế tạo các thiết bị có liên quan đến chất khí như: * Khí cầu. * Bình đựng khí. * Trang phục lặn. * Máy điều hòa không khí. * Máy nén khí. Phương trình này... |
| 9 | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S015_P01 | physics | 12 | physics_chapter_02 | physics_g12_bai11_52004a8e | Bài tập vận dụng 2 | 0.3986 | a) Viết phương trình phân hủy $NaN_3$. b) Tính lượng chất khí $N_2$ được giải phóng khi xảy ra phản ứng phân hủy $NaN_3$. Biết trong túi chứa: $$ 100\text{ g }NaN_3 $$ và thể tích mol là: $$ 24{,}0\text{ L/mol} $$ c) Biết thể tích túi khí khi phồng lên có đ... |
| 10 | GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S012_P01 | physics | 12 | physics_chapter_02 | physics_g12_bai11_52004a8e | Bài tập vận dụng 1 | 0.3803 | Người ta muốn chế tạo một bóng thám không có thể tăng bán kính lên tới: $$ R_2=10\text{ m} $$ khi bay ở tầng khí quyển có áp suất: $$ p_2=0{,}3\cdot10^5\text{ Pa} $$ và nhiệt độ: $$ T_2=200\text{ K} $$ Hỏi bán kính của bóng khi vừa bơm xong phải bằng bao nh... |

### REAL_EVAL50_CHEM_003

- Subject/grade/type: chemistry / 12 / concept
- Question: Trình bày ý chính của mục KHÁI NIỆM, ĐẶC ĐIỂM CẤU TẠO CỦA XÀ PHÒNG VÀ CHẤT GIẶT RỬA.
- Current expected chunks: GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S003_P01
- Best gold rank: 3
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Xà phòng là hỗn hợp muối sodium hoặc potassium của các acid béo và các chất phụ gia. Thành phần chủ yếu của xà phòng thường là muối sodium của palmitic acid hoặc stearic acid. Chất giặt rửa tổng hợp là các chất được tổng hợp hoá học, có tác dụng giặt rửa như xà phòng nhưng không phải là muối sodium, potassium của các acid béo. Những chất này thường là muối sodium alkylsulfate hoặc alkylbenzene sulfonate. Ngoài ra, một số sản phẩm từ thiên nhiên cũng có tác dụng giặt rửa như nước quả bồ kết, quả bồ hòn,... gọi là chất giặt rửa tự nhiên. Cấu tạo của xà phòng và chất giặt rửa phổ biến thường gồm hai phần: * Phần phân cực (“đầu” ưa nước): là nhóm carboxylate (xà phòng) hoặc nhóm sulfate, sulfonate (chất giặt rửa tổng hợp). Phần này có thể hoà tan được trong nước. * Phần không phân cực (“đuôi” kị nước): là gốc hydrocarbon có mạch dài (R). Phần này không tan trong nước. 📷 **Hình 2.1.** Cấu...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S001_P01 | chemistry | 12 | chemistry_chapter_01 | chemistry_g12_bai02_6f1d2bc6 | MỤC TIÊU | 0.5373 | * Nêu được khái niệm, đặc điểm về cấu tạo và tính chất giặt rửa của xà phòng và chất giặt rửa tự nhiên, tổng hợp. * Trình bày được một số phương pháp sản xuất xà phòng, phương pháp chủ yếu sản xuất chất giặt rửa tổng hợp. * Thực hiện được hoặc quan sát vide... |
| 2 | GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S004_P01 | chemistry | 12 | chemistry_chapter_01 | chemistry_g12_bai02_6f1d2bc6 | Câu hỏi | 0.4392 | 1. Em hãy nêu sự giống và khác nhau về cấu tạo giữa xà phòng và chất giặt rửa tổng hợp. 2. Trong các chất sau, chất nào là xà phòng, chất nào là chất giặt rửa tổng hợp? Xác định đầu ưa nước và đuôi kị nước của các chất này. a) ```text CH₃[CH₂]₁₄COONa ``` b)... |
| 3 | GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S003_P01 | chemistry | 12 | chemistry_chapter_01 | chemistry_g12_bai02_6f1d2bc6 | I. KHÁI NIỆM, ĐẶC ĐIỂM CẤU TẠO CỦA XÀ PHÒNG VÀ CHẤT GIẶT RỬA | 0.4024 | Xà phòng là hỗn hợp muối sodium hoặc potassium của các acid béo và các chất phụ gia. Thành phần chủ yếu của xà phòng thường là muối sodium của palmitic acid hoặc stearic acid. Chất giặt rửa tổng hợp là các chất được tổng hợp hoá học, có tác dụng giặt rửa nh... |
| 4 | GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S012_P01 | chemistry | 12 | chemistry_chapter_01 | chemistry_g12_bai02_6f1d2bc6 | EM CÓ THỂ | 0.4004 | Biết được đặc điểm cấu tạo, tính chất, các ưu, nhược điểm của xà phòng và chất giặt rửa để lựa chọn và sử dụng chúng hợp lí, an toàn trong đời sống. |
| 5 | GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S006_P01 | chemistry | 12 | chemistry_chapter_01 | chemistry_g12_bai02_6f1d2bc6 | 1. Phương pháp sản xuất xà phòng | 0.3588 | Xà phòng được sản xuất bằng cách đun chất béo với dung dịch NaOH đặc hoặc KOH đặc (phản ứng xà phòng hoá): ```text Chất béo + NaOH/KOH đặc → Glycerol + Muối sodium/potassium của acid béo t° ``` Muối sodium hoặc potassium của acid béo là thành phần chính của... |
| 6 | GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S005_P01 | chemistry | 12 | chemistry_chapter_01 | chemistry_g12_bai02_6f1d2bc6 | II. TÍNH CHẤT GIẶT RỬA | 0.3544 | Khi xà phòng, chất giặt rửa tan vào nước sẽ tạo dung dịch có sức căng bề mặt nhỏ, làm cho vật cần giặt rửa dễ thấm ướt. Đuôi kị nước trong xà phòng và chất giặt rửa thâm nhập vào vết bẩn, phân chia vết bẩn thành những hạt rất nhỏ có đầu ưa nước quay ra ngoà... |
| 7 | GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S008_P01 | chemistry | 12 | chemistry_chapter_01 | chemistry_g12_bai02_6f1d2bc6 | 2. Phương pháp sản xuất chất giặt rửa tổng hợp | 0.3138 | Chất giặt rửa tổng hợp được sản xuất từ dầu mỏ theo sơ đồ sau: ```text Dầu mỏ → R-SO₃H → R-SO₃Na Dầu mỏ → R-OSO₃H → R-OSO₃Na ``` Muối sulfonate hoặc muối sulfate được trộn với một số chất phụ gia khác nhau để tạo thành chất giặt rửa tổng hợp. (*) Quá trình... |
| 8 | GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S007_P01 | chemistry | 12 | chemistry_chapter_01 | chemistry_g12_bai02_6f1d2bc6 | Thí nghiệm: Phản ứng xà phòng hoá chất béo | 0.3094 | **Chuẩn bị:** * Hoá chất: chất béo (dầu thực vật hoặc mỡ động vật), dung dịch NaOH 40%, dung dịch NaCl bão hoà. * Dụng cụ: bát sứ, cốc thuỷ tinh, đũa thuỷ tinh, kiềng sắt, đèn cồn. **Tiến hành:** * Cho khoảng 2 g chất béo và khoảng 4 mL dung dịch NaOH 40% v... |
| 9 | GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S009_P01 | chemistry | 12 | chemistry_chapter_01 | chemistry_g12_bai02_6f1d2bc6 | EM CÓ BIẾT | 0.2796 | Bột giặt tổng hợp có thành phần chính gồm: chất tạo hạt bột giặt, chất giặt rửa tổng hợp, chất tẩy trắng, enzyme. Ngoài ra, chúng còn có thêm chất chống lắng đọng, chất điều chỉnh bọt, chất tạo huỳnh quang, chất tạo hương, chất độn,... --- |
| 10 | GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S010_P01 | chemistry | 12 | chemistry_chapter_01 | chemistry_g12_bai02_6f1d2bc6 | IV. ỨNG DỤNG CỦA XÀ PHÒNG VÀ CHẤT GIẶT RỬA | 0.2789 | Xà phòng được sử dụng để tắm, rửa tay,... Chất giặt rửa tổng hợp được sử dụng để giặt quần áo, rửa chén bát, rửa tay, lau sàn,... Hiện nay, chất giặt rửa tổng hợp được sử dụng phổ biến là do: chất giặt rửa dễ hoà tan trong nước hơn xà phòng; chất giặt rửa c... |

### REAL_EVAL50_CHEM_006

- Subject/grade/type: chemistry / 12 / definition
- Question: Theo học liệu, Khái niệm và đặc điểm cấu tạo là gì?
- Current expected chunks: GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S003_P01
- Best gold rank: 3
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Insulin, một loại hormone thuộc loại protein, được sản sinh bởi tuyến tụy, có chức năng điều hoà quá trình chuyển hoá glucose trong cơ thể. Insulin thúc đẩy sự hấp thu glucose của các tế bào và dự trữ glucose dư thừa trong gan và cơ. Insulin có cấu tạo được mô tả trong Hình 10.1. Hãy nhận xét về thành phần cấu tạo và phân tử khối của insulin. 📷 **Hình 10.1.** Cấu tạo của insulin. Protein là hợp chất cao phân tử được cấu tạo từ một hay nhiều chuỗi polypeptide. Mỗi chuỗi polypeptide gồm các đơn vị α-amino acid liên kết với nhau qua liên kết peptide theo một trật tự nhất định. Protein khi thuỷ phân chỉ cho hỗn hợp các α-amino acid gọi là protein đơn giản. Protein phức tạp là loại protein được tạo thành từ protein đơn giản và các thành phần “phi protein” như nucleic acid, lipid,... ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S001_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai10_f2d22dc6 | MỤC TIÊU | 0.5596 | * Nêu được khái niệm, đặc điểm cấu tạo phân tử, tính chất vật lí của protein. * Trình bày được tính chất hoá học đặc trưng của protein: phản ứng thuỷ phân, phản ứng màu của protein với nitric acid và copper(II) hydroxide; sự đông tụ bởi nhiệt, bởi acid, kiề... |
| 2 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S002_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai10_f2d22dc6 | MỞ ĐẦU | 0.5034 | Các protein khác nhau đảm nhận nhiều vai trò thiết yếu khác nhau với sự sống như xây dựng tế bào, xúc tác cho các quá trình sinh hoá, điều hoà quá trình trao đổi chất, vận chuyển chất, kháng thể,... Vậy, protein có đặc điểm cấu tạo và tính chất đặc trưng là... |
| 3 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S003_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai10_f2d22dc6 | 1. Khái niệm và đặc điểm cấu tạo | 0.4826 | Insulin, một loại hormone thuộc loại protein, được sản sinh bởi tuyến tụy, có chức năng điều hoà quá trình chuyển hoá glucose trong cơ thể. Insulin thúc đẩy sự hấp thu glucose của các tế bào và dự trữ glucose dư thừa trong gan và cơ. Insulin có cấu tạo được... |
| 4 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S007_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai10_f2d22dc6 | Thí nghiệm: Phản ứng đông tụ và phản ứng màu của protein | 0.3517 | **Chuẩn bị:** * **Hoá chất:** dung dịch HNO₃ đặc, dung dịch lòng trắng trứng. * **Dụng cụ:** ống nghiệm, đèn cồn. **Tiến hành:** * Cho vào hai ống nghiệm (1) và (2), mỗi ống 2 mL dung dịch lòng trắng trứng. * Đun nóng ống nghiệm (1) trên ngọn lửa đèn cồn tr... |
| 5 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S006_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai10_f2d22dc6 | b) Phản ứng màu | 0.3343 | Protein có khả năng tạo thành sản phẩm màu tím đặc trưng với thuốc thử biuret, tương tự như peptide. Protein hình thành sản phẩm rắn màu vàng với dung dịch nitric acid đặc, một phần do phản ứng nitro hoá các đơn vị amino acid chứa vòng benzene và một phần k... |
| 6 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S005_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai10_f2d22dc6 | a) Phản ứng thuỷ phân | 0.3178 | Tương tự như peptide, protein bị thuỷ phân bởi acid, base hoặc enzyme. Quá trình thuỷ phân hoàn toàn protein tạo thành các α-amino acid. --- |
| 7 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S004_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai10_f2d22dc6 | 2. Tính chất vật lí | 0.3162 | Các protein dạng hình sợi như keratin có ở tóc, móng; collagen có ở da, sụn; myosin có ở cơ bắp,... không tan trong nước cũng như trong các dung môi thông thường. Các protein dạng hình cầu như hemoglobin có ở máu, albumin có ở lòng trắng trứng có thể tan đư... |
| 8 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S012_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai10_f2d22dc6 | EM ĐÃ HỌC | 0.3124 | * Protein là hợp chất cao phân tử được cấu tạo từ một hay nhiều chuỗi polypeptide. * Protein dạng hình sợi không tan trong nước và các dung môi thông thường; protein dạng hình cầu tan trong nước tạo dung dịch keo. * Protein bị đông tụ dưới tác dụng của nhiệ... |
| 9 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S008_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai10_f2d22dc6 | 4. Vai trò của protein đối với sự sống | 0.2917 | Các protein khác nhau đảm nhận vai trò khác nhau, rất cần thiết cho sự sống như tham gia xây dựng tế bào, vận chuyển các chất trong cơ thể, điều hoà quá trình trao đổi chất, xúc tác cho các phản ứng hoá sinh, giúp cơ thể chống lại tác nhân có hại,... Protei... |
| 10 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S013_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai10_f2d22dc6 | EM CÓ THỂ | 0.2854 | * Giải thích được hiện tượng đông tụ protein trong quá trình chế biến một số thực phẩm giàu protein. * Lựa chọn và sử dụng một số nguồn cung cấp protein phù hợp trong chế độ ăn uống để đảm bảo sức khoẻ. --- *Nguồn: Nelson, D. L., Cox, M. & Aaron, A. H. 2021... |

### REAL_EVAL50_CHEM_009

- Subject/grade/type: chemistry / 12 / phenomenon/experiment
- Question: Mô tả hiện tượng hoặc thí nghiệm được nêu trong mục Thí nghiệm: Phản ứng của nhóm amine.
- Current expected chunks: GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S012_P01
- Best gold rank: 2
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
**Chuẩn bị:** * **Hoá chất:** dung dịch methylamine 0,1 M, dung dịch HCl 0,1 M, dung dịch FeCl₃ 0,1 M, dung dịch CuSO₄ 0,1 M, giấy pH/giấy quỳ tím, phenolphthalein. * **Dụng cụ:** ống nghiệm, mặt kính đồng hồ. **Tiến hành:** **1. Phản ứng với chất chỉ thị** * Nhỏ một giọt dung dịch methylamine 0,1 M lên mẫu giấy pH hoặc giấy quỳ tím đặt trên mặt kính đồng hồ. * Quan sát và mô tả sự thay đổi màu sắc của giấy pH. **2. Phản ứng với dung dịch acid** * Cho 2 mL dung dịch methylamine 0,1 M vào ống nghiệm, thêm tiếp 1 giọt phenolphthalein. * Nhỏ từ từ 2 mL dung dịch HCl 0,1 M vào ống nghiệm. * Quan sát hiện tượng xảy ra trong ống nghiệm, giải thích và viết phương trình hoá học. **3. Phản ứng với dung dịch muối** * Cho khoảng 1 mL dung dịch FeCl₃ 0,1 M vào ống nghiệm. * Thêm tiếp khoảng 3 mL dung dịch methylamine 0,1 M vào ống nghiệm. * Quan sát hiện tượng xảy ra trong ống nghiệm, giải thích...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S001_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai08_2133d6d3 | MỤC TIÊU | 0.7041 | * Nêu được khái niệm amine và phân loại amine theo bậc của amine và bản chất gốc hydrocarbon. * Viết được công thức cấu tạo và gọi được tên một số amine theo danh pháp thay thế, danh pháp gốc – chức (số nguyên tử C trong phân tử ≤ 5), tên thông thường của m... |
| 2 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S012_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai08_2133d6d3 | Thí nghiệm: Phản ứng của nhóm amine | 0.5881 | **Chuẩn bị:** * **Hoá chất:** dung dịch methylamine 0,1 M, dung dịch HCl 0,1 M, dung dịch FeCl₃ 0,1 M, dung dịch CuSO₄ 0,1 M, giấy pH/giấy quỳ tím, phenolphthalein. * **Dụng cụ:** ống nghiệm, mặt kính đồng hồ. **Tiến hành:** **1. Phản ứng với chất chỉ thị**... |
| 3 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S011_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai08_2133d6d3 | III. TÍNH CHẤT VẬT LÍ | 0.5693 | Xác định trạng thái của các amine trong Bảng 8.1 ở nhiệt độ phòng (25 °C). 📷 **Bảng 8.1.** Nhiệt độ nóng chảy và nhiệt độ sôi của một số amine. \| Amine \| Tên gọi \| Nhiệt độ nóng chảy (°C) \| Nhiệt độ sôi (°C) \| \| ------------- \| -------------- \| -----------... |
| 4 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S015_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai08_2133d6d3 | Thí nghiệm: Phản ứng của aniline với nước bromine | 0.5554 | **Chuẩn bị:** * **Hoá chất:** dung dịch aniline loãng, nước bromine. * **Dụng cụ:** ống nghiệm. **Tiến hành:** * Cho khoảng 1 mL nước bromine vào ống nghiệm. * Thêm từ từ vài giọt dung dịch aniline loãng vào ống nghiệm. **Yêu cầu:** Quan sát hiện tượng xảy... |
| 5 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S010_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai08_2133d6d3 | II. ĐẶC ĐIỂM CẤU TẠO | 0.5475 | Hình dạng phân tử của methylamine và aniline được mô tả ở Hình 8.1 dưới đây. 📷 **Hình 8.1.** Mô hình phân tử của methylamine (a) và aniline (b). Trong phân tử amine, nguyên tử nitrogen còn cặp electron chưa liên kết. Cấu tạo của amine tương tự ammonia nên... |
| 6 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S002_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai08_2133d6d3 | MỞ ĐẦU | 0.5043 | Amine có nhiều ứng dụng trong các lĩnh vực dược phẩm, hoá mĩ phẩm và phẩm nhuộm. Vậy, amine là gì? Đặc điểm cấu tạo và tính chất của amine là gì? --- |
| 7 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S014_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai08_2133d6d3 | 2. Phản ứng với nitrous acid | 0.4602 | Alkylamine bậc một tác dụng với nitrous acid ở nhiệt độ thường tạo thành alcohol và giải phóng khí nitrogen. Phản ứng này thường được dùng để nhận biết alkylamine bậc một. Ví dụ: ```text CH₃NH₂ + HONO → CH₃OH + N₂ + H₂O ``` Aniline tác dụng với nitrous acid... |
| 8 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S019_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai08_2133d6d3 | EM ĐÃ HỌC | 0.4576 | * Amine là dẫn xuất của ammonia, trong đó nguyên tử hydrogen trong phân tử ammonia được thay thế bằng gốc hydrocarbon. * Có thể phân loại amine theo bậc amine: amine bậc một, bậc hai và bậc ba; hoặc theo đặc điểm cấu tạo gốc hydrocarbon: alkylamine và aryla... |
| 9 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S018_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai08_2133d6d3 | 2. Khử hợp chất nitro | 0.4394 | Aniline và các arylamine thường được điều chế bằng cách khử hợp chất nitrobenzene hoặc dẫn xuất nitro tương ứng bởi một số kim loại như Zn, Fe,... trong dung dịch HCl. Ví dụ: ```text C₆H₅NO₂ + 6[H] → C₆H₅NH₂ + 2H₂O Fe + HCl, t° ``` --- |
| 10 | GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S006_P01 | chemistry | 12 | chemistry_chapter_03 | chemistry_g12_bai08_2133d6d3 | 3. Đồng phân | 0.4190 | Các amine có từ hai nguyên tử carbon trong phân tử bắt đầu xuất hiện hiện tượng đồng phân. Amine có thể có các đồng phân: bậc amine, mạch carbon và vị trí nhóm amine. |

### REAL_EVAL50_CHEM_011

- Subject/grade/type: chemistry / 10 / definition
- Question: Theo học liệu, Khái niệm tốc độ phản ứng hoá học là gì?
- Current expected chunks: GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S004_P01
- Best gold rank: 2
- Error classification: success_top3, success_top5, possible_bad_gold_label
- Gold label flags: candidate_may_be_better_than_gold
- Recommendation: keep_gold
- Human decision: _empty_

Current expected chunk excerpt:

```text
Khi phản ứng hoá học xảy ra, lượng chất đầu giảm dần theo thời gian, trong khi lượng chất sản phẩm tăng dần theo thời gian. 📷 **Hình 19.1.** Sự thay đổi lượng chất theo thời gian phản ứng. Tốc độ phản ứng được xác định bằng sự thay đổi lượng chất đầu hoặc chất sản phẩm trong một đơn vị thời gian. Đơn vị thời gian có thể là: - giây `(s)`; - phút `(min)`; - giờ `(h)`; - ngày `(d)`; - ... Lượng chất có thể được biểu diễn bằng: - số mol; - nồng độ mol; - khối lượng; - thể tích. Các phản ứng khác nhau xảy ra với tốc độ khác nhau. Có phản ứng xảy ra nhanh, có phản ứng xảy ra chậm. 📷 **Hình 19.2.** Phản ứng xảy ra nhanh và phản ứng xảy ra chậm: a) Than cháy. b) Sắt bị gỉ. c) Tinh bột lên men rượu. ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S002_P01 | chemistry | 10 | chemistry_chapter_06 | chemistry_g10_bai19_3f234005 | MỤC TIÊU | 0.7269 | - Trình bày được khái niệm tốc độ phản ứng hoá học và cách tính tốc độ trung bình của phản ứng. - Viết được biểu thức tốc độ phản ứng theo hằng số tốc độ phản ứng và nồng độ. - Nêu được ý nghĩa của hằng số tốc độ phản ứng. - Thực hiện được một số thí nghiệm... |
| 2 | GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S004_P01 | chemistry | 10 | chemistry_chapter_06 | chemistry_g10_bai19_3f234005 | 1. Khái niệm tốc độ phản ứng hoá học | 0.6221 | Khi phản ứng hoá học xảy ra, lượng chất đầu giảm dần theo thời gian, trong khi lượng chất sản phẩm tăng dần theo thời gian. 📷 **Hình 19.1.** Sự thay đổi lượng chất theo thời gian phản ứng. Tốc độ phản ứng được xác định bằng sự thay đổi lượng chất đầu hoặc... |
| 3 | GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S007_P01 | chemistry | 10 | chemistry_chapter_06 | chemistry_g10_bai19_3f234005 | Câu hỏi | 0.6046 | 1. Hãy tính tốc độ phản ứng theo nồng độ `H₂O₂` trong các khoảng thời gian: a) Từ 3 giờ đến 6 giờ. b) Từ 6 giờ đến 9 giờ. c) Từ 9 giờ đến 12 giờ. 2. Nhận xét về sự thay đổi tốc độ phản ứng theo thời gian. --- Đa số các phản ứng hoá học có tốc độ giảm dần th... |
| 4 | GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S014_P01 | chemistry | 10 | chemistry_chapter_06 | chemistry_g10_bai19_3f234005 | Câu hỏi | 0.5804 | 1. Phản ứng ở bình nào xảy ra nhanh nhất? Chậm nhất? 2. Nồng độ ảnh hưởng thế nào đến tốc độ phản ứng? --- Sự thay đổi nồng độ các chất tham gia sẽ ảnh hưởng đến tốc độ phản ứng. Thông thường, khi nồng độ tăng, tốc độ phản ứng sẽ tăng. Mối liên hệ giữa tốc... |
| 5 | GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S008_P01 | chemistry | 10 | chemistry_chapter_06 | chemistry_g10_bai19_3f234005 | EM CÓ BIẾT | 0.5762 | Sự thay đổi lượng chất trong khoảng thời gian vô cùng ngắn được gọi là tốc độ tức thời của phản ứng. --- |
| 6 | GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S009_P01 | chemistry | 10 | chemistry_chapter_06 | chemistry_g10_bai19_3f234005 | Ví dụ | 0.5603 | Xét phản ứng: ```text 2CO + O₂ → 2CO₂ ``` Tại thời điểm `t₁`, nồng độ `CO`, `O₂`, `CO₂` lần lượt là: ```text C_CO(1), C_O₂(1), C_CO₂(1) ``` Tại thời điểm `t₂`, nồng độ `CO`, `O₂`, `CO₂` lần lượt là: ```text C_CO(2), C_O₂(2), C_CO₂(2) ``` Trong khoảng thời g... |
| 7 | GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S018_P01 | chemistry | 10 | chemistry_chapter_06 | chemistry_g10_bai19_3f234005 | EM CÓ BIẾT | 0.5586 | Trong các phản ứng phức tạp, các chất đầu trải qua nhiều giai đoạn trung gian mới tạo thành được sản phẩm cuối cùng. Khi đó, tốc độ phản ứng phụ thuộc vào nồng độ của các chất tham gia phản ứng với số mũ nhìn chung khác với hệ số tỉ lượng của chất đó trong... |
| 8 | GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S003_P01 | chemistry | 10 | chemistry_chapter_06 | chemistry_g10_bai19_3f234005 | MỞ ĐẦU | 0.5488 | Làm thế nào có thể so sánh sự nhanh, chậm của các phản ứng hoá học để thúc đẩy hoặc kìm hãm nó theo mong muốn? --- |
| 9 | GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S005_P01 | chemistry | 10 | chemistry_chapter_06 | chemistry_g10_bai19_3f234005 | Câu hỏi | 0.5387 | 1. Xét phản ứng: ```text H₂ + Cl₂ → 2HCl ```` Nghiên cứu sự thay đổi nồng độ một chất trong phản ứng theo thời gian, thu được đồ thị. a) Đồ thị này mô tả sự thay đổi nồng độ theo thời gian của chất nào? b) Nêu đơn vị của tốc độ phản ứng trong trường hợp này... |
| 10 | GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S034_P01 | chemistry | 10 | chemistry_chapter_06 | chemistry_g10_bai19_3f234005 | Tiến hành | 0.5355 | * Rót vào 2 bình tam giác, mỗi bình `20 mL` dung dịch `H₂O₂ 10%`. * Thêm khoảng `0,1 g` xúc tác `MnO₂` vào một bình và lắc đều. Quan sát hiện tượng và thực hiện yêu cầu sau: 1. So sánh tốc độ thoát khí ở hai bình. 2. Chất xúc tác ảnh hưởng thế nào đến tốc đ... |

### REAL_EVAL50_MATH_003

- Subject/grade/type: math / 10 / concept
- Question: Trình bày ý chính của mục Kiến thức, kĩ năng.
- Current expected chunks: GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S002_P01
- Best gold rank: 1
- Error classification: success_top1, success_top3, success_top5, possible_bad_gold_label
- Gold label flags: expected_chunk_missing_question_keywords
- Recommendation: rewrite_question
- Human decision: _empty_

Current expected chunk excerpt:

```text
Sau bài học này, em có thể: * Nhận biết các khái niệm cơ bản về tập hợp. * Thực hiện các phép toán trên tập hợp và vận dụng giải một số bài toán có nội dung thực tiễn. * Sử dụng biểu đồ Ven để biểu diễn tập hợp và các phép toán trên tập hợp. ---
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S002_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức, kĩ năng | 0.4657 | Sau bài học này, em có thể: * Nhận biết các khái niệm cơ bản về tập hợp. * Thực hiện các phép toán trên tập hợp và vận dụng giải một số bài toán có nội dung thực tiễn. * Sử dụng biểu đồ Ven để biểu diễn tập hợp và các phép toán trên tập hợp. --- |
| 2 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S006_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức | 0.4556 | Có thể mô tả một tập hợp bằng một trong hai cách sau: * Cách 1. Liệt kê các phần tử của tập hợp. * Cách 2. Chỉ ra tính chất đặc trưng cho các phần tử của tập hợp. --- |
| 3 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S012_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức | 0.3980 | Nếu mọi phần tử của tập hợp $T$ đều là phần tử của tập hợp $S$ thì ta nói $T$ là một **tập hợp con** hay **tập con** của $S$ và viết là: $$ T \subset S $$ Đọc là: $T$ chứa trong $S$, hoặc $T$ là tập con của $S$. > **Nhận xét** > > Từ định nghĩa trên, $T$ là... |
| 4 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S022_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức | 0.3670 | Mối quan hệ giữa các tập hợp số: $$ \mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R}. $$ ![Mối quan hệ giữa các tập hợp số](images/h1_5.png) *Hình 1.5. Mối quan hệ giữa các tập hợp số.* --- |
| 5 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S003_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Mở đầu | 0.3500 | Câu lạc bộ Lịch sử có 12 thành viên, không có hai bạn nào trùng tên, tổ chức hai chuyên đề trên một phần mềm họp trực tuyến. Tên các thành viên tham gia mỗi chuyên đề được hiển thị trên màn hình. **Câu hỏi** Có bao nhiêu thành viên vắng mặt trong cả hai chu... |
| 6 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S001_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Thuật ngữ | 0.3095 | * Tập hợp, tập con, tập hợp bằng nhau, tập rỗng * Hợp, giao, hiệu của hai tập hợp, phần bù của một tập con * Biểu đồ Ven --- |
| 7 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S010_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Luyện tập 1 | 0.2917 | Gọi $S$ là tập nghiệm của phương trình: $$ x^2 - 24x + 143 = 0. $$ Các mệnh đề sau đúng hay sai? a) $13 \in S$; b) $11 \notin S$; c) $n(S) = 2$. --- |
| 8 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S021_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | HĐ5 | 0.2911 | Các mệnh đề sau đúng hay sai? a) Mọi số nguyên đều viết được dưới dạng phân số. b) Tập hợp các số thực chứa tập hợp các số hữu tỉ. c) Tồn tại một số thực không là số hữu tỉ. --- |
| 9 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S017_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Đề bài | 0.2870 | Cho hai tập hợp: $$ C = {n \in \mathbb{N} \mid n \text{ là bội chung của } 2 \text{ và } 3;\ n < 30}; $$ $$ D = {n \in \mathbb{N} \mid n \text{ là bội của } 6;\ n < 30}. $$ Chứng minh $C = D$. |
| 10 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S020_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | a. Mối quan hệ giữa các tập hợp số | 0.2795 | Tập hợp các số tự nhiên: $$ \mathbb{N} = {0; 1; 2; 3; 4; ...}. $$ Tập hợp các số nguyên $\mathbb{Z}$ gồm các số tự nhiên và các số nguyên âm: $$ \mathbb{Z} = {...; -3; -2; -1; 0; 1; 2; 3; ...}. $$ Tập hợp các số hữu tỉ $\mathbb{Q}$ gồm các số viết được dưới... |

### REAL_EVAL50_MATH_005

- Subject/grade/type: math / 10 / comparison
- Question: So sánh các khái niệm hoặc đại lượng chính được nêu trong mục Kiến thức.
- Current expected chunks: GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S012_P01
- Best gold rank: 1
- Error classification: success_top1, success_top3, success_top5, possible_bad_gold_label
- Gold label flags: expected_chunk_missing_question_keywords
- Recommendation: rewrite_question
- Human decision: _empty_

Current expected chunk excerpt:

```text
Nếu mọi phần tử của tập hợp $T$ đều là phần tử của tập hợp $S$ thì ta nói $T$ là một **tập hợp con** hay **tập con** của $S$ và viết là: $$ T \subset S $$ Đọc là: $T$ chứa trong $S$, hoặc $T$ là tập con của $S$. > **Nhận xét** > > Từ định nghĩa trên, $T$ là tập con của $S$ nếu mệnh đề sau đúng: > > $$ > \forall x,\ x \in T \Rightarrow x \in S. > $$ > > Quy ước tập rỗng là tập con của mọi tập hợp. Người ta thường minh hoạ một tập hợp bằng một hình phẳng được bao quanh bởi một đường kín, gọi là **biểu đồ Ven**. ![Biểu đồ Ven biểu diễn một tập hợp](images/h1_2.png) *Hình 1.2. Biểu đồ Ven biểu diễn một tập hợp.* Minh hoạ $T$ là một tập con của $S$ như Hình 1.3. ![Biểu đồ Ven biểu diễn T là tập con của S](images/h1_3.png) *Hình 1.3. Biểu đồ Ven biểu diễn $T \subset S$.* > Thay cho $T \subset S$, ta còn viết $S \supset T$, đọc là $S$ chứa $T$. > Kí hiệu $T \not\subset S$ để chỉ $T$ không là...
```

| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |
| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |
| 1 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S012_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức | 0.4889 | Nếu mọi phần tử của tập hợp $T$ đều là phần tử của tập hợp $S$ thì ta nói $T$ là một **tập hợp con** hay **tập con** của $S$ và viết là: $$ T \subset S $$ Đọc là: $T$ chứa trong $S$, hoặc $T$ là tập con của $S$. > **Nhận xét** > > Từ định nghĩa trên, $T$ là... |
| 2 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S006_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức | 0.4505 | Có thể mô tả một tập hợp bằng một trong hai cách sau: * Cách 1. Liệt kê các phần tử của tập hợp. * Cách 2. Chỉ ra tính chất đặc trưng cho các phần tử của tập hợp. --- |
| 3 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S046_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức | 0.4480 | Hiệu của hai tập hợp $S$ và $T$ là tập hợp gồm các phần tử thuộc $S$ nhưng không thuộc $T$, kí hiệu là $S \setminus T$. $$ S \setminus T = {x \mid x \in S \text{ và } x \notin T}. $$ ![Biểu đồ Ven biểu diễn hiệu của hai tập hợp](images/h1_9.png) *Hình 1.9.... |
| 4 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S016_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức | 0.4379 | Hai tập hợp $S$ và $T$ được gọi là hai **tập hợp bằng nhau** nếu mỗi phần tử của $T$ cũng là phần tử của tập hợp $S$ và ngược lại. Kí hiệu là: $$ S = T. $$ > Nếu $S \subset T$ và $T \subset S$ thì $S = T$. --- |
| 5 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S002_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức, kĩ năng | 0.4141 | Sau bài học này, em có thể: * Nhận biết các khái niệm cơ bản về tập hợp. * Thực hiện các phép toán trên tập hợp và vận dụng giải một số bài toán có nội dung thực tiễn. * Sử dụng biểu đồ Ven để biểu diễn tập hợp và các phép toán trên tập hợp. --- |
| 6 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S027_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức | 0.4046 | Một số tập con thường dùng của tập số thực $\mathbb{R}$: > Kí hiệu $+\infty$ đọc là dương vô cực hoặc dương vô cùng. > Kí hiệu $-\infty$ đọc là âm vô cực hoặc âm vô cùng. > $a$, $b$ gọi là các đầu mút của đoạn, khoảng hay nửa khoảng. |
| 7 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S040_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức | 0.4036 | Tập hợp gồm các phần tử thuộc tập hợp $S$ hoặc thuộc tập hợp $T$ gọi là **hợp** của hai tập hợp $S$ và $T$, kí hiệu là $S \cup T$. $$ S \cup T = {x \mid x \in S \text{ hoặc } x \in T}. $$ ![Biểu đồ Ven biểu diễn hợp của hai tập hợp](images/h1_7.png) *Hình 1... |
| 8 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S008_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Giải | 0.3795 | a) $$ D = {7; 11; 13; 17; 19}. $$ Tập hợp $D$ có 5 phần tử. b) $$ 5 \notin D;\quad 12 \notin D;\quad 17 \in D;\quad 18 \notin D. $$ > **Chú ý** > Số phần tử của tập hợp $S$ được kí hiệu là $n(S)$. > Chẳng hạn, tập hợp $A$ trong HĐ1 có số phần tử là 7, ta vi... |
| 9 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S035_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Kiến thức | 0.3790 | Tập hợp gồm các phần tử thuộc cả hai tập hợp $S$ và $T$ gọi là **giao** của hai tập hợp $S$ và $T$, kí hiệu là $S \cap T$. $$ S \cap T = {x \mid x \in S \text{ và } x \in T}. $$ ![Biểu đồ Ven biểu diễn giao của hai tập hợp](images/h1_6.png) *Hình 1.6. Biểu... |
| 10 | GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S003_P01 | math | 10 | math_chapter_01 | math_g10_bai02_11c596e4 | Mở đầu | 0.3757 | Câu lạc bộ Lịch sử có 12 thành viên, không có hai bạn nào trùng tên, tổ chức hai chuyên đề trên một phần mềm họp trực tuyến. Tên các thành viên tham gia mỗi chuyên đề được hiển thị trên màn hình. **Câu hỏi** Có bao nhiêu thành viên vắng mặt trong cả hai chu... |

