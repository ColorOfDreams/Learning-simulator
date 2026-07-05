# Bài 2: Mô tả dao động điều hòa

> Để vẽ đồ thị hoặc viết phương trình của một dao động điều hòa cần biết những đại lượng vật lí nào?

---

## 1. Các đại lượng đặc trưng của dao động điều hòa

Từ đồ thị và phương trình của dao động điều hòa ở Bài 1, ta có thể xác định được các đại lượng dùng để mô tả dao động điều hòa.

### Các đại lượng đặc trưng

* **Li độ**: (x) là độ dịch chuyển từ vị trí cân bằng đến vị trí của vật tại thời điểm (t).
* **Biên độ**: (A) là độ dịch chuyển cực đại của vật tính từ vị trí cân bằng.
* **Chu kì**: là khoảng thời gian để vật thực hiện được một dao động, kí hiệu là (T).
* Đơn vị của chu kì dao động là giây (s).
* **Tần số**: là số dao động mà vật thực hiện được trong một giây, kí hiệu là (f).

Ta có:

$$
f=\frac{1}{T}
$$

* Đơn vị của tần số là (s^{-1}), gọi là héc (Hz).
* **Tần số góc**: (\omega).

---

### Câu hỏi

> Hình 2.1 là đồ thị dao động điều hòa của một vật. Hãy xác định:
>
> * Biên độ, chu kì, tần số của dao động.
> * Nêu thời điểm mà vật có li độ:
>
> $$
> x=0;\qquad x=0,1,m
> $$

---

### Hình 2.1

![Hình 2.1 - Đồ thị dao động điều hòa](assets/images/hinh-2-1.png)

**Mô tả sơ bộ**

* Đồ thị hình sin.
* Trục tung: (x(m)), từ (-0,2) đến (0,2).
* Đỉnh tại:

$$
x=0,2
$$

ứng với:

$$
t=0,1s;\qquad t=0,5s
$$

* Cực tiểu tại:

$$
x=-0,2
$$

ứng với:

$$
t=0,3s
$$

* Giao với trục thời gian tại:

$$
t=0,2s;\qquad t=0,4s
$$

---

Theo đồ thị Hình 2.1, cứ sau mỗi chu kì thì dao động của vật lại lặp lại như cũ. Như vậy, theo phương trình dao động ta phải có:

$$
x=A\cos[\omega(t+T)]
=A\cos(\omega t)
$$

Theo tính chất của hàm cosin ta suy ra:

$$
\omega T=2\pi
$$

hay

$$
\omega=\frac{2\pi}{T}
\quad(rad/s)
$$

Đại lượng (\omega) được gọi là **tần số góc**.

Trong dao động điều hòa của mỗi vật thì bốn đại lượng:

* Biên độ (A)
* Chu kì (T)
* Tần số (f)
* Tần số góc (\omega)

là những đại lượng không đổi, không phụ thuộc vào thời điểm quan sát.

Với các vật khác nhau thì các đại lượng này khác nhau. Vì thế chúng là những đại lượng đặc trưng cho dao động điều hòa.

---

### Câu hỏi

> Từ Hình 2.1 hãy xác định tần số góc của dao động của vật.

---

## 2. Pha ban đầu. Độ lệch pha

### 2.1. Pha ban đầu

Hình 2.2 là đồ thị của hai vật dao động điều hòa cùng chu kì, cùng biên độ nhưng dao động 1 luôn đạt tới giá trị cực đại sớm hơn dao động 2 một thời gian là:

$$
\frac{T}{4}
$$

Từ đồ thị ta thấy:

* Tại thời điểm ban đầu ((t=0)), vật dao động điều hòa 1 đang ở vị trí biên:

$$
x=A
$$

và sẽ dịch chuyển về vị trí cân bằng.

* Vật dao động điều hòa 2 đang ở vị trí cân bằng và sẽ dịch chuyển về phía:

$$
x>0
$$

Các phương trình dao động tương ứng với đồ thị Hình 2.2 có pha ban đầu lần lượt là:

$$
x_1=A\cos(\omega t)
$$

với

$$
\varphi_1=0
$$

và

$$
x_2=A\cos\left(\omega t-\frac{\pi}{2}\right)
$$

với

$$
\varphi_2=-\frac{\pi}{2}
$$

Như vậy, pha ban đầu (\varphi) cho biết tại thời điểm bắt đầu quan sát vật dao động điều hòa ở đâu và sẽ đi về phía nào.

Nó có giá trị nằm trong khoảng:

$$
-\pi \le \varphi \le \pi
$$

(rad).

---

### Hình 2.2

![Hình 2.2 - Hai dao động cùng biên độ cùng chu kì](assets/images/hinh-2-2.png)

---

### Câu hỏi

> Hình 2.3 là đồ thị dao động điều hòa của một con lắc.
>
> Tại:
>
> $$
> t=0
> $$
>
> con lắc có:
>
> $$
> x=-A
> $$
>
> đạt cực đại:
>
> $$
> x=A
> $$
>
> tại:
>
> $$
> t=\frac{T}{2}
> $$
>
> và cắt trục tại:
>
> $$
> t=\frac{T}{4}
> $$
>
> Hãy cho biết:
>
> * Vị trí và hướng dịch chuyển của con lắc tại thời điểm ban đầu.
> * Pha ban đầu của dao động.

---

### Hình 2.3

![Hình 2.3 - Đồ thị xác định pha ban đầu](assets/images/hinh-2-3.png)

---

### 2.2. Độ lệch pha giữa hai dao động cùng chu kì

Đồ thị Hình 2.2 còn cho thấy tại bất kì thời điểm nào thì độ lệch pha giữa hai dao động trên cũng bằng:

$$
\frac{\pi}{2}
$$

Trong khoa học và trong kĩ thuật, độ lệch pha quan trọng hơn pha, vì nó là đại lượng không đổi, không phụ thuộc vào thời điểm quan sát.

Nếu:

$$
\varphi_1>\varphi_2
$$

thì dao động 1 **sớm pha** hơn dao động 2.

Nếu:

$$
\varphi_1<\varphi_2
$$

thì dao động 1 **trễ pha** hơn dao động 2.

Nếu:

$$
\varphi_1=\varphi_2
$$

thì dao động 1 **cùng pha (đồng pha)** với dao động 2.

Nếu:

$$
\varphi_1=\varphi_2\pm\pi
$$

thì dao động 1 **ngược pha** với dao động 2.

---

### Câu hỏi

> Hãy chứng minh rằng độ lệch pha giữa hai dao động cùng chu kì bằng độ lệch pha ban đầu.

---

### Câu hỏi

> Hai con lắc 1 và 2 dao động điều hòa tại cùng thời điểm quan sát, vị trí của chúng được biểu diễn trên Hình 2.5a và Hình 2.5b.
>
> Hỏi dao động của con lắc nào sớm pha hơn và sớm hơn bao nhiêu?

---

### Hình 2.4

![Hình 2.4 - Dao động đồng pha và lệch pha](assets/images/hinh-2-4.png)

**Nội dung hình**

* Các đồ thị dao động đồng pha.
* Các đồ thị dao động lệch pha.

---

### Hình 2.5

![Hình 2.5 - So sánh pha giữa hai con lắc](assets/images/hinh-2-5.png)

**Nội dung hình**

* Hai con lắc chuyển động từ phải sang trái.
* Con lắc (1) ở vị trí biên.
* Con lắc (2) ở vị trí cân bằng.

---

## 3. Bài tập ví dụ về các đại lượng đặc trưng của dao động điều hòa

### Ví dụ 1

Đồ thị li độ – thời gian của một vật dao động điều hòa được mô tả trên Hình 2.6.

---

### Hình 2.6

![Hình 2.6 - Đồ thị li độ thời gian](assets/images/hinh-2-6.png)

**Mô tả sơ bộ**

* (x) từ (-20) cm đến (20) cm.
* (t) từ (0) đến (3,5) s.
* Bắt đầu:

$$
t=0,\quad x=20
$$

* Giao với trục thời gian tại:

$$
t=0,5;;1,5;;2,5;;3,5
$$

* Cực đại:

$$
x=20
$$

tại:

$$
t=0;;2
$$

* Cực tiểu:

$$
x=-20
$$

tại:

$$
t=1;;3
$$

---

### Yêu cầu

a. Xác định biên độ, chu kì, tần số, tần số góc, pha ban đầu và viết phương trình dao động.

b. Xác định pha của dao động tại thời điểm:

$$
t=2,5s
$$

---

### Giải

a. Từ đồ thị ta xác định được:

Biên độ:

$$
A=20cm
$$

Chu kì:

$$
T=2,5-0,5=2,0s
$$

Áp dụng công thức:

$$
f=\frac{1}{T}=0,5Hz
$$

$$
\omega=\frac{2\pi}{T}=2\pi f
$$

(rad/s)

Khi:

$$
t=0
$$

ta có:

$$
x=A\cos\varphi
$$

suy ra:

$$
\cos\varphi=1
$$

nên:

$$
\varphi=0
$$

(rad)

Do đó phương trình dao động là:

$$
x=20\cos(\omega t)
\quad(cm)
$$

b. Từ phương trình dao động:

$$
\varphi=\pi t+\frac{\pi}{2}
$$

Thay:

$$
t=2,5s
$$

suy ra:

$$
\varphi=3\pi
$$

(rad)

---

### Ví dụ 2

Hai vật dao động điều hòa A và B có cùng tần số nhưng lệch pha nhau được mô tả trên Hình 2.7.

---

### Hình 2.7

![Hình 2.7 - Hai dao động lệch pha](assets/images/hinh-2-7.png)

**Nội dung hình**

Một đồ thị gồm hai đường hình sin biểu diễn dao động của A và B.

---

### Yêu cầu

a. Xác định li độ của B khi A có li độ cực đại.

b. Xác định li độ của A khi B có li độ cực đại.

c. Hãy cho biết A hay B đạt tới li độ cực đại trước (không kể thời điểm (t=0)).

d. Xác định độ lệch pha của dao động A so với dao động B.

---

### Giải

Từ đồ thị cho thấy:

a. Khi A có li độ cực đại thì B có:

$$
x=0
$$

b. Khi B có li độ cực đại thì A có:

$$
x=0
$$

c. A có li độ cực đại trước B.

d. Dao động A sớm pha:

$$
\frac{\pi}{2}
$$

so với dao động B.

---

## Hoạt động

### Hoạt động 1

Xét một vật dao động điều hòa có:

* Biên độ:

$$
A=10cm
$$

* Tần số:

$$
f=5Hz
$$

Tại thời điểm ban đầu ((t=0)), vật có li độ cực đại theo chiều dương.

Yêu cầu:

* Xác định chu kì, tần số góc, pha ban đầu của dao động.
* Viết phương trình và vẽ đồ thị ((x-t)) của dao động.

---

### Hoạt động 2

Cho hai con lắc đơn dao động điều hòa.

Biết phương trình dao động của con lắc thứ nhất là:

$$
x=20\cos\left(20\pi t+\frac{\pi}{2}\right)
\quad(cm)
$$

Con lắc thứ hai có cùng biên độ và tần số nhưng lệch về thời gian so với con lắc thứ nhất một phần tư chu kì.

Hãy viết phương trình dao động của con lắc thứ hai.

---

## Câu hỏi trắc nghiệm

### Câu 1

Đại lượng nào dưới đây đặc trưng cho độ lệch về thời gian giữa hai dao động điều hòa cùng chu kì?

A. Li độ.

B. Pha.

C. Pha ban đầu.

D. Độ lệch pha.

---

### Câu 2

Hãy chứng minh rằng độ lệch pha giữa hai dao động điều hòa cùng tần số là đại lượng không đổi và bằng độ lệch pha ban đầu.

---

## Em đã học

> Chu kì (T) là khoảng thời gian để vật thực hiện một dao động.

> Đơn vị của chu kì là giây (s).

> Tần số (f) là số dao động mà vật thực hiện được trong một giây.

> Đơn vị của tần số là (1/s), gọi là héc (Hz).

> Trong dao động điều hòa, giữa tần số góc (\omega), chu kì (T) và tần số (f) có mối liên hệ:
>
> $$
> \omega=\frac{2\pi}{T}=2\pi f
> $$

> Đơn vị của tần số góc là rad/s.

> Độ lệch pha giữa hai dao động điều hòa cùng chu kì luôn bằng độ lệch pha ban đầu.

---

## Em có thể

> Dùng đồ thị li độ – thời gian có dạng hình sin hoặc phương trình của dao động điều hòa để xác định các đại lượng như biên độ, chu kì, tần số, tần số góc và pha ban đầu của dao động.

> Biết cách xác định độ lệch pha giữa hai dao động điều hòa cùng chu kì.
