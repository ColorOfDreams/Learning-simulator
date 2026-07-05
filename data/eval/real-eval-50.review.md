# Real Eval 50 Gold Label Review

- Generated from existing theory chunks only.
- All cases are preview metadata and marked `needs_review`.
- Check each box only after a human confirms the question and gold chunk are appropriate.

## [ ] REAL_EVAL_PHY11_OSCILLATION_CONCEPT_001

- Subject: physics
- Grade: 11
- Topic: oscillation
- Question type: concept
- Question: Dao động cơ là gì? Nêu đặc điểm chuyển động quanh vị trí cân bằng.
- Expected chunk IDs: TH_PHY11_C01_L01_003
- Expected concepts: dao động cơ; chuyển động qua lại; vị trí cân bằng
- Expected numeric: N/A

Source excerpt:

```text
Vật chuyển động qua lại quanh vị trí cân bằng. Chuyển động như vậy được gọi là **dao động cơ**. Dao động cơ của một vật có thể là dao động tuần hoàn hoặc dao động không tuần hoàn. Nếu sau những khoảng thời gian bằng nhau, vật trở lại vị trí cũ theo hướng cũ thì dao động của vật được gọi là **dao động tuần hoàn**. **Ví dụ** * Dao động của con lắc đồng hồ là dao động tuần hoàn. * Dao động của cành cây đu đưa khi có gió thổi là dao động không tuần hoàn. Dao động tuần hoàn có thể có mức độ phức tạp khác nhau. Dao động tuần hoàn đơn giản nhất là dao động điều hòa. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL_PHY11_SHM_EQUATION_001

- Subject: physics
- Grade: 11
- Topic: simple_harmonic_motion
- Question type: formula
- Question: Trong phương trình dao động điều hòa x = A cos(ωt + φ), x, A, ω và φ có ý nghĩa gì?
- Expected chunk IDs: TH_PHY11_C01_L01_006
- Expected concepts: x là li độ; A là biên độ; ω là tần số góc; φ là pha ban đầu
- Expected numeric: N/A

Source excerpt:

```text
Đồ thị hình sin có thể được biểu diễn bằng hàm sin hoặc hàm cosin. Ta chọn hàm cosin: $$ x=A\cos(\omega t+\varphi) \tag{1.1} $$ Đây được gọi là **phương trình của dao động điều hòa**. Trong phương trình: * $x$ là li độ của vật tại thời điểm $t$. * $A$ là biên độ dao động. * $\omega$ là tần số góc. * $\omega t+\varphi$ là pha của dao động tại thời điểm $t$. * $\varphi$ là pha ban đầu. Dao động được mô tả bằng phương trình: $$ x=A\cos(\omega t+\varphi) $$ được gọi là dao động điều hòa. Vật đang thực hiện dao động điều hòa được gọi là vật dao động điều hòa. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL_PHY11_SHM_PERIOD_001

- Subject: physics
- Grade: 11
- Topic: simple_harmonic_motion
- Question type: calculation
- Question: Một vật dao động điều hòa có ω = 4π rad/s. Tính chu kì T.
- Expected chunk IDs: TH_PHY11_C01_L02_029
- Expected concepts: ω = 2π/T; T = 2π/ω; 0,5 s
- Expected numeric: 0.5 s

Source excerpt:

```text
> Chu kì (T) là khoảng thời gian để vật thực hiện một dao động. > Đơn vị của chu kì là giây (s). > Tần số (f) là số dao động mà vật thực hiện được trong một giây. > Đơn vị của tần số là (1/s), gọi là héc (Hz). > Trong dao động điều hòa, giữa tần số góc (\omega), chu kì (T) và tần số (f) có mối liên hệ: > > $$ > \omega=\frac{2\pi}{T}=2\pi f > $$ > Đơn vị của tần số góc là rad/s. > Độ lệch pha giữa hai dao động điều hòa cùng chu kì luôn bằng độ lệch pha ban đầu. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL_PHY11_SHM_POSITION_001

- Subject: physics
- Grade: 11
- Topic: simple_harmonic_motion
- Question type: calculation
- Question: Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Tính li độ tại t = 2 s.
- Expected chunk IDs: TH_PHY11_C01_L01_007, TH_PHY11_C01_L01_006
- Expected concepts: thay t = 2; pha dao động; x = 0 cm
- Expected numeric: 0 cm

Source excerpt:

```text
Một vật dao động điều hòa có phương trình: $$ x=2\cos\left(4\pi t+\frac{\pi}{2}\right)\text{ cm} $$ Hãy xác định: 1. Biên độ và pha ban đầu của dao động. 2. Pha và li độ của dao động tại thời điểm: $$ t=2\text{ s} $$ ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL_PHY11_SHM_VELOCITY_001

- Subject: physics
- Grade: 11
- Topic: shm_kinematics
- Question type: formula
- Question: Từ x = A cos(ωt + φ), hãy viết phương trình vận tốc của vật dao động điều hòa.
- Expected chunk IDs: TH_PHY11_C01_L03_004
- Expected concepts: vận tốc là đạo hàm của li độ; v = -ωA sin(ωt + φ)
- Expected numeric: N/A

Source excerpt:

```text
Khi học phép tính đạo hàm, chúng ta sẽ biết: $$ v=\frac{\Delta x}{\Delta t} $$ (với (\Delta t) rất nhỏ) chính là đạo hàm của li độ (x) theo thời gian, kí hiệu là (x'). Ta có: $$ x=A\cos(\omega t+\varphi) $$ Suy ra: $$ v=x' =-\omega A\sin(\omega t+\varphi) \tag{3.1} $$ Công thức (3.1) là phương trình của vận tốc. Có thể biến đổi như sau: $$ v=\pm \omega A\sqrt{1-\cos^2(\omega t+\varphi)} $$ Thay: $$ x=A\cos(\omega t+\varphi) $$ vào ta được: $$ v=\pm \omega\sqrt{A^2-x^2} \tag{3.2} $$ Từ công thức trên: * Khi vật ở vị trí cân bằng: $$ v=\pm \omega A $$ * Khi vật ở vị trí biên: $$ v=0 $$ ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL_PHY11_SHM_ACCELERATION_001

- Subject: physics
- Grade: 11
- Topic: shm_kinematics
- Question type: formula
- Question: Gia tốc trong dao động điều hòa liên hệ với li độ x theo công thức nào?
- Expected chunk IDs: TH_PHY11_C01_L03_011
- Expected concepts: a = -ω²x; trái dấu với li độ; vị trí cân bằng
- Expected numeric: N/A

Source excerpt:

```text
Như vậy, gia tốc tức thời của một vật là đạo hàm của vận tốc theo thời gian, kí hiệu là: $$ v' $$ Ta có: $$ a=v' =-\omega^2A\cos(\omega t+\varphi) \tag{3.3} $$ Công thức (3.3) là phương trình của gia tốc. Thay: $$ x=A\cos(\omega t+\varphi) $$ vào (3.3) ta được: $$ a=-\omega^2x \tag{3.4} $$ Từ công thức (3.4) ta thấy: * Khi vật ở vị trí cân bằng: $$ a=0 $$ * Khi vật ở vị trí biên: $$ a=\pm\omega^2A $$ ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL_PHY11_WAVE_SPEED_001

- Subject: physics
- Grade: 11
- Topic: mechanical_wave
- Question type: calculation
- Question: Một sóng có tần số f = 5 Hz và tốc độ truyền sóng v = 2 m/s. Tính bước sóng.
- Expected chunk IDs: TH_PHY11_C02_L14_004
- Expected concepts: v = λf; λ = v/f; 0,4 m
- Expected numeric: 0.4 m

Source excerpt:

```text
338,5m/s $$ b. Sử dụng công thức: $$ v=\lambda f $$ Suy ra: $$ \lambda=\frac{v}{f} ===================
```

Reviewer notes:

- 

## [ ] REAL_EVAL_PHY11_OHM_001

- Subject: physics
- Grade: 11
- Topic: ohms_law
- Question type: calculation
- Question: Một điện trở R = 10 Ω được đặt vào hiệu điện thế U = 5 V. Tính cường độ dòng điện.
- Expected chunk IDs: TH_PHY11_C04_L23_010
- Expected concepts: R = U/I; I = U/R; 0,5 A
- Expected numeric: 0.5 A

Source excerpt:

```text
Trong công thức: $$ R=\frac{U}{I} $$ nếu: * $U$ đo bằng vôn $(V)$. * $I$ đo bằng ampe $(A)$. thì điện trở đo bằng ôm, kí hiệu là: $$ \Omega $$ Ta có: $$ 1\Omega=\frac{1V}{1A} $$ Một số bội số của ôm: $$ 1k\Omega=1000\Omega $$ $$ 1M\Omega=1000k\Omega=1000000\Omega $$ ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL_PHY11_CAPACITOR_001

- Subject: physics
- Grade: 11
- Topic: capacitor
- Question type: calculation
- Question: Một tụ điện có điện dung C = 2 μF được đặt vào hiệu điện thế U = 10 V. Tính điện tích của tụ.
- Expected chunk IDs: TH_PHY11_C03_L21_012
- Expected concepts: Q = CU; đổi μF sang F; 0,00002 C
- Expected numeric: 0.00002 C

Source excerpt:

```text
Thực nghiệm cho thấy: > Với một tụ điện xác định, điện tích tích được tỉ lệ thuận với hiệu điện thế đặt vào hai bản tụ. Biểu thức: $$ Q = CU $$ Trong đó: * $Q$ là điện tích của tụ điện. * $U$ là hiệu điện thế giữa hai bản tụ. * $C$ là điện dung của tụ điện. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL_PHY11_STANDING_WAVE_001

- Subject: physics
- Grade: 11
- Topic: standing_wave
- Question type: comparison
- Question: Điều kiện để có sóng dừng trên dây có hai đầu cố định là gì?
- Expected chunk IDs: TH_PHY11_C02_L13_009
- Expected concepts: hai đầu cố định; số nguyên lần nửa bước sóng; L = nλ/2
- Expected numeric: N/A

Source excerpt:

```text
Điều kiện để có sóng dừng trên một sợi dây có hai đầu cố định là chiều dài của sợi dây phải bằng một số nguyên lần nửa bước sóng như Hình 13.3. $$ L=n\frac{\lambda}{2} $$ với: $$ n=1,2,3,... $$ [ \tag{13.1} ] ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_001

- Subject: physics
- Grade: 11
- Topic: damped_oscillation
- Question type: definition
- Question: Theo học liệu, Hiện tượng cộng hưởng trong đời sống là gì?
- Expected chunk IDs: TH_PHY11_C01_L06_018
- Expected concepts: Hiện tượng cộng hưởng trong đời sống
- Expected numeric: N/A

Source excerpt:

```text
Cộng hưởng là một hiện tượng vật lí quan trọng có thể xuất hiện trong nhiều tình huống khác nhau. Trong một số trường hợp, hiện tượng cộng hưởng có lợi, như: * Hộp đàn của các đàn ghi ta, violon,... là những hộp cộng hưởng được cấu tạo sao cho không khí trong hộp có thể dao động cộng hưởng với nhiều tần số dao động khác nhau của dây đàn. * Nguyên tắc hoạt động của lò vi sóng dựa trên cộng hưởng. Ở các lò vi sóng này, sóng được sử dụng có tần số phù hợp với tần số dao động riêng của các phân tử nước trong thực phẩm. Các phân tử nước đóng vai trò là hệ cộng hưởng cũng dao động cưỡng bức, nên hấp thụ năng lượng của sóng được sử dụng và nóng lên. Tuy nhiên, trong một số trường hợp khác hiện tượng cộng hưởng lại có hại. Nhiều hệ dao động như tòa nhà, cầu, bệ máy, khung xe,... đều có một hay nhiều tần số riêng.
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_002

- Subject: physics
- Grade: 12
- Topic: lesson_23
- Question type: formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Độ phóng xạ.
- Expected chunk IDs: GENCLN_PHY_G12_sgkvatli12_chuong4_bai23_sgkvatli12_e88f58e2_S023_P01
- Expected concepts: độ phóng xạ; hoạt độ phóng xạ; becquerel
- Expected numeric: N/A

Source excerpt:

```text
Để đặc trưng cho tính phóng xạ mạnh hay yếu của một lượng chất phóng xạ, người ta dùng đại lượng **độ phóng xạ**, hay **hoạt độ phóng xạ**, kí hiệu là: $$ H $$ Độ phóng xạ có giá trị bằng số hạt nhân phân rã trong một giây. Đơn vị độ phóng xạ là **becquerel**, kí hiệu là: $$ Bq $$ Ta có: $$ 1\text{ Bq}=1\text{ phân rã/s} $$ Trong thực tế, độ phóng xạ còn có đơn vị khác là **curie**, kí hiệu là: $$ Ci $$ Ta có: $$ 1\text{ Ci}=3{,}7\cdot10^{10}\text{ Bq} $$ Giá trị này xấp xỉ bằng độ phóng xạ của $1\text{ g}$ ${}^{226}Ra$. Độ phóng xạ có thể được đo nhờ các thiết bị đo phóng xạ. Vì số hạt nhân của một lượng chất phóng xạ giảm dần nên độ phóng xạ $H$ của chất phóng xạ cũng giảm theo thời gian. Xét một mẫu chất phóng xạ có $N_t$ hạt nhân tại thời điểm $t$. Tại thời điểm $t+\Delta t$, số hạt nhân đó giảm đi và trở thành: $$ N_t+\Delta N_t $$ với: $$ \Delta N_t<0 $$ Số hạt nhân đã phân rã t...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_003

- Subject: physics
- Grade: 10
- Topic: lesson_01
- Question type: concept
- Question: Trình bày ý chính của mục Vật lí là cơ sở của khoa học tự nhiên.
- Expected chunk IDs: GENCLN_PHY_G10_sgkvatli10_chuong1_bai1_sgkvatli10_4644c4e2_S011_P01
- Expected concepts: Vật lí là cơ sở của khoa học tự nhiên; Vật lí có quan hệ với mọi ngành khoa học và thường được coi là cơ sở của khoa học tự nhiên
- Expected numeric: N/A

Source excerpt:

```text
Vật lí có quan hệ với mọi ngành khoa học và thường được coi là cơ sở của khoa học tự nhiên. Các khái niệm, định luật, nguyên lí của Vật lí được sử dụng rộng rãi trong mọi lĩnh vực của khoa học tự nhiên, đặc biệt là trong việc giải thích cơ chế của các hiện tượng tự nhiên, từ các hiện tượng xảy ra trong thế giới sinh học, các phản ứng hóa học đến các hiện tượng xảy ra trong vũ trụ. Không phải ngẫu nhiên mà càng ngày càng xuất hiện nhiều lĩnh vực liên môn như: * Vật lí sinh học. * Vật lí địa lí. * Vật lí thiên văn. * Hóa lí. * Sinh học lượng tử. * Hóa học lượng tử. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_004

- Subject: physics
- Grade: 10
- Topic: lesson_29
- Question type: calculation
- Question: Trong mục Định luật bảo toàn động lượng, bài hoặc công thức đang yêu cầu xác định đại lượng nào và dựa trên quan hệ nào?
- Expected chunk IDs: GENCLN_PHY_G10_sgkvatli10_chuong5_bai29_sgkvatli10_1a742a5a_S004_P01
- Expected concepts: định luật bảo toàn động lượng; Định luật bảo toàn động lượng; Xét một hệ kín gồm hai vật trượt trên một đệm khí đến va chạm với nhau
- Expected numeric: N/A

Source excerpt:

```text
Xét một hệ kín gồm hai vật trượt trên một đệm khí đến va chạm với nhau. Vì các lực \(\vec{F}_1\) và \(\vec{F}_2\) là cặp nội lực trực đối nhau nên theo định luật III Newton: \[ \vec{F}_1=-\vec{F}_2 \tag{29.1} \] Dưới tác dụng của các lực \(\vec{F}_1\) và \(\vec{F}_2\), trong khoảng thời gian \(\Delta t\), động lượng của mỗi vật có độ biến thiên lần lượt là: \[ \Delta \vec{p}_1 \] và \[ \Delta \vec{p}_2 \] Áp dụng công thức: \[ \vec{F}\Delta t=\Delta \vec{p} \] cho từng vật, ta có: \[ \vec{F}_1\Delta t=\Delta \vec{p}_1 \] \[ \vec{F}_2\Delta t=\Delta \vec{p}_2 \tag{29.2} \] Từ (29.1) và (29.2), suy ra: \[ \Delta \vec{p}_1=-\Delta \vec{p}_2 \] hay: \[ \Delta \vec{p}_1+\Delta \vec{p}_2=0 \] Gọi \(\vec{p}\) là động lượng toàn phần của hệ: \[ \vec{p}=\vec{p}_1+\vec{p}_2 \] Ta có biến thiên động lượng toàn phần của hệ bằng tổng các biến thiên động lượng của mỗi vật: \[ \Delta \vec{p}=\Delta...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_005

- Subject: physics
- Grade: 11
- Topic: lesson_06
- Question type: phenomenon/experiment
- Question: Mô tả hiện tượng hoặc thí nghiệm được nêu trong mục Hiện tượng cộng hưởng trong đời sống.
- Expected chunk IDs: GENCLN_PHY_G11_sgkvatli11_chuong1_bai6_sgkvatli_11_5ddd353a_S019_P01
- Expected concepts: Hiện tượng cộng hưởng trong đời sống
- Expected numeric: N/A

Source excerpt:

```text
Cộng hưởng là một hiện tượng vật lí quan trọng có thể xuất hiện trong nhiều tình huống khác nhau. Trong một số trường hợp, hiện tượng cộng hưởng có lợi, như: * Hộp đàn của các đàn ghi ta, violon,... là những hộp cộng hưởng được cấu tạo sao cho không khí trong hộp có thể dao động cộng hưởng với nhiều tần số dao động khác nhau của dây đàn. * Nguyên tắc hoạt động của lò vi sóng dựa trên cộng hưởng. Ở các lò vi sóng này, sóng được sử dụng có tần số phù hợp với tần số dao động riêng của các phân tử nước trong thực phẩm. Các phân tử nước đóng vai trò là hệ cộng hưởng cũng dao động cưỡng bức, nên hấp thụ năng lượng của sóng được sử dụng và nóng lên. Tuy nhiên, trong một số trường hợp khác hiện tượng cộng hưởng lại có hại. Nhiều hệ dao động như tòa nhà, cầu, bệ máy, khung xe,... đều có một hay nhiều tần số riêng. Do vậy khi thiết kế cần tránh không để cho các hệ ấy chịu tác dụng của những lực...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_006

- Subject: physics
- Grade: 12
- Topic: lesson_12
- Question type: comparison
- Question: So sánh các khái niệm hoặc đại lượng chính được nêu trong mục Tác dụng của $N$ phân tử khí lên thành bình.
- Expected chunk IDs: GENCLN_PHY_G12_sgkvatli12_chuong2_bai12_sgkvatli12_34694ce1_S006_P01
- Expected concepts: trung bình của các bình phương tốc độ; mật độ phân tử; Tác dụng của N phân tử khí lên thành bình
- Expected numeric: N/A

Source excerpt:

```text
Vì số phân tử $N$ vô cùng lớn và các phân tử chuyển động hỗn loạn trong bình nên các hướng $Ox$, $Oy$ và $Oz$ là bình đẳng. Do đó, số phân tử chuyển động theo hướng $Ox$, từ mặt $EFOH$ sang mặt $ABCD$ và ngược lại để gây áp suất lên hai mặt này chỉ bằng: $$ \frac{N}{3} $$ số phân tử có trong bình. Vì các phân tử chuyển động hỗn loạn nên tốc độ của các phân tử không bằng nhau. Do đó, áp suất của mỗi phân tử tác dụng lên thành bình cũng không bằng nhau. Trung bình, mỗi phân tử tác dụng lên thành bình một áp suất: $$ p_m=\frac{m\overline{v^2}}{V} $$ Trong đó: $$ \overline{v^2}=\frac{v_1^2+v_2^2+\cdots+v_N^2}{N} $$ Đại lượng $\overline{v^2}$ được gọi là **trung bình của các bình phương tốc độ**. Từ những lập luận trên, ta có công thức tính áp suất của khí trong bình tác dụng lên thành bình $ABCD$: $$ p=\frac{1}{3}\frac{Nm}{V}\overline{v^2} \tag{12.1} $$ Trong đó: $$ \frac{N}{V} $$ là số p...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_007

- Subject: physics
- Grade: 11
- Topic: lesson_18
- Question type: cross-topic-noise
- Question: Bỏ qua các từ gây nhiễu như dao động, acid, phương trình bậc hai; theo đúng mục Giải, nội dung chính là gì?
- Expected chunk IDs: GENCLN_PHY_G11_sgkvatli11_chuong3_bai18_sgkvatli_11_6b39c8d3_S018_P01
- Expected concepts: Giải; d=24\ cm=24 10^{-2}\ m=0{,}24\ m; E={U}{d}={48}{24 10^{-2}}=200\ V/m
- Expected numeric: N/A

Source excerpt:

```text
Chọn gốc tọa độ $O$ tại điểm electron bắt đầu bay vào điện trường đều. Trục $Ox$ có hướng trùng với vectơ vận tốc ban đầu. Trục $Oy$ hướng thẳng đứng lên trên. Đổi đơn vị: $$ d=24\ cm=24 \times 10^{-2}\ m=0{,}24\ m $$ Độ lớn cường độ điện trường giữa hai bản phẳng là: $$ E=\frac{U}{d}=\frac{48}{24 \times 10^{-2}}=200\ V/m $$ Vectơ cường độ điện trường hướng từ trên xuống dưới và ngược chiều với trục $Oy$. Lực điện tác dụng lên electron có phương thẳng đứng, chiều hướng lên trên. Độ lớn lực điện: $$ F=|q|E=|q|\frac{U}{d} $$ Gia tốc của electron theo phương $Oy$: $$ a_y=\frac{F}{m}=\frac{|q|U}{md} $$ Phương trình chuyển động theo phương $Ox$: $$ x=v_0t $$ Phương trình chuyển động theo phương $Oy$: $$ y=\frac{1}{2}a_yt^2 $$ Suy ra: $$ y=\frac{1}{2}\frac{|q|U}{md}t^2 $$ Từ: $$ t=\frac{x}{v_0} $$ ta thu được phương trình quỹ đạo: $$ y=\frac{|q|U}{2mdv_0^2}x^2 $$ Thay số: $$ y=\frac{1{,}6 \...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_008

- Subject: physics
- Grade: 12
- Topic: lesson_17
- Question type: formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Biểu thức dòng điện xoay chiều.
- Expected chunk IDs: GENCLN_PHY_G12_sgkvatli12_chuong3_bai17_sgkvatli12_aecd69de_S007_P01
- Expected concepts: hiệu điện thế xoay chiều; điện áp xoay chiều; dòng điện xoay chiều
- Expected numeric: N/A

Source excerpt:

```text
Nếu nối hai đầu của khung dây dẫn $MNPQ$ với đoạn mạch tiêu thụ điện thì giữa hai đầu đoạn mạch có một hiệu điện thế. Hiệu điện thế này biến thiên theo thời gian theo quy luật dạng cosin hoặc sin, gọi là **hiệu điện thế xoay chiều** hay **điện áp xoay chiều**. Điện áp xoay chiều có cùng chu kì, tần số với suất điện động xoay chiều và có dạng: $$ u=U_0\cos(\omega t+\varphi_u) \tag{17.2} $$ Khi đó, dòng điện chạy qua mạch điện tiêu thụ là dòng điện xoay chiều có dạng: $$ i=I_0\cos(\omega t+\varphi_i) \tag{17.3} $$ Trong các biểu thức (17.2), (17.3): * $u$ là giá trị điện áp tức thời tại thời điểm $t$. * $i$ là giá trị cường độ dòng điện tức thời tại thời điểm $t$. * $U_0$ là giá trị cực đại của điện áp xoay chiều. * $I_0$ là giá trị cực đại của cường độ dòng điện xoay chiều. * $\omega$ là tần số góc của dòng điện xoay chiều, đơn vị là rad/s. * $\varphi_u$ là pha ban đầu của điện áp xoay...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_009

- Subject: physics
- Grade: 11
- Topic: shm_energy
- Question type: concept
- Question: Trình bày ý chính của mục Hiện tượng siêu dẫn.
- Expected chunk IDs: TH_PHY11_C04_L23_043
- Expected concepts: Hiện tượng siêu dẫn
- Expected numeric: N/A

Source excerpt:

```text
Hiện tượng siêu dẫn là hiện tượng một số kim loại và hợp kim khi nhiệt độ thấp hơn một nhiệt độ tới hạn $T_c$ thì điện trở của nó đột ngột giảm xuống bằng $0$. Khi vật dẫn ở trạng thái siêu dẫn, điện trở gần bằng $0$. Vì vậy, nếu trong một vòng dây siêu dẫn có dòng điện chạy qua thì dòng điện này có thể duy trì rất lâu sau khi bỏ nguồn điện. Các vật liệu siêu dẫn có nhiều ứng dụng trong thực tế. Người ta chế tạo nam châm điện có cuộn dây bằng vật liệu siêu dẫn để tạo ra từ trường mạnh trong thời gian dài mà gần như không hao phí năng lượng do tỏa nhiệt. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_010

- Subject: physics
- Grade: 11
- Topic: simple_harmonic_motion
- Question type: definition
- Question: Theo học liệu, Đặc điểm của sóng dừng là gì?
- Expected chunk IDs: TH_PHY11_C02_L13_006
- Expected concepts: sóng dừng; nút sóng; bụng sóng
- Expected numeric: N/A

Source excerpt:

```text
Sóng dừng được tạo thành mỗi khi có hai sóng cùng biên độ, cùng bước sóng lan truyền theo hai hướng ngược nhau. Hai sóng này gặp nhau, giao thoa nhau tạo nên sóng tổng hợp là **sóng dừng**. Những điểm tại đó hai sóng ngược pha nhau thì không dao động và được gọi là **nút sóng**. Những điểm tại đó hai sóng đồng pha với nhau thì dao động với biên độ cực đại và được gọi là **bụng sóng** như Hình 13.2. Trong thực tế, ta thường gặp một trong hai sóng là sóng phản xạ của sóng kia. Sóng dừng là tổng hợp của nhiều sóng tới và sóng phản xạ. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_011

- Subject: physics
- Grade: 12
- Topic: lesson_11
- Question type: calculation
- Question: Trong mục Phương trình Clapeyron, bài hoặc công thức đang yêu cầu xác định đại lượng nào và dựa trên quan hệ nào?
- Expected chunk IDs: GENCLN_PHY_G12_sgkvatli12_chuong2_bai11_sgkvatli12_52004a8e_S009_P01
- Expected concepts: hằng số khí lí tưởng; phương trình trạng thái của một lượng n mol khí lí tưởng; phương trình trạng thái của khí lí tưởng
- Expected numeric: N/A

Source excerpt:

```text
Có thể xác định được độ lớn của hằng số trong phương trình trạng thái của một lượng $n$ mol khí xác định. Số mol khí được xác định bởi: $$ n=\frac{m}{M} $$ Trong đó: * $m$ là khối lượng khí. * $M$ là khối lượng mol của lượng khí. Trước hết, cần xác định độ lớn của hằng số này đối với $1$ mol khí. Ở điều kiện tiêu chuẩn, một mol của bất kì khí nào đều có: * Thể tích: $$ V=22{,}4\cdot10^{-3}\text{ m}^3 $$ * Áp suất: $$ p=1{,}013\cdot10^5\text{ Pa} $$ * Nhiệt độ: $$ T=273\text{ K} $$ Do đó, đối với $1$ mol khí: $$ \frac{pV}{T} = \frac{1{,}013\cdot10^5\cdot22{,}4\cdot10^{-3}}{273} $$ $$ \frac{pV}{T}=8{,}31 $$ Hằng số: $$ R=8{,}31 $$ được gọi là **hằng số khí lí tưởng**. Đơn vị của hằng số khí lí tưởng là: $$ J/mol.K $$ Vì thể tích của $n$ mol khí bằng $n$ lần thể tích của $1$ mol khí ở cùng nhiệt độ và áp suất, nên nếu phương trình trạng thái của $1$ mol khí là: $$ \frac{pV}{T}=R $$ thì p...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_012

- Subject: physics
- Grade: 10
- Topic: lesson_02
- Question type: phenomenon/experiment
- Question: Mô tả hiện tượng hoặc thí nghiệm được nêu trong mục Quy tắc an toàn trong phòng thực hành.
- Expected chunk IDs: GENCLN_PHY_G10_sgkvatli10_chuong1_bai2_sgkvatli10_5e318891_S024_P01
- Expected concepts: Quy tắc an toàn trong phòng thực hành; Để đảm bảo an toàn trong phòng thực hành; cần thực hiện các quy tắc sau
- Expected numeric: N/A

Source excerpt:

```text
Để đảm bảo an toàn trong phòng thực hành, cần thực hiện các quy tắc sau: * Đọc kĩ hướng dẫn sử dụng thiết bị và quan sát các chỉ dẫn, các kí hiệu trên các thiết bị thí nghiệm. * Kiểm tra cẩn thận thiết bị, phương tiện, dụng cụ thí nghiệm trước khi sử dụng. * Chỉ tiến hành thí nghiệm khi được sự cho phép của giáo viên hướng dẫn thí nghiệm. * Tắt công tắc nguồn thiết bị điện trước khi cắm hoặc tháo thiết bị điện. * Chỉ cắm phích, giắc cắm của thiết bị điện vào ổ cắm khi hiệu điện thế của nguồn điện tương ứng với hiệu điện thế định mức của dụng cụ. * Phải bố trí dây điện gọn gàng, không bị vướng khi qua lại. * Không tiếp xúc trực tiếp với các vật và các thiết bị thí nghiệm có nhiệt độ cao khi không có dụng cụ bảo hộ. * Không để nước cũng như các dung dịch dẫn điện, dung dịch dễ cháy gần thiết bị điện. * Giữ khoảng cách an toàn khi tiến hành thí nghiệm nung nóng các vật, thí nghiệm có các...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_013

- Subject: physics
- Grade: 12
- Topic: lesson_22
- Question type: comparison
- Question: So sánh các khái niệm hoặc đại lượng chính được nêu trong mục Phản ứng tổng hợp hạt nhân.
- Expected chunk IDs: GENCLN_PHY_G12_sgkvatli12_chuong4_bai22_sgkvatli12_f183c801_S031_P01
- Expected concepts: Phản ứng tổng hợp hạt nhân; Oliphant; phản ứng nhiệt hạch
- Expected numeric: N/A

Source excerpt:

```text
**Phản ứng tổng hợp hạt nhân** là phản ứng hạt nhân trong đó hai hay nhiều hạt nhân nhẹ tổng hợp lại thành một hạt nhân nặng hơn. Từ đồ thị Hình 22.5, có thể thấy quá trình các hạt nhân nhẹ, ứng với đoạn đồ thị $MN$, tổng hợp thành hạt nhân có số khối nặng hơn, ứng với đoạn đồ thị $NT$, sẽ thu được hạt nhân bền vững hơn vì hạt nhân đó có năng lượng liên kết riêng lớn hơn. Vào năm 1927, **Oliphant** đã dùng máy gia tốc để các hạt nhân hydrogen tương tác với nhau, tạo ra phản ứng tổng hợp hạt nhân đầu tiên trên thế giới: $$ {}^2_1H+{}^3_1H\rightarrow{}^4_2He+{}^1_0n $$ Phản ứng này tỏa năng lượng khoảng: $$ 4\text{ MeV} $$ Vì các hạt nhân đều mang điện tích dương, nên muốn cho hai hạt nhân nhẹ có thể hợp lại thành hạt nhân nặng hơn, ta phải cung cấp cho chúng một động năng đủ lớn để: * Thắng lực đẩy tĩnh điện Coulomb giữa chúng. * Làm chúng tiến lại gần nhau đến mức lực hạt nhân phát hu...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_014

- Subject: physics
- Grade: 12
- Topic: lesson_03
- Question type: formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục a) Thang nhiệt độ Celsius.
- Expected chunk IDs: GENCLN_PHY_G12_sgkvatli12_chuong1_bai3_sgkvatli12_df06bfb6_S010_P01
- Expected concepts: thang Celsius; thang nhiệt độ bách phân; thang nhiệt độ Celsius
- Expected numeric: N/A

Source excerpt:

```text
Thang nhiệt độ chúng ta vẫn dùng hằng ngày là **thang Celsius**. Hai nhiệt độ dùng làm mốc của thang này là: * Nhiệt độ đóng băng của nước tinh khiết. * Nhiệt độ sôi của nước tinh khiết. Các mốc nhiệt độ này được xác định ở áp suất tiêu chuẩn. Khoảng cách giữa hai nhiệt độ này được chia thành $100$ phần bằng nhau, mỗi phần là $1$ độ. Vì được chia thành $100$ phần bằng nhau nên ban đầu thang nhiệt độ này được gọi là **thang nhiệt độ bách phân**. Năm 1948, Hội đồng quốc tế về trọng lượng và đo lường đã quyết định công nhận thang nhiệt độ này và đổi tên nó thành **thang nhiệt độ Celsius** để vinh danh nhà khoa học Thụy Điển **Anders Celsius** (An-đơ Xen-si-út) (1701–1774), người đầu tiên xây dựng thang nhiệt độ này vào năm 1742. Nhiệt độ trong thang Celsius thường được kí hiệu bằng chữ: $$ t $$ Đơn vị là độ Celsius, kí hiệu: $$ ^\circ C $$ Các nhiệt độ: * Cao hơn $0^\circ C$ có giá trị d...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_PHYS_015

- Subject: physics
- Grade: 10
- Topic: lesson_34
- Question type: concept
- Question: Trình bày ý chính của mục a) Khái niệm áp lực.
- Expected chunk IDs: GENCLN_PHY_G10_sgkvatli10_chuong7_bai34_sgkvatli10_3814499e_S006_P01
- Expected concepts: áp lực; a) Khái niệm áp lực; Một cuốn sách nằm yên trên mặt bàn nằm ngang chịu tác dụng của hai lực cân bằng
- Expected numeric: N/A

Source excerpt:

```text
Một cuốn sách nằm yên trên mặt bàn nằm ngang chịu tác dụng của hai lực cân bằng: - Lực hút của Trái Đất. - Lực đẩy của mặt bàn. Do mặt bàn tác dụng lên cuốn sách lực \(\vec{F}\) có: - Phương thẳng đứng. - Chiều hướng lên trên. - Độ lớn bằng trọng lượng \(P\) của cuốn sách. Nên theo định luật III Newton, cuốn sách tác dụng lên mặt bàn lực \(\vec{F}_N\) có: - Phương thẳng đứng. - Chiều hướng xuống dưới. - Độ lớn bằng \(F\). Lực \(\vec{F}_N\) ép lên mặt bàn theo phương vuông góc với mặt bàn, được gọi là **áp lực**. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_001

- Subject: chemistry
- Grade: 12
- Topic: lesson_11
- Question type: definition
- Question: Theo học liệu, HỆ THỐNG HOÁ KIẾN THỨC là gì?
- Expected chunk IDs: GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai11_sgkhoahoc12_4f67614b_S001_P02
- Expected concepts: HỆ THỐNG HOÁ KIẾN THỨC; Nội dung Amine Amino acid Peptide Protein; Khái niệm Dẫn xuất của ammonia
- Expected numeric: N/A

Source excerpt:

```text
| Nội dung | Amine | Amino acid | Peptide | Protein | | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | | Khái niệm | Dẫn xuất của ammonia, trong đó nguyên tử hydrogen trong phân tử ammonia được thay thế bằ...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_002

- Subject: chemistry
- Grade: 12
- Topic: lesson_14
- Question type: formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Một số vật liệu polymer phổ biến.
- Expected chunk IDs: GENCLN_CHEM_G12_sgkhoahoc12_chuong4_bai14_sgkhoahoc12_ebd19add_S002_P02
- Expected concepts: Một số vật liệu polymer phổ biến; Vật liệu polymer Thành phần; nguồn gốc Tính chất
- Expected numeric: N/A

Source excerpt:

```text
| Vật liệu polymer | Thành phần, nguồn gốc | Tính chất | | --------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | | PE | Trùng hợp ethylene | Có tính dẻo | | PP | Trùng hợp propylene | Có tính dẻo | | PVC | Trùng hợp vinyl chloride | Có tính dẻo | | PS | Trùng hợp styrene | Có tính dẻo | | Poly(methyl methacrylate) | Trùng hợp methyl methacrylate | Có tính dẻo | | Poly(phenol formaldehyde) | Trùng ngưng phenol với formaldehyde | Có tính dẻo | | Vật liệu composite | Vật liệu nền và vật liệu cốt | Tính chất tốt hơn các vật liệu riêng rẽ ban đầu | | Tơ tự nhiên | Có nguồn gốc từ thiên nhiên: sợi bông, len, tơ tằm,... | Có dạng sợi mảnh, dai bền,... | | Tơ bán tổng hợp | Chế biến từ polymer tự nhiên bằng phương pháp hoá học: tơ visco, tơ cellulose ac...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_003

- Subject: chemistry
- Grade: 12
- Topic: lesson_02
- Question type: concept
- Question: Trình bày ý chính của mục KHÁI NIỆM, ĐẶC ĐIỂM CẤU TẠO CỦA XÀ PHÒNG VÀ CHẤT GIẶT RỬA.
- Expected chunk IDs: GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai2_sgkhoahoc12_6f1d2bc6_S003_P01
- Expected concepts: KHÁI NIỆM, ĐẶC ĐIỂM CẤU TẠO CỦA XÀ PHÒNG VÀ CHẤT GIẶT RỬA; Xà phòng là hỗn hợp muối sodium hoặc potassium của các acid béo và các chất phụ gia
- Expected numeric: N/A

Source excerpt:

```text
Xà phòng là hỗn hợp muối sodium hoặc potassium của các acid béo và các chất phụ gia. Thành phần chủ yếu của xà phòng thường là muối sodium của palmitic acid hoặc stearic acid. Chất giặt rửa tổng hợp là các chất được tổng hợp hoá học, có tác dụng giặt rửa như xà phòng nhưng không phải là muối sodium, potassium của các acid béo. Những chất này thường là muối sodium alkylsulfate hoặc alkylbenzene sulfonate. Ngoài ra, một số sản phẩm từ thiên nhiên cũng có tác dụng giặt rửa như nước quả bồ kết, quả bồ hòn,... gọi là chất giặt rửa tự nhiên. Cấu tạo của xà phòng và chất giặt rửa phổ biến thường gồm hai phần: * Phần phân cực (“đầu” ưa nước): là nhóm carboxylate (xà phòng) hoặc nhóm sulfate, sulfonate (chất giặt rửa tổng hợp). Phần này có thể hoà tan được trong nước. * Phần không phân cực (“đuôi” kị nước): là gốc hydrocarbon có mạch dài (R). Phần này không tan trong nước. 📷 **Hình 2.1.** Cấu...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_004

- Subject: chemistry
- Grade: 12
- Topic: lesson_15
- Question type: comparison
- Question: So sánh các khái niệm hoặc đại lượng chính được nêu trong mục Thế điện cực chuẩn.
- Expected chunk IDs: GENCLN_CHEM_G12_sgkhoahoc12_chuong5_bai15_sgkhoahoc12_c9b589b8_S009_P02
- Expected concepts: Thế điện cực chuẩn; Nguyên tố Bán phản ứng Thế điện cực chuẩn E°; Li Li⁺ + 1e ⇌ Li
- Expected numeric: N/A

Source excerpt:

```text
| Nguyên tố | Bán phản ứng | Thế điện cực chuẩn E°, V | | --------- | --------------------- | -----------------------: | | Li | Li⁺ + 1e ⇌ Li | -3,040 | | K | K⁺ + 1e ⇌ K | -2,924 | | Ba | Ba²⁺ + 2e ⇌ Ba | -2,92 | | Ca | Ca²⁺ + 2e ⇌ Ca | -2,84 | | Na | Na⁺ + 1e ⇌ Na | -2,713 | | Mg | Mg²⁺ + 2e ⇌ Mg | -2,356 | | Al | Al³⁺ + 3e ⇌ Al | -1,676 | | Zn | Zn²⁺ + 2e ⇌ Zn | -0,762 | | Cr | Cr³⁺ + 3e ⇌ Cr | -0,74 | | Fe | Fe²⁺ + 2e ⇌ Fe | -0,44 | | H₂ | 2H₂O + 2e ⇌ H₂ + 2OH⁻ | -0,414 | | Cd | Cd²⁺ + 2e ⇌ Cd | -0,403 | | Ni | Ni²⁺ + 2e ⇌ Ni | -0,257 | | Sn | Sn²⁺ + 2e ⇌ Sn | -0,137 | | Pb | Pb²⁺ + 2e ⇌ Pb | -0,126 | | H₂ | 2H⁺ + 2e ⇌ H₂ | 0,000 | | Cu | Cu²⁺ + 2e ⇌ Cu | +0,340 | | Fe | Fe³⁺ + 1e ⇌ Fe²⁺ | +0,771 | | Ag | Ag⁺ + 1e ⇌ Ag | +0,799 | | Hg | Hg²⁺ + 2e ⇌ Hg | +0,853 | | Br | Br₂(aq) + 2e ⇌ 2Br⁻ | +1,087 | | O | O₂ + 4H⁺ + 4e ⇌ 2H₂O | +1,229 | | Cl | Cl₂(aq) + 2e ⇌ 2Cl⁻ | +1,358 | | Au |...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_005

- Subject: chemistry
- Grade: 10
- Topic: lesson_03
- Question type: cross-topic-noise
- Question: Bỏ qua các từ gây nhiễu như dao động, acid, phương trình bậc hai; theo đúng mục Viết cấu hình electron của nguyên tử, nội dung chính là gì?
- Expected chunk IDs: GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai3_sgkhoahoc10_54de3f11_S014_P01
- Expected concepts: Bước 1.; Bước 2.; Bước 3.
- Expected numeric: N/A

Source excerpt:

```text
**Bước 1.** Xác định số electron trong nguyên tử. **Bước 2.** Viết thứ tự các lớp và phân lớp electron theo chiều tăng của năng lượng: ```text 1s 2s 2p 3s 3p 4s ... ```` **Bước 3.** Điền các electron vào các phân lớp theo nguyên lí vững bền cho đến electron cuối cùng. Ví dụ: Viết cấu hình electron của nguyên tử oxygen `(Z = 8)` và potassium `(Z = 19)`. Nguyên tử oxygen có tổng số electron là 8. Thứ tự các lớp và phân lớp electron đến phân lớp `4s` theo chiều tăng của năng lượng là: ```text 1s 2s 2p 3s 3p 4s ... ``` Điền electron: ```text 1s²2s²2p⁴ ``` Có thể thay `1s²` bằng kí hiệu `[He]`. Cấu hình electron của nguyên tử oxygen là: ```text 1s²2s²2p⁴ ``` hoặc: ```text [He]2s²2p⁴ ``` hoặc: ```text (2, 6) ``` Electron cuối cùng điền vào phân lớp `p` nên oxygen là nguyên tố p. Nguyên tử potassium có tổng số electron là 19. Thứ tự các lớp và phân lớp electron đến phân lớp `4s` theo chiều t...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_006

- Subject: chemistry
- Grade: 12
- Topic: lesson_10
- Question type: definition
- Question: Theo học liệu, Khái niệm và đặc điểm cấu tạo là gì?
- Expected chunk IDs: GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai10_sgkhoahoc12_f2d22dc6_S003_P01
- Expected concepts: Khái niệm và đặc điểm cấu tạo; một loại hormone thuộc loại protein; được sản sinh bởi tuyến tụy
- Expected numeric: N/A

Source excerpt:

```text
Insulin, một loại hormone thuộc loại protein, được sản sinh bởi tuyến tụy, có chức năng điều hoà quá trình chuyển hoá glucose trong cơ thể. Insulin thúc đẩy sự hấp thu glucose của các tế bào và dự trữ glucose dư thừa trong gan và cơ. Insulin có cấu tạo được mô tả trong Hình 10.1. Hãy nhận xét về thành phần cấu tạo và phân tử khối của insulin. 📷 **Hình 10.1.** Cấu tạo của insulin. Protein là hợp chất cao phân tử được cấu tạo từ một hay nhiều chuỗi polypeptide. Mỗi chuỗi polypeptide gồm các đơn vị α-amino acid liên kết với nhau qua liên kết peptide theo một trật tự nhất định. Protein khi thuỷ phân chỉ cho hỗn hợp các α-amino acid gọi là protein đơn giản. Protein phức tạp là loại protein được tạo thành từ protein đơn giản và các thành phần “phi protein” như nucleic acid, lipid,... ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_007

- Subject: chemistry
- Grade: 10
- Topic: lesson_04
- Question type: formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục HỆ THỐNG HOÁ KIẾN THỨC.
- Expected chunk IDs: GENCLN_CHEM_G10_sgkhoahoc10_chuong1_bai4_sgkhoahoc10_ed88ed24_S002_P01
- Expected concepts: HỆ THỐNG HOÁ KIẾN THỨC; Hoàn thành sơ đồ hệ thống hoá kiến thức sau; text NGUYÊN TỬ ├── Hạt nhân │ ├── Hạt proton │ │ ├── Khối lượng = ...?..
- Expected numeric: N/A

Source excerpt:

```text
Hoàn thành sơ đồ hệ thống hoá kiến thức sau: ```text NGUYÊN TỬ ├── Hạt nhân │ ├── Hạt proton │ │ ├── Khối lượng = ...?... │ │ └── Điện tích = ...?... │ └── Hạt neutron │ ├── Khối lượng = ...?... │ └── Điện tích = ...?... │ ├── Vỏ nguyên tử │ └── Hạt electron │ ├── Khối lượng = ...?... │ └── Điện tích = ...?... │ ├── Kích thước: ...?... ├── Khối lượng: ...?... └── Z = ...?... = ...?... ```` ```text NGUYÊN TỐ HOÁ HỌC Số khối (A) = ...?... + ...?... Kí hiệu nguyên tử: A X Z ``` ```text CẤU TRÚC LỚP VỎ ELECTRON NGUYÊN TỬ Nguyên lí vững bền: ...?... Nguyên lí Pauli: ...?... Quy tắc Hund: ...?... AO s có dạng ...?... AO p gồm ...?..., ...?..., ...?... AO p có dạng ...?... Thứ tự các phân lớp có năng lượng từ thấp đến cao: ...?... Cấu hình electron Đặc điểm của lớp electron ngoài cùng ``` | n | Lớp electron | Phân lớp | Số AO | Số electron tối đa | | - | ------------ | -------- | ------- | -...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_008

- Subject: chemistry
- Grade: 12
- Topic: lesson_09
- Question type: concept
- Question: Trình bày ý chính của mục a) Khái niệm.
- Expected chunk IDs: GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai9_sgkhoahoc12_f4bd23ac_S003_P01
- Expected concepts: a) Khái niệm; Hãy nhận xét đặc điểm chung về cấu tạo của các amino acid dưới đây; 📷 Hình 9.1. Cấu tạo
- Expected numeric: N/A

Source excerpt:

```text
Hãy nhận xét đặc điểm chung về cấu tạo của các amino acid dưới đây: 📷 **Hình 9.1.** Cấu tạo, tên thông thường, kí hiệu của một số amino acid: glycine (Gly), alanine (Ala), valine (Val), lysine (Lys), glutamic acid (Glu). Amino acid là hợp chất hữu cơ tạp chức, trong phân tử chứa đồng thời nhóm amino (-NH₂) và nhóm carboxyl (-COOH). Các amino acid thiên nhiên hầu hết là α-amino acid, có công thức chung dạng: ```text H₂N-CH(R)-COOH ``` Trong đó, chỉ có khoảng 20 amino acid cấu thành nên phần lớn protein trong cơ thể người, gọi là những amino acid tiêu chuẩn. Một số amino acid tiêu chuẩn mà cơ thể người không thể tự tổng hợp được gọi là amino acid thiết yếu. Con người tiếp nhận amino acid thiết yếu qua thức ăn như thịt, cá, trứng, sữa,... ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_009

- Subject: chemistry
- Grade: 12
- Topic: lesson_08
- Question type: phenomenon/experiment
- Question: Mô tả hiện tượng hoặc thí nghiệm được nêu trong mục Thí nghiệm: Phản ứng của nhóm amine.
- Expected chunk IDs: GENCLN_CHEM_G12_sgkhoahoc12_chuong3_bai8_sgkhoahoc12_2133d6d3_S012_P01
- Expected concepts: Chuẩn bị:; Hoá chất:; Dụng cụ:
- Expected numeric: N/A

Source excerpt:

```text
**Chuẩn bị:** * **Hoá chất:** dung dịch methylamine 0,1 M, dung dịch HCl 0,1 M, dung dịch FeCl₃ 0,1 M, dung dịch CuSO₄ 0,1 M, giấy pH/giấy quỳ tím, phenolphthalein. * **Dụng cụ:** ống nghiệm, mặt kính đồng hồ. **Tiến hành:** **1. Phản ứng với chất chỉ thị** * Nhỏ một giọt dung dịch methylamine 0,1 M lên mẫu giấy pH hoặc giấy quỳ tím đặt trên mặt kính đồng hồ. * Quan sát và mô tả sự thay đổi màu sắc của giấy pH. **2. Phản ứng với dung dịch acid** * Cho 2 mL dung dịch methylamine 0,1 M vào ống nghiệm, thêm tiếp 1 giọt phenolphthalein. * Nhỏ từ từ 2 mL dung dịch HCl 0,1 M vào ống nghiệm. * Quan sát hiện tượng xảy ra trong ống nghiệm, giải thích và viết phương trình hoá học. **3. Phản ứng với dung dịch muối** * Cho khoảng 1 mL dung dịch FeCl₃ 0,1 M vào ống nghiệm. * Thêm tiếp khoảng 3 mL dung dịch methylamine 0,1 M vào ống nghiệm. * Quan sát hiện tượng xảy ra trong ống nghiệm, giải thích...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_010

- Subject: chemistry
- Grade: 12
- Topic: lesson_28
- Question type: comparison
- Question: So sánh các khái niệm hoặc đại lượng chính được nêu trong mục MỘT SỐ KHÁI NIỆM CƠ BẢN VỀ PHỨC CHẤT.
- Expected chunk IDs: GENCLN_CHEM_G12_sgkhoahoc12_chuong8_bai28_sgkhoahoc12_59fead8c_S003_P01
- Expected concepts: , và các phối tử, thường được kí hiệu là; MỘT SỐ KHÁI NIỆM CƠ BẢN VỀ PHỨC CHẤT; Phức chất là hợp chất có chứa nguyên tử trung tâm
- Expected numeric: N/A

Source excerpt:

```text
Phức chất là hợp chất có chứa nguyên tử trung tâm, thường được kí hiệu là **M**, và các phối tử, thường được kí hiệu là **L**. Trong đó, nguyên tử trung tâm là cation kim loại hoặc nguyên tử kim loại liên kết với các phối tử. Phối tử là anion hoặc phân tử. Phức chất có thể mang điện tích hoặc không mang điện tích. Trong công thức phức chất, nguyên tử trung tâm M và các phối tử L thường được đặt trong móc vuông. Ví dụ 1: ```text [Co(NH₃)₆]³⁺ ``` Phức chất có điện tích +3, nguyên tử trung tâm là Co³⁺ và phối tử là NH₃. Ví dụ 2: ```text [Zn(OH)₄]²⁻ ``` Phức chất có điện tích -2, nguyên tử trung tâm là Zn²⁺ và phối tử là OH⁻. Ví dụ 3: ```text [Fe(CO)₅] ``` Phức chất không mang điện tích, nguyên tử trung tâm là Fe và phối tử là CO.
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_011

- Subject: chemistry
- Grade: 10
- Topic: lesson_19
- Question type: definition
- Question: Theo học liệu, Khái niệm tốc độ phản ứng hoá học là gì?
- Expected chunk IDs: GENCLN_CHEM_G10_sgkhoahoc10_chuong6_bai19_sgkhoahoc10_3f234005_S004_P01
- Expected concepts: Khái niệm tốc độ phản ứng hoá học; Khi phản ứng hoá học xảy ra; lượng chất đầu giảm dần theo thời gian
- Expected numeric: N/A

Source excerpt:

```text
Khi phản ứng hoá học xảy ra, lượng chất đầu giảm dần theo thời gian, trong khi lượng chất sản phẩm tăng dần theo thời gian. 📷 **Hình 19.1.** Sự thay đổi lượng chất theo thời gian phản ứng. Tốc độ phản ứng được xác định bằng sự thay đổi lượng chất đầu hoặc chất sản phẩm trong một đơn vị thời gian. Đơn vị thời gian có thể là: - giây `(s)`; - phút `(min)`; - giờ `(h)`; - ngày `(d)`; - ... Lượng chất có thể được biểu diễn bằng: - số mol; - nồng độ mol; - khối lượng; - thể tích. Các phản ứng khác nhau xảy ra với tốc độ khác nhau. Có phản ứng xảy ra nhanh, có phản ứng xảy ra chậm. 📷 **Hình 19.2.** Phản ứng xảy ra nhanh và phản ứng xảy ra chậm: a) Than cháy. b) Sắt bị gỉ. c) Tinh bột lên men rượu. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_012

- Subject: chemistry
- Grade: 10
- Topic: lesson_13
- Question type: formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Khái niệm tương tác van der Waals.
- Expected chunk IDs: GENCLN_CHEM_G10_sgkhoahoc10_chuong3_bai13_sgkhoahoc10_e52c3adf_S011_P01
- Expected concepts: Tương tác van der Waals; Khái niệm tương tác van der Waals; Cùng là phân tử không phân cực
- Expected numeric: N/A

Source excerpt:

```text
Cùng là phân tử không phân cực, ở nhiệt độ phòng: - fluorine và chlorine là chất khí; - bromine là chất lỏng. Như vậy, ở trạng thái lỏng, giữa các phân tử bromine tồn tại một tương tác yếu. Tương tác yếu đó gọi là tương tác van der Waals. Các khí hiếm như neon, argon,... tồn tại dưới dạng các nguyên tử độc lập. Tuy nhiên, ở nhiệt độ thấp, khí hiếm có thể hoá lỏng. Như vậy, ở nhiệt độ thấp, giữa các nguyên tử khí hiếm tồn tại một tương tác yếu để giữ các nguyên tử khí hiếm lại với nhau trong trạng thái lỏng. Tương tác đó cũng là tương tác van der Waals. > **Tương tác van der Waals** là tương tác tĩnh điện lưỡng cực - lưỡng cực giữa các nguyên tử hay phân tử. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_013

- Subject: chemistry
- Grade: 11
- Topic: lesson_24
- Question type: concept
- Question: Trình bày ý chính của mục Khái niệm.
- Expected chunk IDs: GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S003_P01
- Expected concepts: Carboxylic acid; –COOH; nhóm carboxyl
- Expected numeric: N/A

Source excerpt:

```text
Nhiều carboxylic acid tồn tại trong tự nhiên. Ví dụ: | Công thức | Tên | Nguồn gốc | |---|---|---| | HCOOH | formic acid | có trong nọc kiến | | CH₃COOH | acetic acid | có trong giấm | | CH₃CH₂CH₂COOH | butyric acid | có trong bơ | | HOOC–COOH | oxalic acid | có trong quả khế | **Carboxylic acid** là các hợp chất hữu cơ trong phân tử có nhóm **–COOH** liên kết với nguyên tử carbon trong gốc hydrocarbon, nhóm –COOH hoặc nguyên tử hydrogen. Nhóm chức: ```text –COOH ``` được gọi là **nhóm carboxyl**. Công thức của carboxylic acid đơn chức thường viết dưới dạng: ```text RCOOH ``` Ví dụ: ```text CH₃COOH CH₂=CHCOOH C₆H₅COOH ``` ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_014

- Subject: chemistry
- Grade: 12
- Topic: lesson_01
- Question type: calculation
- Question: Trong mục Khái niệm về lipid, chất béo, acid béo, bài hoặc công thức đang yêu cầu xác định đại lượng nào và dựa trên quan hệ nào?
- Expected chunk IDs: GENCLN_CHEM_G12_sgkhoahoc12_chuong1_bai1_sgkhoahoc12_51b450bb_S018_P01
- Expected concepts: Công thức cấu tạo chung của chất béo.; Acid béo no; Acid béo không no
- Expected numeric: N/A

Source excerpt:

```text
Lipid là các hợp chất hữu cơ có trong tế bào sống, không tan trong nước nhưng tan trong dung môi hữu cơ không phân cực. Dựa trên cấu tạo, lipid được phân loại thành: chất béo, sáp, steroid, phospholipid,... Chất béo là triester (ester ba chức) của glycerol với acid béo, gọi chung là triglyceride. ```text H₂C-O-CO-R₁ | HC-O-CO-R₂ | H₂C-O-CO-R₃ (R₁, R₂, R₃ là các gốc hydrocarbon giống hoặc khác nhau) ``` **Công thức cấu tạo chung của chất béo.** Acid béo là carboxylic acid đơn chức. Hầu hết chúng có mạch carbon dài (thường từ 12 đến 24 nguyên tử carbon), không phân nhánh và có số nguyên tử carbon chẵn. Gốc hydrocarbon trong phân tử acid béo có thể là gốc no (acid béo bão hoà) hoặc không no chứa một hay nhiều liên kết đôi C=C (acid béo không bão hoà). Các chất béo hay gặp thường là ester của một số acid béo sau: **Acid béo no** ```text Palmitic acid: CH₃(CH₂)₁₄COOH Stearic acid: CH₃(CH₂)...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_CHEM_015

- Subject: chemistry
- Grade: 12
- Topic: lesson_22
- Question type: cross-topic-noise
- Question: Bỏ qua các từ gây nhiễu như dao động, acid, phương trình bậc hai; theo đúng mục Khái niệm, nội dung chính là gì?
- Expected chunk IDs: GENCLN_CHEM_G12_sgkhoahoc12_chuong6_bai22_sgkhoahoc12_50b04df2_S003_P01
- Expected concepts: Khái niệm; Thép để lâu ngoài không khí ẩm thường tạo thành gỉ sắt có màu nâu đỏ; vật bằng đồng để lâu trong tự nhiên có thể tạo thành gỉ đồng màu xanh
- Expected numeric: N/A

Source excerpt:

```text
Thép để lâu ngoài không khí ẩm thường tạo thành gỉ sắt có màu nâu đỏ; vật bằng đồng để lâu trong tự nhiên có thể tạo thành gỉ đồng màu xanh. Nhiều kim loại và hợp kim để lâu trong tự nhiên cũng có hiện tượng tương tự như vậy. Hiện tượng này được gọi là sự ăn mòn kim loại. Ăn mòn kim loại là sự phá huỷ kim loại hoặc hợp kim dưới tác dụng của các chất trong môi trường, trong đó kim loại bị oxi hoá. 📷 **Hình 22.1.** Một số hiện tượng ăn mòn kim loại: a) ống thép bị gỉ; b) chuông đồng bị gỉ. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_MATH_001

- Subject: math
- Grade: 10
- Topic: lesson_01
- Question type: definition
- Question: Theo học liệu, Giới thiệu chương là gì?
- Expected chunk IDs: GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S001_P01
- Expected concepts: Giới thiệu chương; Chương này cung cấp những khái niệm và kí hiệu lôgic thường dùng; củng cố và mở rộng hiểu biết ban đầu về lí thuyết tập hợp đã được học ở các lớp dưới
- Expected numeric: N/A

Source excerpt:

```text
Chương này cung cấp những khái niệm và kí hiệu lôgic thường dùng, củng cố và mở rộng hiểu biết ban đầu về lí thuyết tập hợp đã được học ở các lớp dưới. Từ đó góp phần hình thành khả năng suy luận có lí, khả năng tiếp nhận, diễn đạt các vấn đề một cách chính xác, tạo cơ sở để học tốt các nội dung toán học khác. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_MATH_002

- Subject: math
- Grade: 10
- Topic: lesson_03
- Question type: formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Giải.
- Expected chunk IDs: GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S023_P01
- Expected concepts: Chú ý; Nhận xét; Giải
- Expected numeric: N/A

Source excerpt:

```text
Gọi $x$ là số lượng vé loại 1 bán được, $x \in \mathbb{N}$, và $y$ là số lượng vé loại 2 bán được, $y \in \mathbb{N}$. Số tiền bán vé thu được là: $$ 50x + 100y $$ nghìn đồng. Người ta sẽ phải bù lỗ trong trường hợp số tiền bán vé nhỏ hơn 20 triệu đồng, tức là: $$ 50x + 100y < 20000 $$ hay: $$ x + 2y < 400. $$ Như vậy, việc giải quyết bài toán mở đầu dẫn đến việc đi tìm miền nghiệm của bất phương trình: $$ x + 2y < 400. $$ Miền nghiệm của bất phương trình bậc nhất hai ẩn này được xác định như sau: Vẽ đường thẳng: $$ d: x + 2y = 400. $$ Ta lấy gốc toạ độ $O(0; 0)$ và tính: $$ 0 + 2 \cdot 0 = 0 < 400. $$ Do đó, miền nghiệm của bất phương trình là nửa mặt phẳng bờ $d$ chứa gốc toạ độ không kể đường thẳng $d$. ![Miền nghiệm của bất phương trình x + 2y < 400](images/h2_4.png) *Hình 2.4. Miền nghiệm của bất phương trình $x + 2y < 400$.* Vậy, nếu bán được số vé loại 1 là $x$ và số vé loại 2...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_MATH_003

- Subject: math
- Grade: 10
- Topic: lesson_02
- Question type: concept
- Question: Trình bày ý chính của mục Kiến thức, kĩ năng.
- Expected chunk IDs: GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S002_P01
- Expected concepts: Kiến thức, kĩ năng; Sau bài học này; Nhận biết các khái niệm cơ bản về tập hợp
- Expected numeric: N/A

Source excerpt:

```text
Sau bài học này, em có thể: * Nhận biết các khái niệm cơ bản về tập hợp. * Thực hiện các phép toán trên tập hợp và vận dụng giải một số bài toán có nội dung thực tiễn. * Sử dụng biểu đồ Ven để biểu diễn tập hợp và các phép toán trên tập hợp. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_MATH_004

- Subject: math
- Grade: 10
- Topic: lesson_04
- Question type: calculation
- Question: Trong mục Giải, bài hoặc công thức đang yêu cầu xác định đại lượng nào và dựa trên quan hệ nào?
- Expected chunk IDs: GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S012_P01
- Expected concepts: Bước 1.; Bước 2.; Bước 3.
- Expected numeric: N/A

Source excerpt:

```text
**Bước 1.** Xác định miền nghiệm $D_1$ của bất phương trình: $$ 7x + 4y \le 2400 $$ và gạch bỏ miền còn lại. Vẽ đường thẳng: $$ d: 7x + 4y = 2400. $$ Vì: $$ 7 \cdot 0 + 4 \cdot 0 = 0 < 2400 $$ nên toạ độ điểm $O(0; 0)$ thoả mãn bất phương trình: $$ 7x + 4y \le 2400. $$ Do đó, miền nghiệm $D_1$ của bất phương trình $7x + 4y \le 2400$ là nửa mặt phẳng bờ $d$ chứa gốc toạ độ $O$. **Bước 2.** Tương tự, miền nghiệm $D_2$ của bất phương trình: $$ x + y \le 100 $$ là nửa mặt phẳng bờ $d'$ chứa gốc toạ độ $O$. **Bước 3.** Tương tự, miền nghiệm $D_3$ của bất phương trình: $$ x \ge 0 $$ là nửa mặt phẳng bờ $Oy$ chứa điểm $(1; 0)$. Khi đó, miền không bị gạch chính là giao các miền nghiệm của các bất phương trình trong hệ. Vậy miền nghiệm của hệ là miền không bị gạch trong Hình 2.6. ![Miền nghiệm của hệ bất phương trình](images/h2_6.png) *Hình 2.6. Miền nghiệm của hệ bất phương trình.* ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_MATH_005

- Subject: math
- Grade: 10
- Topic: lesson_02
- Question type: comparison
- Question: So sánh các khái niệm hoặc đại lượng chính được nêu trong mục Kiến thức.
- Expected chunk IDs: GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai2_sgktoan10_tap1_11c596e4_S012_P01
- Expected concepts: tập hợp con; tập con; Nhận xét
- Expected numeric: N/A

Source excerpt:

```text
Nếu mọi phần tử của tập hợp $T$ đều là phần tử của tập hợp $S$ thì ta nói $T$ là một **tập hợp con** hay **tập con** của $S$ và viết là: $$ T \subset S $$ Đọc là: $T$ chứa trong $S$, hoặc $T$ là tập con của $S$. > **Nhận xét** > > Từ định nghĩa trên, $T$ là tập con của $S$ nếu mệnh đề sau đúng: > > $$ > \forall x,\ x \in T \Rightarrow x \in S. > $$ > > Quy ước tập rỗng là tập con của mọi tập hợp. Người ta thường minh hoạ một tập hợp bằng một hình phẳng được bao quanh bởi một đường kín, gọi là **biểu đồ Ven**. ![Biểu đồ Ven biểu diễn một tập hợp](images/h1_2.png) *Hình 1.2. Biểu đồ Ven biểu diễn một tập hợp.* Minh hoạ $T$ là một tập con của $S$ như Hình 1.3. ![Biểu đồ Ven biểu diễn T là tập con của S](images/h1_3.png) *Hình 1.3. Biểu đồ Ven biểu diễn $T \subset S$.* > Thay cho $T \subset S$, ta còn viết $S \supset T$, đọc là $S$ chứa $T$. > Kí hiệu $T \not\subset S$ để chỉ $T$ không là...
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_MATH_006

- Subject: math
- Grade: 10
- Topic: lesson_04
- Question type: cross-topic-noise
- Question: Bỏ qua các từ gây nhiễu như dao động, acid, phương trình bậc hai; theo đúng mục HĐ2, nội dung chính là gì?
- Expected chunk IDs: GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S009_P01
- Expected concepts: HĐ2; d: x + y = 150; x 0; y 0; x + y 150.
- Expected numeric: N/A

Source excerpt:

```text
Cho đường thẳng: $$ d: x + y = 150 $$ trên mặt phẳng toạ độ $Oxy$. Đường thẳng này cắt hai trục toạ độ $Ox$ và $Oy$ tại hai điểm $A$ và $B$. a) Xác định các miền nghiệm $D_1$, $D_2$, $D_3$ của các bất phương trình tương ứng: $$ x \ge 0;\quad y \ge 0;\quad x + y \le 150. $$ b) Miền tam giác $OAB$ có phải là giao của các miền $D_1$, $D_2$ và $D_3$ hay không? c) Lấy một điểm trong tam giác $OAB$, chẳng hạn điểm $(1; 2)$, hoặc một điểm trên cạnh nào đó của tam giác $OAB$, chẳng hạn điểm $(1; 149)$, và kiểm tra xem toạ độ của các điểm đó có phải là nghiệm của hệ bất phương trình sau hay không: $$ \begin{cases} x \ge 0,\ y \ge 0,\ x + y \le 150. \end{cases} $$ > Phương trình của trục $Ox$ là $y = 0$ và phương trình của trục $Oy$ là $x = 0$. ![Miền tam giác OAB](images/h2_5.png) *Hình 2.5. Miền tam giác $OAB$.* ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_MATH_007

- Subject: math
- Grade: 10
- Topic: lesson_04
- Question type: formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Giải.
- Expected chunk IDs: GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S018_P01
- Expected concepts: Giải; x 0, y 0.; x + y 100.
- Expected numeric: N/A

Source excerpt:

```text
Giả sử cửa hàng cần nhập số máy điều hoà hai chiều là $x$ và số máy điều hoà một chiều là $y$. Khi đó ta có: $$ x \ge 0,\quad y \ge 0. $$ Vì nhu cầu của thị trường không quá 100 máy nên: $$ x + y \le 100. $$ Số tiền để nhập hai loại máy điều hoà với số lượng như trên là: $$ 20x + 10y $$ triệu đồng. Số tiền tối đa để đầu tư cho hai loại máy là 1,2 tỉ đồng, nên ta có: $$ 20x + 10y \le 1200 $$ hay: $$ 2x + y \le 120. $$ Từ đó ta thu được hệ bất phương trình bậc nhất hai ẩn sau: $$ \begin{cases} x \ge 0,\ y \ge 0,\ x + y \le 100,\ 2x + y \le 120. \end{cases} $$ Lợi nhuận thu được khi bán $x$ máy điều hoà hai chiều và $y$ máy điều hoà một chiều là: $$ F(x; y) = 3{,}5x + 2y. $$ Ta cần tìm giá trị lớn nhất của $F(x; y)$ khi $(x; y)$ thoả mãn hệ bất phương trình trên. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_MATH_008

- Subject: math
- Grade: 10
- Topic: lesson_04
- Question type: concept
- Question: Trình bày ý chính của mục ận dụng.
- Expected chunk IDs: GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S022_P01
- Expected concepts: ận dụng; Một cửa hàng có kế hoạch nhập về hai loại máy tính A và B
- Expected numeric: N/A

Source excerpt:

```text
Một cửa hàng có kế hoạch nhập về hai loại máy tính $A$ và $B$, giá mỗi chiếc lần lượt là 10 triệu đồng và 20 triệu đồng với số vốn ban đầu không vượt quá 4 tỉ đồng. Loại máy $A$ mang lại lợi nhuận 2,5 triệu đồng cho mỗi máy bán được và loại máy $B$ mang lại lợi nhuận là 4 triệu đồng cho mỗi máy bán được. Cửa hàng ước tính rằng tổng nhu cầu hằng tháng sẽ không vượt quá 250 máy. Giả sử trong một tháng cửa hàng cần nhập số máy tính loại $A$ là $x$ và số máy tính loại $B$ là $y$. a) Viết các bất phương trình biểu thị các điều kiện của bài toán thành một hệ bất phương trình rồi xác định miền nghiệm của hệ đó. b) Gọi $F$ triệu đồng là lợi nhuận mà cửa hàng thu được trong tháng đó khi bán $x$ máy tính loại $A$ và $y$ máy tính loại $B$. Hãy biểu diễn $F$ theo $x$ và $y$. c) Tìm số lượng máy tính mỗi loại cửa hàng cần nhập về trong tháng đó để lợi nhuận thu được là lớn nhất. ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_MATH_009

- Subject: math
- Grade: 10
- Topic: lesson_01
- Question type: definition
- Question: Theo học liệu, Luyện tập 1 là gì?
- Expected chunk IDs: GENCLN_MATH_G10_sgktoan10_tap1_chuong1_bai1_sgktoan10_tap1_3b75b9bd_S009_P01
- Expected concepts: Luyện tập 1; Thay dấu “?” bằng dấu “✓” vào ô thích hợp trong bảng sau; Câu Không là mệnh đề Mệnh đề đúng Mệnh đề sai
- Expected numeric: N/A

Source excerpt:

```text
Thay dấu “?” bằng dấu “✓” vào ô thích hợp trong bảng sau: | Câu | Không là mệnh đề | Mệnh đề đúng | Mệnh đề sai | | ------------------------------------------------------------------------- | ---------------- | ------------ | ----------- | | 13 là số nguyên tố. | ? | ? | ? | | Tổng độ dài hai cạnh bất kì của một tam giác nhỏ hơn độ dài cạnh còn lại. | ? | ? | ? | | Bạn đã làm bài tập chưa? | ? | ? | ? | | Thời tiết hôm nay thật đẹp! | ? | ? | ? | ---
```

Reviewer notes:

- 

## [ ] REAL_EVAL50_MATH_010

- Subject: math
- Grade: 10
- Topic: lesson_03
- Question type: formula
- Question: Nêu công thức hoặc quan hệ chính được trình bày trong mục Giải.
- Expected chunk IDs: GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai3_sgktoan10_tap1_984fc33e_S020_P01
- Expected concepts: Bước 1.; Bước 2.; Chú ý
- Expected numeric: N/A

Source excerpt:

```text
**Bước 1.** Vẽ đường thẳng: $$ d: 5x - 7y = 0 $$ trên mặt phẳng toạ độ $Oxy$. **Bước 2.** Lấy điểm $M_0(0; 1)$ không thuộc $d$ và thay $x = 0$, $y = 1$ vào biểu thức $5x - 7y$, ta được: $$ 5 \cdot 0 - 7 \cdot 1 = -7 < 0. $$ Do đó miền nghiệm của bất phương trình là nửa mặt phẳng bờ $d$ chứa điểm $M_0$, miền không bị gạch. ![Miền nghiệm của bất phương trình 5x - 7y <= 0](images/h2_3.png) *Hình 2.3. Miền nghiệm của bất phương trình $5x - 7y \le 0$.* > **Chú ý** > Miền nghiệm của bất phương trình $ax + by < c$ là miền nghiệm của bất phương trình $ax + by \le c$ bỏ đi đường thẳng $ax + by = c$ và biểu diễn đường thẳng bằng nét đứt. ---
```

Reviewer notes:

- 

