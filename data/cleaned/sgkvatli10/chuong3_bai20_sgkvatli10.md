# Bài 20: Một số ví dụ về cách giải các bài toán thuộc phần động lực học

## I. Các bước giải chính

1. Chọn vật khảo sát chuyển động.

Biểu diễn các lực tác dụng lên vật, trong đó làm rõ:

- Phương.
- Chiều.
- Điểm đặt của từng lực.

2. Chọn hai trục vuông góc \(Ox\) và \(Oy\).

Trong đó:

- Trục \(Ox\) cùng hướng với chuyển động của vật, hoặc cùng hướng với lực kéo khi vật đứng yên.
- Trục \(Oy\) vuông góc với trục \(Ox\).

Phân tích các lực theo hai trục này.

Áp dụng định luật II Newton theo hai trục tọa độ \(Ox\) và \(Oy\):

\[
Ox:\quad F_x=F_{1x}+F_{2x}+\cdots=ma_x
\tag{1}
\]

\[
Oy:\quad F_y=F_{1y}+F_{2y}+\cdots=0
\tag{2}
\]

3. Giải hệ phương trình (1) và (2) để tìm gia tốc hoặc lực, tùy từng bài toán.

---

# II. Các loại bài toán

## 1. Bài toán xác định gia tốc của vật khi biết lực tác dụng vào vật

### Ví dụ

Một người đẩy một thùng hàng khối lượng:

\[
m=50\text{ kg}
\]

trượt trên sàn nhà.

Lực đẩy có phương nằm ngang, độ lớn:

\[
F=180\text{ N}
\]

Tính gia tốc của thùng hàng.

Biết hệ số ma sát trượt giữa thùng hàng và sàn nhà là:

\[
\mu=0,25
\]

Lấy:

\[
g=9,8\text{ m/s}^2
\]

---

## Giải

Thùng hàng chịu tác dụng của bốn lực:

- Trọng lực \(\vec{P}\).
- Lực đẩy \(\vec{F}\).
- Phản lực \(\vec{N}\).
- Lực ma sát trượt \(\vec{F}_{ms}\) của sàn.

Coi thùng hàng như một chất điểm.

Áp dụng định luật II Newton cho chuyển động của vật theo hai trục \(Ox\), \(Oy\):

\[
Ox:\quad F_x=F-F_{ms}=ma
\tag{1}
\]

\[
Oy:\quad F_y=N-P=0
\tag{2}
\]

\[
F_{ms}=\mu N
\tag{3}
\]

Từ (2):

\[
N=P=mg=50.9,8=490\text{ N}
\]

Suy ra:

\[
F_{ms}=\mu N=0,25.490=122,5\text{ N}
\]

Từ (1):

\[
a=\frac{F-F_{ms}}{m}
\]

\[
a=\frac{180-122,5}{50}=1,15\text{ m/s}^2
\]

Vậy thùng hàng trượt với gia tốc:

\[
a=1,15\text{ m/s}^2
\]

cùng chiều với trục \(Ox\).

---

### Hình 20.1

![Hình 20.1 - Các lực tác dụng lên thùng hàng](assets/images/hinh-20-1.png)

**Nội dung hình**

Hình minh họa thùng hàng chịu tác dụng của bốn lực:

- Trọng lực.
- Phản lực.
- Lực đẩy.
- Lực ma sát trượt.

---

## 2. Bài toán xác định lực tác dụng vào vật khi biết gia tốc

### Ví dụ 1

Một người dùng dây buộc để kéo một thùng gỗ theo phương nằm ngang bằng một lực \(\vec{F}\).

Khối lượng của thùng là:

\[
m=35\text{ kg}
\]

Hệ số ma sát giữa sàn và đáy thùng là:

\[
\mu=0,3
\]

Lấy:

\[
g=9,8\text{ m/s}^2
\]

Tính độ lớn của lực kéo trong hai trường hợp:

a) Thùng trượt với gia tốc:

\[
a=0,2\text{ m/s}^2
\]

b) Thùng trượt đều.

---

### Hình 20.2

![Hình 20.2 - Người kéo thùng gỗ](assets/images/hinh-20-2.png)

**Nội dung hình**

Hình minh họa người dùng dây kéo thùng gỗ theo phương nằm ngang.

---

## Giải

Thùng chịu tác dụng của bốn lực:

- Trọng lực:

\[
\vec{P}=m\vec{g}
\]

- Lực kéo \(\vec{F}\).
- Phản lực \(\vec{N}\).
- Lực ma sát trượt \(\vec{F}_{ms}\) của mặt sàn.

Coi thùng như một chất điểm và áp dụng định luật II Newton cho các lực thành phần theo các phương \(Ox\), \(Oy\).

\[
Ox:\quad F_x=F-F_{ms}=ma
\tag{1}
\]

\[
Oy:\quad F_y=N-P=0
\tag{2}
\]

\[
F_{ms}=\mu N
\tag{3}
\]

Từ (2):

\[
N=mg
\]

Suy ra:

\[
F_{ms}=\mu N=\mu mg
\]

Thay vào (1):

\[
F-\mu mg=ma
\]

\[
F=ma+\mu mg
\]

\[
F=m(a+\mu g)
\]

### a) Thùng trượt với gia tốc \(a=0,2\text{ m/s}^2\)

\[
F=m(a+\mu g)
\]

\[
F=35(0,2+0,3.9,8)=109,9\text{ N}
\]

### b) Thùng trượt đều

Khi thùng trượt đều:

\[
a=0
\]

Do đó:

\[
F=\mu mg
\]

\[
F=0,3.35.9,8=102,9\text{ N}
\]

---

### Hình 20.3

![Hình 20.3 - Các lực tác dụng lên thùng gỗ](assets/images/hinh-20-3.png)

**Nội dung hình**

Hình minh họa các lực tác dụng lên thùng gỗ:

- Trọng lực.
- Phản lực.
- Lực kéo.
- Lực ma sát trượt.

---

### Ví dụ 2

Một chiếc hộp gỗ được thả trượt không vận tốc ban đầu từ đầu trên của một tấm gỗ dài:

\[
L=2\text{ m}
\]

Tấm gỗ đặt nghiêng:

\[
30^\circ
\]

so với phương ngang.

Hệ số ma sát giữa đáy hộp và mặt gỗ là:

\[
\mu=0,2
\]

Lấy:

\[
g=9,8\text{ m/s}^2
\]

Hỏi sau bao lâu thì hộp trượt xuống đến đầu dưới của tấm gỗ?

---

## Giải

Hộp, coi là chất điểm, chịu tác dụng của ba lực:

- Trọng lực \(\vec{P}\).
- Phản lực \(\vec{N}\).
- Lực ma sát trượt \(\vec{F}_{ms}\).

Phân tích trọng lực \(\vec{P}\) thành hai lực thành phần theo hai trục \(Ox\), \(Oy\):

- Thành phần song song với mặt phẳng nghiêng.
- Thành phần vuông góc với mặt phẳng nghiêng.

Áp dụng định luật II Newton theo hai trục \(Ox\), \(Oy\):

\[
Ox:\quad F_x=mg\sin\alpha-F_{ms}=ma
\tag{1}
\]

\[
Oy:\quad F_y=N-mg\cos\alpha=0
\tag{2}
\]

\[
F_{ms}=\mu N
\tag{3}
\]

Từ hệ phương trình trên:

\[
a=g(\sin\alpha-\mu\cos\alpha)
\]

Thay số:

\[
a=9,8(\sin30^\circ-0,2\cos30^\circ)
\]

\[
a\approx3,2\text{ m/s}^2
\]

Hộp trượt xuống với gia tốc:

\[
a\approx3,2\text{ m/s}^2
\]

cùng chiều với trục \(Ox\).

Áp dụng công thức:

\[
L=\frac{1}{2}at^2
\]

Suy ra:

\[
t=\sqrt{\frac{2L}{a}}
\]

\[
t=\sqrt{\frac{2.2}{3,2}}\approx1,1\text{ s}
\]

Vậy hộp trượt xuống đến đầu dưới tấm gỗ sau khoảng:

\[
1,1\text{ s}
\]

---

### Hình 20.4

![Hình 20.4 - Hộp gỗ trượt trên mặt phẳng nghiêng](assets/images/hinh-20-4.png)

**Nội dung hình**

Hình minh họa hộp gỗ trượt trên mặt phẳng nghiêng.

Các lực tác dụng lên hộp gồm:

- Trọng lực.
- Phản lực.
- Lực ma sát trượt.

Trọng lực được phân tích thành hai thành phần:

- Thành phần song song với mặt phẳng nghiêng.
- Thành phần vuông góc với mặt phẳng nghiêng.

---

# III. Bài tập tự giải

## 1.

Người ta đẩy một cái thùng có khối lượng:

\[
m=55\text{ kg}
\]

theo phương ngang với lực:

\[
F=220\text{ N}
\]

làm thùng chuyển động trên mặt phẳng ngang.

Hệ số ma sát trượt giữa thùng và mặt phẳng là:

\[
\mu=0,35
\]

Tính gia tốc của thùng.

Lấy:

\[
g=9,8\text{ m/s}^2
\]

---

## 2.

Một quyển sách đặt trên mặt bàn nghiêng và được thả cho trượt xuống.

Cho biết góc nghiêng:

\[
\alpha=30^\circ
\]

so với phương ngang và hệ số ma sát giữa quyển sách và mặt bàn là:

\[
\mu=0,3
\]

Lấy:

\[
g=9,8\text{ m/s}^2
\]

Tính:

- Gia tốc của quyển sách.
- Quãng đường đi được của quyển sách sau \(2\text{ s}\).

---

## 3.

Một học sinh dùng dây kéo một thùng sách nặng:

\[
m=10\text{ kg}
\]

chuyển động trên mặt sàn nằm ngang.

Dây nghiêng một góc chếch lên trên:

\[
30^\circ
\]

so với phương ngang.

Hệ số ma sát trượt giữa đáy thùng và mặt sàn là:

\[
\mu=0,2
\]

Lấy:

\[
g=9,8\text{ m/s}^2
\]

Hãy xác định độ lớn của lực kéo để thùng sách chuyển động thẳng đều.

---

## 4.

Hai vật có khối lượng lần lượt là:

\[
m_1=5\text{ kg}
\]

và

\[
m_2=10\text{ kg}
\]

được nối với nhau bằng một sợi dây không dãn và được đặt trên một mặt sàn nằm ngang.

Kéo vật 1 bằng một lực \(\vec{F}\) nằm ngang có độ lớn:

\[
F=45\text{ N}
\]

Hệ số ma sát giữa mỗi vật và mặt sàn là:

\[
\mu=0,2
\]

Lấy:

\[
g=9,8\text{ m/s}^2
\]

Tính:

- Gia tốc của mỗi vật.
- Lực căng của dây nối.