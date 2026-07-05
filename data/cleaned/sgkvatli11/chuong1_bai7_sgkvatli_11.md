# Bài 7: Bài tập về sự chuyển hóa năng lượng trong dao động điều hòa

> Ta có thể sử dụng định luật bảo toàn cơ năng để tìm li độ và vận tốc của vật dao động điều hòa được không?

---

## 1. Các ví dụ

### Ví dụ 1

Một con lắc đơn gồm vật nặng có kích thước nhỏ, có khối lượng (m), treo ở đầu một sợi dây mềm không giãn có độ dài (l) và có khối lượng không đáng kể như Hình 7.1.

Đưa vật nặng ra khỏi vị trí cân bằng (O) sao cho dây treo hợp với (Q_0) một góc (\alpha_0), với:

$$
\alpha_0 \le 10^\circ
$$

rồi thả nhẹ cho con lắc dao động điều hòa trên cung tròn (AOB).

a. Tính thế năng của con lắc; động năng của vật ở các vị trí (A), (O), (B) và vị trí bất kì có li độ góc (\alpha).

b. Ở vị trí nào động năng bằng thế năng?

---

### Hình 7.1

![Hình 7.1 - Con lắc đơn dao động trên cung tròn AOB](assets/images/hinh-7-1.png)

**Nội dung hình**

* Con lắc đơn gồm vật nặng khối lượng (m), dây treo dài (l).
* Vị trí cân bằng (O).
* Hai vị trí biên (A), (B).
* Li độ góc (\alpha), biên độ góc (\alpha_0).
* Vật dao động điều hòa trên cung tròn (AOB).

---

### Giải

#### a. Xác định thế năng và động năng

Chọn mốc để tính thế năng của vật là vị trí cân bằng (O).

**Thế năng và động năng của vật tại các vị trí (A) và (B):**

$$
W_t=W_{tmax}=mgl(1-\cos\alpha_0)
$$

Với góc nhỏ:

$$
1-\cos\alpha_0
==============

2\sin^2\frac{\alpha_0}{2}
\approx
\frac{\alpha_0^2}{2}
$$

nên:

$$
W_t
\approx
mgl\frac{\alpha_0^2}{2}
$$

với (\alpha_0) tính theo radian.

Động năng:

$$
W_đ=0
$$

---

**Thế năng và động năng của vật tại vị trí (O):**

$$
W_t=0
$$

$$
W_đ=W_{đmax}
============

mgl(1-\cos\alpha_0)
\approx
mgl\frac{\alpha_0^2}{2}
$$

---

**Thế năng và động năng của vật tại vị trí bất kì có li độ góc (\alpha):**

$$
W_t
===

mgl(1-\cos\alpha)
\approx
mgl\frac{\alpha^2}{2}
$$

với (\alpha) tính theo radian.

Áp dụng định luật bảo toàn cơ năng:

$$
W_đ=W_{tmax}-W_t
$$

suy ra:

$$
W_đ
\approx
mgl
\left(
\frac{\alpha_0^2}{2}
--------------------

\frac{\alpha^2}{2}
\right)
$$

---

#### b. Vị trí động năng bằng thế năng

Khi:

$$
W_đ=W_t
$$

Áp dụng định luật bảo toàn cơ năng:

$$
W=W_{tmax}=W_đ+W_t=2W_t
$$

hay:

$$
mgl\frac{\alpha_0^2}{2}
=======================

2mgl\frac{\alpha^2}{2}
$$

Suy ra:

$$
\alpha
======

\pm
\frac{\alpha_0}{\sqrt{2}}
$$

---

### Kết luận

Ở các vị trí có li độ góc:

$$
\alpha
======

\pm
\frac{\alpha_0}{\sqrt{2}}
$$

thì:

$$
W_đ=W_t
$$

---

### Ví dụ 2

Một vật có khối lượng:

$$
m=200g
$$

dao động điều hòa với tần số góc:

$$
\omega=2\pi;rad/s
$$

biên độ:

$$
A=10cm
$$

Xác định thế năng của con lắc tại thời điểm vật có tốc độ:

$$
v=10cm/s
$$

---

### Giải

Ta đã biết trong dao động điều hòa, cơ năng được bảo toàn:

$$
W=W_t+W_đ
$$

Suy ra thế năng:

$$
W_t=W-W_đ
$$

Mà:

$$
W=\frac{m\omega^2A^2}{2}
$$

và:

$$
W_đ=\frac{mv^2}{2}
$$

nên:

$$
W_t
===

## \frac{m\omega^2A^2}{2}

# \frac{mv^2}{2}

\frac{m}{2}
\left(
\omega^2A^2-v^2
\right)
$$

Thay số:

$$
W_t
===

\frac{0,2}{2}
\left[
(2\pi)^2(0,1)^2-(0,1)^2
\right]
$$

Suy ra:

$$
W_t\approx 0,038J
$$

---

### Ví dụ 3

Một con lắc lò xo có độ cứng:

$$
k=100N/m
$$

dao động điều hòa.

Gọi (W_t), (W_đ) lần lượt là thế năng của lò xo và động năng của vật, (W_0) là cơ năng của con lắc lò xo.

Đồ thị biểu diễn sự phụ thuộc của thế năng (W_t) và động năng (W_đ) của con lắc vào li độ (x) như Hình 7.2.

Tính (W_0).

---

### Hình 7.2

![Hình 7.2 - Đồ thị thế năng và động năng theo li độ](assets/images/hinh-7-2.png)

**Mô tả hình**

* Trục hoành biểu diễn li độ (x), đơn vị cm.
* Trục tung biểu diễn năng lượng (W), đơn vị J.
* Đường cong thế năng (W_t) là parabol hướng lên:

  * (W_t=0) tại vị trí cân bằng (x=0).
  * (W_t) tăng khi (|x|) tăng.
* Đường cong động năng (W_đ) là parabol hướng xuống:

  * (W_đ) cực đại tại vị trí cân bằng (x=0).
  * (W_đ=0) tại hai vị trí biên (x=\pm A).
* Hai đồ thị cắt nhau tại mức năng lượng:

$$
W_t=W_đ=\frac{W_0}{2}
$$

* Từ hình, tại giao điểm:

$$
x=\pm 8cm
$$

hay:

$$
x=\pm 0,08m
$$

---

### Giải

Từ đồ thị, ta xác định được:

$$
x=\pm 8cm=\pm 0,08m
$$

thì:

$$
W_đ=W_t
$$

Mặt khác:

$$
W_0=W_t+W_đ
$$

nên khi:

$$
W_đ=W_t
$$

ta có:

$$
W_0=2W_t
$$

Thế năng của con lắc lò xo là:

$$
W_t=\frac{1}{2}kx^2
$$

Suy ra:

$$
W_0
===

# 2\cdot\frac{1}{2}kx^2

kx^2
$$

Thay số:

$$
W_0
===

# 100\cdot(0,08)^2

0,64J
$$

Vậy:

$$
W_0=0,64J
$$

---

## 2. Bài tập luyện tập

### Bài 1

Hình 7.3 mô tả một máy đo địa chấn đơn giản hoạt động theo nguyên tắc sau:

* Khi xảy ra động đất thì hệ gồm lò xo và vật nặng của máy sẽ dao động theo tần số của địa chấn.
* Bút dạ gắn với vật nặng sẽ ghi lại đồ thị của địa chấn trên cuộn giấy quay đều.

Biết sóng địa chấn có tần số nằm trong khoảng:

$$
30Hz\le f\le 40Hz
$$

Hãy giải thích tại sao tần số riêng của hệ vật nặng và lò xo trong máy địa chấn phải có giá trị nhỏ hơn tần số này rất nhiều.

---

### Hình 7.3

![Hình 7.3 - Máy đo địa chấn đơn giản](assets/images/hinh-7-3.png)

**Mô tả hình**

Máy đo địa chấn gồm:

* Một giá đỡ cố định.
* Một lò xo treo vật nặng.
* Một bút ghi gắn với vật nặng.
* Một trống giấy quay đều.

Khi có dao động từ mặt đất:

* Giá đỡ và trống giấy chuyển động theo địa chấn.
* Vật nặng do quán tính có xu hướng giữ nguyên trạng thái chuyển động.
* Chuyển động tương đối giữa vật nặng và trống giấy tạo nên đường ghi địa chấn.

---

### Bài 2

Đồ thị Hình 7.4 mô tả mối liên hệ giữa gia tốc và li độ của một vật dao động điều hòa.

Sử dụng số liệu trong đồ thị Hình 7.4 để tính tần số của dao động.

---

### Hình 7.4

![Hình 7.4 - Đồ thị gia tốc theo li độ](assets/images/hinh-7-4.png)

**Mô tả hình**

Đồ thị biểu diễn mối quan hệ giữa:

* Trục hoành: li độ (x), đơn vị cm.
* Trục tung: gia tốc (a), đơn vị (m/s^2).

Đặc điểm:

* Đồ thị là một đường thẳng đi qua gốc tọa độ.
* Khi:

$$
x=-8cm
$$

thì:

$$
a\approx 40m/s^2
$$

* Khi:

$$
x=8cm
$$

thì:

$$
a\approx -40m/s^2
$$

Điều này phù hợp với phương trình dao động điều hòa:

$$
a=-\omega^2x
$$

---

### Dữ liệu có thể khai thác từ đồ thị

Chuyển đổi:

$$
8cm=0,08m
$$

Suy ra:

$$
\omega^2
========

# \frac{|a|}{|x|}

# \frac{40}{0,08}

500
$$

Do đó:

$$
\omega
======

\sqrt{500}
\approx 22,36rad/s
$$

Tần số:

$$
f
=

# \frac{\omega}{2\pi}

\frac{22,36}{2\pi}
\approx 3,56Hz
$$

Vậy:

$$
f\approx 3,6Hz
$$

---

### Bài 3

Hình 7.5 là đồ thị động năng theo thời gian của một vật khối lượng:

$$
m=0,4kg
$$

dao động điều hòa.

Tại thời điểm ban đầu, vật đang chuyển động theo chiều dương, lấy:

$$
\pi^2=10
$$

Viết phương trình dao động của vật.

---

### Hình 7.5

![Hình 7.5 - Đồ thị động năng theo thời gian](assets/images/hinh-7-5.png)

**Mô tả hình**

Đồ thị biểu diễn sự phụ thuộc của động năng (W_đ) theo thời gian (t).

* Trục hoành: thời gian (t), đơn vị s.
* Trục tung: động năng (W_đ), đơn vị J.
* Động năng cực đại:

$$
W_{đmax}=0,02J
$$

* Tại thời điểm:

$$
t=\frac{1}{6}s
$$

động năng bằng 0.

* Đồ thị động năng có chu kì bằng một nửa chu kì dao động của vật:

$$
T_{W_đ}=\frac{T}{2}
$$

---

### Bài 4

Một vật có khối lượng (m) dao động điều hòa với tần số góc (\omega) và biên độ (A).

a. Khi vật có li độ bằng một nửa biên độ thì động năng và thế năng chiếm bao nhiêu phần trăm so với cơ năng?

b. Tại li độ nào thì thế năng bằng động năng?

---

## Em đã học

> Cách xác định các đại lượng vận tốc, gia tốc, năng lượng, động năng, thế năng,... khi biết phương trình hoặc đồ thị của vật dao động điều hòa và ngược lại.

---

## Em có thể

> Phân tích được sự chuyển hóa năng lượng trong dao động điều hòa trong một số bài tập cụ thể.
