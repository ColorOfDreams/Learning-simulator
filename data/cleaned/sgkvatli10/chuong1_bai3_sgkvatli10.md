# Bài 3: Thực hành tính sai số trong phép đo. Ghi kết quả đo

> Không một phép đo nào có thể cho ta giá trị đúng của đại lượng cần đo, mọi phép đo đều có sai số.
>
> Làm thế nào để xác định được các sai số này? Nguyên nhân gây ra các sai số là gì và cách khắc phục như thế nào?

---

## I. Phép đo trực tiếp và phép đo gián tiếp

Đo trực tiếp một đại lượng bằng dụng cụ đo, kết quả được đọc trực tiếp trên dụng cụ đo được gọi là **phép đo trực tiếp**.

Đo một đại lượng không trực tiếp mà thông qua công thức liên hệ với các đại lượng có thể đo trực tiếp gọi là **phép đo gián tiếp**.

### Câu hỏi

Em hãy lập phương án đo tốc độ chuyển động của chiếc xe ô tô đồ chơi chỉ dùng thước và đồng hồ bấm giây, sau đó trả lời các câu hỏi sau:

a) Để đo tốc độ chuyển động của chiếc xe cần đo những đại lượng nào?

b) Xác định tốc độ chuyển động của xe theo công thức nào?

c) Phép đo nào là phép đo trực tiếp? Tại sao?

d) Phép đo nào là phép đo gián tiếp? Tại sao?

---

## II. Sai số phép đo

### 1. Phân loại sai số

#### a) Sai số hệ thống

Khi sử dụng dụng cụ đo để đo các đại lượng vật lí luôn có sự sai lệch do đặc điểm và cấu tạo của dụng cụ gây ra.

Sự sai lệch này gọi là **sai số dụng cụ** hay **sai số hệ thống**.

Sai số hệ thống có:

- Nguyên nhân khách quan (do dụng cụ đo).
- Nguyên nhân chủ quan (do người đo), cần loại bỏ.

> **Kết nối tri thức với cuộc sống**
>
> Sai số do dụng cụ sử dụng đo thường lấy bằng **một nửa độ chia nhỏ nhất (ĐCNN)** của dụng cụ đo (ví dụ thước có ĐCNN là 1 mm thì sai số dụng cụ là 0,5 mm), hoặc được ghi trực tiếp trên dụng cụ do nhà sản xuất xác định.

---

#### b) Sai số ngẫu nhiên

Khi lặp lại các phép đo, ta nhận được các giá trị khác nhau. Sự sai lệch này không có nguyên nhân rõ ràng nên gọi là **sai số ngẫu nhiên**.

Sai số ngẫu nhiên có thể do:

- Thao tác đo không chuẩn.
- Điều kiện làm thí nghiệm không ổn định.
- Hạn chế của giác quan.

Để khắc phục, người ta thường tiến hành thí nghiệm nhiều lần và tính sai số.

---

### 2. Cách xác định sai số phép đo

Sai số ngẫu nhiên tuyệt đối của từng lần đo là trị tuyệt đối của hiệu giữa giá trị trung bình và giá trị đo được.

\[
\Delta A_1 = |\overline{A}-A_1|
\]

\[
\Delta A_2 = |\overline{A}-A_2|
\]

\[
...
\]

\[
\Delta A_n = |\overline{A}-A_n|
\]

Trong đó:

\[
\overline{A}=\frac{A_1+A_2+\cdots+A_n}{n}
\]

Sai số ngẫu nhiên tuyệt đối trung bình:

\[
\overline{\Delta A}
=
\frac{\Delta A_1+\Delta A_2+\cdots+\Delta A_n}{n}
\tag{3.2}
\]

Sai số tuyệt đối của phép đo:

\[
\Delta A=\overline{\Delta A}+\Delta A_{dc}
\]

Trong đó:

- \(\overline{\Delta A}\): sai số ngẫu nhiên trung bình.
- \(\Delta A_{dc}\): sai số dụng cụ.

Sai số tỉ đối:

\[
\delta A=\frac{\Delta A}{\overline{A}}\times100\%
\tag{3.3}
\]

Sai số tỉ đối cho biết mức độ chính xác của phép đo.

---

### 3. Cách xác định sai số phép đo gián tiếp

Đối với phép đo gián tiếp, áp dụng các quy tắc sau.

#### a) Tổng hoặc hiệu

Nếu

\[
A=B+C
\]

thì

\[
\Delta A=\Delta B+\Delta C
\]

---

#### b) Tích hoặc thương

Nếu

\[
A=B\cdot C
\]

thì

\[
\delta A=\delta B+\delta C
\]

Sau khi tính được sai số tỉ đối, sử dụng công thức (3.3) để tính sai số tuyệt đối.

---

### Ví dụ 1

Đo quãng đường:

\[
s=s_1+s_2
\]

Sai số tuyệt đối:

\[
\Delta s=\Delta s_1+\Delta s_2
\]

---

### Ví dụ 2

Đo tốc độ:

\[
v=\frac{s}{t}
\]

Sai số tỉ đối:

\[
\delta v=\delta s+\delta t
\]

hay

\[
\delta v
=
\frac{\Delta s}{s}\times100\%
+
\frac{\Delta t}{t}\times100\%
\]

Sai số tuyệt đối:

\[
\Delta v
=
\delta v\cdot\frac{v}{100}
\]

---

> **Em có biết?**
>
> Nếu
>
> \[
> A=B\sqrt{C}
> \]
>
> thì
>
> \[
> \delta A=\delta B+\frac{1}{2}\delta C
> \]

---

### 4. Cách ghi kết quả đo

Kết quả đo đại lượng \(A\) được ghi dưới dạng:

\[
(\overline{A}-\Delta A)\le A\le(\overline{A}+\Delta A)
\]

hoặc

\[
A=\overline{A}\pm\Delta A
\]

Trong đó:

- \(\Delta A\) là sai số tuyệt đối.
- Giá trị trung bình được viết đến bậc thập phân tương ứng với sai số tuyệt đối.

#### Quy tắc làm tròn số

- Nếu chữ số bị bỏ nhỏ hơn 5 thì giữ nguyên chữ số phía trước.
- Nếu chữ số bị bỏ lớn hơn hoặc bằng 5 thì tăng chữ số phía trước thêm một đơn vị.

> **Lưu ý**
>
> Kí hiệu \(\Delta\) (Delta) đọc là "đen-ta".

---

## Thực hành

Dùng:

- Một thước có ĐCNN 1 mm.
- Một đồng hồ đo thời gian có ĐCNN 0,01 s.

Đo **5 lần** thời gian chuyển động của chiếc xe đồ chơi chạy bằng pin từ điểm A đến điểm B.

### Bảng 3.1

| n | s (m) | Δs (m) | t (s) | Δt (s) |
|---|------:|-------:|------:|-------:|
|1|||||
|2|||||
|3|||||
|4|||||
|5|||||
|**Trung bình**| **\(\overline{s}=\)** | **\(\Delta s=\)** | **\(\overline{t}=\)** | **\(\Delta t=\)** |

---

### Hình 3.1

![Hình 3.1 - Thí nghiệm đo tốc độ](assets/images/hinh-3-1.png)

**Nội dung hình**

Hình minh họa thí nghiệm đo tốc độ của xe đồ chơi chuyển động từ điểm A đến điểm B.

---

### Câu hỏi

a) Nguyên nhân nào gây ra sự sai khác giữa các lần đo?

b) Tính sai số tuyệt đối của phép đo \(s\), \(t\) và điền vào Bảng 3.1.

c) Viết kết quả đo:

\[
s=\ldots
\]

\[
t=\ldots
\]

d) Tính sai số tỉ đối:

\[
\delta t=\frac{\Delta t}{t}\times100\%
\]

\[
\delta s=\frac{\Delta s}{s}\times100\%
\]

Từ đó tính:

\[
\delta v
\]

và

\[
\Delta v
\]

---

## Em đã học

- Có hai loại phép đo là **phép đo trực tiếp** và **phép đo gián tiếp**.
- Có hai loại sai số gồm **sai số dụng cụ** và **sai số ngẫu nhiên**.
- Cách ghi kết quả đo:

\[
A=\overline{A}\pm\Delta A
\]

trong đó

\[
\Delta A=\overline{\Delta A}+\Delta A_{dc}
\]

---

## Em có thể

1. Giải thích được tại sao để đo một đại lượng chính xác người ta cần lặp lại phép đo nhiều lần và tính sai số.

2. Tính được sai số tuyệt đối và sai số tỉ đối của phép đo trực tiếp cũng như phép đo gián tiếp.

---

## Em có biết?

Sai số và kết quả của phép đo có thể được biểu diễn bằng **đồ thị**.

Phương pháp đồ thị cho phép tìm quy luật phụ thuộc của đại lượng \(y\) vào đại lượng \(x\).

Khi sử dụng đồ thị cần chú ý:

- Mỗi giá trị đo đều có sai số \(\pm\Delta x\) và \(\pm\Delta y\).
- Trên đồ thị, mỗi điểm thực nghiệm được biểu diễn bằng một điểm nằm trong **ô bao sai số** có kích thước:

- Chiều rộng: \(2\Delta x\)
- Chiều cao: \(2\Delta y\)

### Hình 3.2

![Hình 3.2 - Biểu diễn sai số bằng đồ thị](assets/images/hinh-3-2.png)

**Nội dung hình**

Hình minh họa cách biểu diễn sai số trên đồ thị bằng ô bao sai số có kích thước \(2\Delta x\) và \(2\Delta y\).