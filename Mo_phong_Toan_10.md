# Danh sách Mô phỏng và Thí nghiệm Toán học Lớp 10

Tài liệu hướng dẫn cấu hình và xây dựng các kịch bản mô phỏng, thí nghiệm trải nghiệm môn Toán lớp 10 dành cho Agent lập trình.

---

## 1. Mô phỏng đồ thị hàm số bậc hai
- **Định dạng hiển thị:** 2D (Hệ tọa độ phẳng $Oxy$)
- **Cách thức vận hành:** Học sinh tương tác trực tiếp (Interactive)
- **Các tham số cấu hình:**
  - `a`: Hệ số bậc hai (Thanh trượt từ -10 đến 10, bước nhảy 0.1, giá trị mặc định khác 0).
  - `b`: Hệ số bậc nhất (Thanh trượt từ -10 đến 10, bước nhảy 0.1).
  - `c`: Hệ số tự do (Thanh trượt từ -10 đến 10, bước nhảy 0.1).
- **Mô tả kịch bản:** - Hiển thị đồ thị hàm số $y = ax^2 + bx + c$.
  - Tự động đánh dấu và hiển thị tọa độ của **Đỉnh Parabol** $I\left(-rac{b}{2a}; -rac{\Delta}{4a}ight)$ và **Trục đối xứng** $x = -rac{b}{2a}$.
  - Khi người dùng thay đổi các tham số `a`, `b`, `c`, đồ thị, điểm đỉnh và trục đối xứng phải co giãn/dịch chuyển mượt mà tương ứng.

## 2. Mô phỏng quỹ đạo chuyển động ném xiên và kiến trúc vòm cổng
- **Định dạng hiển thị:** 3D (Hoặc 2D nâng cao có tích hợp hình ảnh minh họa thực tế)
- **Cách thức vận hành:** Kết hợp Chạy tự động (Animation) và Học sinh tương tác
- **Các tham số cấu hình:**
  - `v0`: Vận tốc ban đầu của vật thể (m/s).
  - `alpha`: Góc ném so với phương ngang (độ, từ $0^\circ$ đến $90^\circ$).
  - `g`: Gia tốc trọng trường (Mặc định cố định 9.8 hoặc 10 m/s²).
- **Mô tả kịch bản:**
  - Nút bấm **[Play]** để kích hoạt chuyển động của vật thể vẽ nên quỹ đạo parabol theo thời gian thực (Real-time tracing).
  - Học sinh điều chỉnh `v0` và `alpha` để tối ưu hóa tầm cao (đỉnh) và tầm xa (giao điểm với trục hoành). Tích hợp ảnh nền là một kiến trúc cổng hình parabol để học sinh tìm bộ thông số giúp quỹ đạo vật khớp với vòm cổng.

## 3. Biểu diễn miền nghiệm của hệ bất phương trình bậc nhất hai ẩn
- **Định dạng hiển thị:** 2D (Mặt phẳng tọa độ $Oxy$)
- **Cách thức vận hành:** Học sinh tương tác trực tiếp
- **Các tham số cấu hình:**
  - Hệ số `A1, B1, C1` của bất phương trình (1): $A_1x + B_1y \le C_1$ (hoặc $\ge, <, >$).
  - Hệ số `A2, B2, C2` của bất phương trình (2): $A_2x + B_2y \le C_2$.
  - Hộp kiểm (Checkbox) để bật/tắt hiển thị từng miền nghiệm riêng lẻ.
- **Mô tả kịch bản:**
  - Vẽ các đường thẳng tương ứng và tự động tô màu (với độ mờ pha trộn - opacity blend) các miền nghiệm của từng bất phương trình.
  - Vùng giao nhau (đậm màu nhất) chính là miền nghiệm của hệ bất phương trình (thường là miền đa giác phẳng). Phục vụ cho bài toán tối ưu hóa (tìm cực trị hàm mục tiêu kinh tế).

## 4. Thí nghiệm đo đạc thực tế (Ứng dụng hệ thức lượng trong tam giác)
- **Định dạng hiển thị:** Giao diện nhập liệu và mô tả hình học phẳng 2D
- **Cách thức vận hành:** Thực hành thực tế ngoài trời kết hợp nhập số liệu tính toán
- **Các tham số cấu hình (Học sinh đo và nhập vào):**
  - `a`: Khoảng cách từ vị trí đứng đo đến chân tòa nhà/cột cờ (mét).
  - `alpha`: Góc nhìn (góc nâng) từ giác kế đến đỉnh tòa nhà (độ).
  - `h0`: Chiều cao từ mặt đất đến mắt người đo/giác kế (mét).
- **Mô tả kịch bản:**
  - Học sinh nhập dữ liệu thực tế đo được từ thực địa vào hệ thống.
  - Phần mềm dựng trực quan tam giác vuông mô phỏng mô hình đo đạc và tự động áp dụng hệ thức lượng: $	ext{Chiều cao} = h_0 + a \cdot 	an(lpha)$ để xuất kết quả kiểm chứng.

## 5. Mô phỏng hình học định nghĩa các đường Conic
- **Định dạng hiển thị:** 2D
- **Cách thức vận hành:** Học sinh tương tác trực tiếp
- **Các tham số cấu hình:**
  - Khoảng cách giữa hai tiêu điểm $2c$ (Thay đổi vị trí $F_1, F_2$).
  - Độ dài dây cố định $2a$ (Đối với Elip, điều kiện $a > c$).
- **Mô tả kịch bản:**
  - Mô phỏng cơ chế "ghim đinh và vòng dây": Một điểm $M$ di động trên mặt phẳng sao cho $MF_1 + MF_2 = 2a$.
  - Khi cho điểm $M$ chạy tự động, phần mềm sẽ lưu lại vệt quét (Trace) để tạo thành một hình Elip hoàn chỉnh, giúp học sinh hiểu sâu định nghĩa quỹ tích.

## 6. Thống kê số liệu mẫu không ghép nhóm
- **Định dạng hiển thị:** Bảng tính (Spreadsheet dạng lưới đơn giản) kết hợp Biểu đồ 2D
- **Cách thức vận hành:** Học sinh tương tác nhập liệu
- **Các tham số cấu hình:**
  - Mảng dữ liệu đầu vào `Data[]`: Học sinh tự nhập danh sách điểm số, chiều cao hoặc cân nặng của các thành viên.
- **Mô tả kịch bản:**
  - Nhập chuỗi số liệu thô. Hệ thống tự động tính toán và hiển thị ngay lập tức các chỉ số đặc trưng đo xu thế trung tâm và độ phân tán: **Số trung bình, Trung vị, Tứ phân vị ($Q_1, Q_2, Q_3$), Khoảng biến thiên, Khoảng tứ phân vị, và Độ lệch chuẩn**.
  - Tự động vẽ biểu đồ đoạn thẳng hoặc biểu đồ cột biểu diễn phân phối tần suất phẳng.
