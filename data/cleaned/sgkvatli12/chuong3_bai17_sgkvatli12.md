# Bài 17: Máy phát điện xoay chiều

> Dòng điện xoay chiều được sử dụng rất phổ biến trong đời sống.
>
> Dòng điện xoay chiều được tạo ra bằng cách nào?

---

## 1. Nguyên tắc tạo ra dòng điện xoay chiều

Xét một khung dây dẫn $MNPQ$ có diện tích $S$, quay đều với tốc độ góc $\omega$ quanh một trục $OO'$ vuông góc với các đường sức của một từ trường đều có cảm ứng từ $\vec{B}$.

Theo hiện tượng cảm ứng điện từ đã học ở Bài 16, trong khung dây xuất hiện một suất điện động biến đổi theo thời gian:

$$
e=E_0\cos(\omega t+\varphi)
\tag{17.1}
$$

Trong đó:

* $E_0$ là suất điện động cực đại trong khung dây.
* $\omega$ là tần số góc.
* $\varphi$ là pha ban đầu của suất điện động.

Với một khung dây một vòng:

$$
E_0=BS\omega
$$

Nếu khung dây dẫn $MNPQ$ có $N$ vòng dây thì suất điện động cực đại của khung dây là:

$$
E_0=NBS\omega
$$

Suất điện động biến đổi theo thời gian theo định luật dạng cosin hoặc sin được gọi là **suất điện động xoay chiều**.

Chu kì $T$ và tần số $f$ của suất điện động liên hệ với tần số góc $\omega$ bởi các công thức:

$$
T=\frac{2\pi}{\omega}
$$

$$
f=\frac{\omega}{2\pi}
$$

Khi nối hai đầu khung dây dẫn trên với điện trở thuần $R$ tạo thành mạch kín, thì dòng điện trong khung dây biến thiên theo thời gian với tần số bằng tần số của suất điện động xoay chiều.

Dòng điện này gọi là **dòng điện xoay chiều**.

Do đó:

> Nguyên tắc tạo ra dòng điện xoay chiều dựa trên hiện tượng cảm ứng điện từ là làm cho từ thông qua khung dây dẫn biến thiên điều hòa theo thời gian.

---

### Hình 17.1

![Hình 17.1 - Khung dây dẫn quay trong từ trường đều](assets/images/hinh-17-1.png)

**Nội dung hình**

Hình biểu diễn khung dây dẫn $MNPQ$ có trục quay $OO'$ đặt vuông góc với cảm ứng từ $\vec{B}$.

Khi khung dây quay đều trong từ trường đều, từ thông qua khung dây biến thiên theo thời gian, làm xuất hiện suất điện động cảm ứng xoay chiều.

---

### Câu hỏi

1. Khung dây dẫn trong Hình 17.2 ở vị trí nào thì suất điện động có giá trị cực đại?

   Giải thích.

2. Giả sử tại thời điểm $t$, từ thông qua khung dây dẫn phẳng $MNPQ$ là:

$$
\Phi=BS\cos\alpha=BS\cos\omega t
$$

Hãy chứng tỏ suất điện động cảm ứng xuất hiện trong khung dây này có dạng:

$$
e=BS\omega\cos\left(\omega t+\frac{\pi}{2}\right)
$$

---

### Hình 17.2

![Hình 17.2 - Suất điện động xoay chiều khi khung dây quay trong từ trường](assets/images/hinh-17-2.png)

**Nội dung hình**

Hình mô tả suất điện động xoay chiều khi khung dây $MNPQ$ quay trong từ trường đều $\vec{B}$.

Hình gồm:

* Các vị trí khác nhau của khung dây trong một chu kì quay.
* Đồ thị suất điện động $e$ theo thời gian $t$.
* Một chu kì của suất điện động xoay chiều.

---

### Câu hỏi

Dựa trên nguyên tắc tạo ra dòng điện xoay chiều, hãy thực hiện các nhiệm vụ sau:

1. Làm thế nào để dẫn dòng điện ra mạch ngoài khi khung dây dẫn quay đều trong từ trường?

2. Thảo luận về:

   * Nguyên tắc tạo ra suất điện động xoay chiều.
   * Các yếu tố cần để tạo ra dòng điện xoay chiều.
   * Thiết kế phương án tạo ra dòng điện xoay chiều.

---

## 2. Dòng điện xoay chiều

### 2.1. Biểu thức dòng điện xoay chiều

Nếu nối hai đầu của khung dây dẫn $MNPQ$ với đoạn mạch tiêu thụ điện thì giữa hai đầu đoạn mạch có một hiệu điện thế.

Hiệu điện thế này biến thiên theo thời gian theo quy luật dạng cosin hoặc sin, gọi là **hiệu điện thế xoay chiều** hay **điện áp xoay chiều**.

Điện áp xoay chiều có cùng chu kì, tần số với suất điện động xoay chiều và có dạng:

$$
u=U_0\cos(\omega t+\varphi_u)
\tag{17.2}
$$

Khi đó, dòng điện chạy qua mạch điện tiêu thụ là dòng điện xoay chiều có dạng:

$$
i=I_0\cos(\omega t+\varphi_i)
\tag{17.3}
$$

Trong các biểu thức (17.2), (17.3):

* $u$ là giá trị điện áp tức thời tại thời điểm $t$.
* $i$ là giá trị cường độ dòng điện tức thời tại thời điểm $t$.
* $U_0$ là giá trị cực đại của điện áp xoay chiều.
* $I_0$ là giá trị cực đại của cường độ dòng điện xoay chiều.
* $\omega$ là tần số góc của dòng điện xoay chiều, đơn vị là rad/s.
* $\varphi_u$ là pha ban đầu của điện áp xoay chiều.
* $\varphi_i$ là pha ban đầu của cường độ dòng điện xoay chiều.

Các đại lượng:

$$
\omega t+\varphi_u
$$

và:

$$
\omega t+\varphi_i
$$

lần lượt là pha của điện áp và cường độ dòng điện xoay chiều.

Độ lệch pha giữa điện áp và cường độ dòng điện xoay chiều là:

$$
\Delta\varphi=\varphi_u-\varphi_i
$$

Dòng điện có cường độ biến thiên điều hòa với thời gian theo quy luật của hàm cosin hoặc sin được gọi là **dòng điện xoay chiều**.

---

### 2.2. Giá trị hiệu dụng

Dòng điện xoay chiều cũng có tác dụng nhiệt như dòng điện không đổi.

Cho dòng điện xoay chiều có cường độ:

$$
i=I_0\cos(\omega t+\varphi_i)
$$

chạy qua đoạn mạch chỉ có điện trở $R$.

Nhiệt lượng tỏa ra trong thời gian $t$ đủ lớn so với chu kì $T$ của dòng điện là $Q$.

Cho dòng điện không đổi có cường độ $I$ chạy qua điện trở nói trên trong cùng khoảng thời gian $t$, sao cho nhiệt lượng tỏa ra cũng bằng $Q$.

Người ta thiết lập được mối liên hệ giữa giá trị hiệu dụng $I$ và giá trị cực đại $I_0$ của cường độ dòng điện xoay chiều:

$$
I=\frac{I_0}{\sqrt{2}}
\tag{17.4}
$$

Đại lượng $I$ gọi là **giá trị hiệu dụng của cường độ dòng điện xoay chiều** hay **cường độ hiệu dụng của dòng điện xoay chiều**.

Tương tự, mối liên hệ giữa giá trị hiệu dụng $U$ và giá trị cực đại $U_0$ của điện áp xoay chiều là:

$$
U=\frac{U_0}{\sqrt{2}}
\tag{17.5}
$$

---

### Hình 17.3

![Hình 17.3 - Đồ thị cường độ dòng điện xoay chiều theo thời gian](assets/images/hinh-17-3.png)

**Nội dung hình**

Hình biểu diễn đồ thị cường độ dòng điện xoay chiều theo thời gian.

Trên đồ thị:

* Trục tung biểu diễn cường độ dòng điện $i$, đơn vị ampe $(A)$.
* Trục hoành biểu diễn thời gian $t$, đơn vị giây $(s)$.
* Dòng điện biến thiên điều hòa theo thời gian.

---

### Câu hỏi

Dựa vào đồ thị biểu diễn cường độ dòng điện xoay chiều theo thời gian như Hình 17.3, hãy thực hiện các yêu cầu sau:

1. Xác định chu kì $T$ và tần số $f$ của dòng điện xoay chiều.

2. Xác định:

   * Giá trị cực đại.
   * Giá trị hiệu dụng.
   * Pha ban đầu của cường độ dòng điện xoay chiều.

3. Viết biểu thức cường độ dòng điện theo thời gian.

---

## 3. Máy phát điện xoay chiều

### 3.1. Cấu tạo

Máy phát điện xoay chiều hoạt động dựa trên **hiện tượng cảm ứng điện từ**.

Máy có hai bộ phận chính:

* **Phần cảm**.
* **Phần ứng**.

Một trong hai bộ phận chính được đặt cố định, gọi là **stato**.

Phần còn lại quay quanh một trục, gọi là **rôto**.

Trong đó:

* **Phần cảm** là nam châm điện hoặc nam châm vĩnh cửu dùng để tạo ra từ trường.
* **Phần ứng** là các cuộn dây dẫn, trong đó xuất hiện suất điện động cảm ứng khi máy hoạt động.
### 3.2. Nguyên tắc hoạt động

Có hai cách tạo ra suất điện động xoay chiều trong máy phát điện xoay chiều.

---

#### Cách thứ nhất: Stato là nam châm, rôto là khung dây

Các máy phát điện xoay chiều hoạt động theo cách thứ nhất có:

* **Stato** là nam châm đặt cố định.
* **Rôto** là khung dây quay quanh một trục trong từ trường tạo bởi stato.

Để dẫn điện ra ngoài, cần có hai **vành khuyên**.

Mỗi vành khuyên được gắn chặt vào một đầu của khung dây.

Cả hai vành khuyên này được đặt đồng trục với trục quay của khung dây và cùng quay với khung dây.

Khi máy hoạt động:

* Mỗi vành khuyên có một chổi quét tì vào.
* Khi khung dây quay, hai vành khuyên trượt trên hai chổi quét.
* Dòng điện truyền từ khung dây qua hai chổi quét ra mạch ngoài.

---

### Hình 17.4

![Hình 17.4 - Nguyên tắc hoạt động của máy phát điện xoay chiều theo cách thứ nhất](assets/images/hinh-17-4.png)

**Nội dung hình**

Hình mô tả nguyên tắc hoạt động của máy phát điện xoay chiều theo cách thứ nhất:

* Stato là nam châm.
* Rôto là khung dây quay.
* Khung dây quay trong từ trường.
* Hai vành khuyên nối với hai đầu khung dây.
* Hai chổi quét tiếp xúc với vành khuyên để dẫn dòng điện ra mạch ngoài.

---

#### Cách thứ hai: Rôto là nam châm, stato là cuộn dây

Các máy phát điện xoay chiều hoạt động theo cách thứ hai có:

* **Rôto** là nam châm, thường là nam châm điện được nuôi bởi dòng điện một chiều.
* **Stato** gồm nhiều cuộn dây có lõi sắt, xếp thành một vòng tròn.

Các cuộn dây của rôto cũng có lõi sắt và xếp thành vòng tròn.

Ở cách này:

* Không cần vành khuyên và chổi quét để lấy dòng điện xoay chiều ra mạch ngoài.
* Dòng điện được dẫn trực tiếp ra mạch ngoài bởi các cuộn dây đặt cố định.

---

### Hình 17.5

![Hình 17.5 - Rôto và stato của máy phát điện xoay chiều](assets/images/hinh-17-5.png)

**Nội dung hình**

Hình gồm:

* a) Rôto là nam châm điện.
* b) Stato gồm nhiều cuộn dây có lõi sắt, xếp thành vòng tròn.

---

### Câu hỏi

1. Hãy viết biểu thức suất điện động của máy phát điện xoay chiều trong trường hợp khung dây có $N$ vòng dây, quay với tốc độ góc $\omega$ trong từ trường đều có cảm ứng từ $B$, với $B$ vuông góc với trục quay của khung.

2. Vì sao cần sử dụng vành khuyên và chổi quét để dẫn điện ra mạch ngoài đối với các máy phát điện xoay chiều hoạt động theo cách thứ nhất?

---

## Em có biết?

Khi khung dây quay với tốc độ cao thì vành khuyên và chổi quét sẽ nhanh mòn.

Do đó, người ta chế tạo máy phát điện xoay chiều có stato là phần ứng gồm nhiều cuộn dây.

---

### Hình 17.6

![Hình 17.6 - Máy phát điện xoay chiều có phần ứng là stato](assets/images/hinh-17-6.png)

**Nội dung hình**

Hình biểu diễn các bộ phận của máy phát điện xoay chiều có phần ứng là stato:

* Rôto là nam châm điện.
* Stato là cuộn dây.
* Bộ phận lấy điện ra đặt trên stato.

---

## 4. Ứng dụng và quy tắc an toàn khi sử dụng dòng điện xoay chiều

### 4.1. Ứng dụng của dòng điện xoay chiều trong cuộc sống

Dòng điện xoay chiều có ưu thế trong việc truyền tải điện năng đi xa.

Dòng điện xoay chiều được dùng để:

* Truyền tải điện năng đến các nhà máy.
* Truyền tải điện năng đến xí nghiệp sản xuất.
* Truyền tải điện năng đến nơi tiêu thụ sử dụng dòng điện xoay chiều.

Dòng điện xoay chiều được sử dụng rộng rãi trong cuộc sống nhờ các tác dụng:

* Tác dụng nhiệt.
* Tác dụng từ.
* Tác dụng phát sáng.
* Tác dụng sinh lí.

Các thiết bị như:

* Quạt điện.
* Động cơ điện.
* Đèn điện.

đã chuyển hóa năng lượng điện thành các dạng năng lượng khác nhằm đáp ứng nhu cầu sống, sinh hoạt, lao động và sản xuất của con người.

Trong y học, dòng điện xoay chiều được sử dụng để vận hành các thiết bị y tế như:

* Máy chẩn đoán hình ảnh.
* Máy chụp cộng hưởng từ.
* Máy siêu âm.
* Máy chụp X-quang.
* Máy sốc điện.
* Máy điện tim.

---

### Câu hỏi

1. Ngoài thắp sáng và chạy máy thì dòng điện xoay chiều còn được sử dụng vào những việc gì?

2. Tìm hiểu thông qua sách báo, internet về các biện pháp giảm hao phí trong truyền tải điện năng đi xa bằng dòng điện xoay chiều.

---

### 4.2. Quy tắc an toàn khi sử dụng dòng điện xoay chiều

Để cảnh báo về an toàn điện, người ta đưa ra các biển báo an toàn điện.

Một số quy tắc an toàn khi sử dụng dòng điện xoay chiều:

* Tuân thủ theo các biển báo an toàn điện.
* Tuyệt đối không chạm tay vào chỗ hở của đường dây điện.
* Không cầm vật trực tiếp bằng kim loại cắm vào ổ điện.
* Tránh lại gần những khu vực có điện thế nguy hiểm.
* Kiểm tra, bảo trì các thiết bị điện định kì theo đúng hướng dẫn.
* Ngắt nguồn điện khi có thiên tai, sấm sét.

---

### Hình 17.7

![Hình 17.7 - Biển cảnh báo an toàn điện](assets/images/hinh-17-7.png)

**Nội dung hình**

Hình biểu diễn biển cảnh báo an toàn điện với nội dung:

> Cấm lại gần! Có điện nguy hiểm chết người.

---

### Câu hỏi

1. Nhận biết ý nghĩa của những biển báo an toàn điện.

2. Vì sao không nên sử dụng thiết bị điện trong quá trình sạc pin?

3. Vì sao cần lựa chọn và lắp đặt thiết bị đóng, ngắt điện ở vị trí phù hợp, dễ tiếp cận nhất tại gia đình?

4. Vì sao cần lựa chọn thiết bị điện có chất lượng, có công suất phù hợp với mạng lưới điện?

5. Nêu tầm quan trọng của việc tuân thủ quy tắc an toàn khi sử dụng dòng điện xoay chiều trong cuộc sống.

---

## 5. Em đã học

> Dòng điện xoay chiều là dòng điện có cường độ biến thiên điều hòa với thời gian theo quy luật hàm số sin hoặc cosin.

Biểu thức dòng điện xoay chiều:

$$
i=I_0\cos(\omega t+\varphi_i)
$$

Mối liên hệ giữa giá trị hiệu dụng và giá trị cực đại của dòng điện xoay chiều:

$$
I=\frac{I_0}{\sqrt{2}}
$$

Mối liên hệ giữa giá trị hiệu dụng và giá trị cực đại của điện áp xoay chiều:

$$
U=\frac{U_0}{\sqrt{2}}
$$

Dòng điện xoay chiều có ưu thế trong việc truyền tải điện năng đi xa nên được sử dụng phổ biến.

Máy phát điện xoay chiều hoạt động dựa trên hiện tượng cảm ứng điện từ, chuyển hóa cơ năng thành điện năng.

Máy phát điện xoay chiều có cấu tạo gồm hai bộ phận chính:

* Phần cảm.
* Phần ứng.

Trong đó:

* Phần cảm là bộ phận tạo ra từ trường.
* Phần ứng là các cuộn dây xuất hiện suất điện động cảm ứng khi máy hoạt động.

Cần tuân thủ các quy tắc an toàn khi sử dụng dòng điện xoay chiều.

---

## 6. Em có thể

> Nêu được ý nghĩa của các thông số ghi trên các thiết bị điện.

> Giải thích được cách tạo ra dòng điện xoay chiều trong nhà máy thủy điện.

> Đề xuất được một số biện pháp sử dụng điện an toàn trong gia đình.

---

## 7. Em có biết?

### Máy phát điện xoay chiều ba pha

Máy phát điện xoay chiều ba pha thường được sử dụng trong thực tế.

Trong máy phát điện xoay chiều ba pha:

* Rôto là nam châm điện quay quanh trục, đóng vai trò là phần cảm.
* Stato là ba cuộn dây riêng rẽ, đặt trên vòng tròn và lệch nhau $120^\circ$, đóng vai trò là phần ứng.

Suất điện động trong ba cuộn dây khi máy hoạt động có đặc điểm là lệch pha nhau:

$$
\frac{2\pi}{3}
$$

Nếu suất điện động xoay chiều trong cuộn dây $A_1B_1$ là:

$$
e_1=E_0\cos\omega t
$$

thì suất điện động trong các cuộn dây $A_2B_2$ và $A_3B_3$ tương ứng là:

$$
e_2=E_0\cos\left(\omega t+\frac{2\pi}{3}\right)
$$

$$
e_3=E_0\cos\left(\omega t-\frac{2\pi}{3}\right)
$$

---

### Hình 17.8

![Hình 17.8 - Sơ đồ nguyên tắc cấu tạo của máy phát điện xoay chiều ba pha](assets/images/hinh-17-8.png)

**Nội dung hình**

Hình biểu diễn sơ đồ nguyên tắc cấu tạo của máy phát điện xoay chiều ba pha:

* Rôto là nam châm điện quay quanh trục.
* Stato gồm ba cuộn dây riêng rẽ.
* Ba cuộn dây được đặt lệch nhau $120^\circ$ trên vòng tròn.    