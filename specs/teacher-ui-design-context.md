# Teacher UI — Chức năng & luồng hoạt động các trang Giáo viên

---

## 1. Dashboard giáo viên — `/dashboard`

Trang tổng quan cho giáo viên khi đăng nhập, tổng hợp số liệu từ **tất cả lớp học** của giáo viên đó. Có bộ lọc khoảng thời gian (vài mốc: 3/6/12/24 tháng) áp dụng cho phần biểu đồ xu hướng theo tháng.

Nội dung chính cần có:
- Vài chỉ số tổng quan dạng số lớn: tổng số lớp, tổng học sinh, tổng bài tập, điểm trung bình, tỉ lệ hoàn thành.
- So sánh giữa các lớp (điểm TB và tỉ lệ nộp bài mỗi lớp).
- Phân bố số bài theo môn học.
- Xu hướng theo thời gian: số bài nộp và số học sinh mới theo tháng/tuần.
- Bảng xếp hạng học sinh xuất sắc nhất (toàn bộ các lớp).
- Danh sách hoạt động gần đây: mỗi dòng là một lượt học sinh nộp bài (lớp, học sinh, bài tập, điểm, thời gian), có thể xuất ra Excel.

Tất cả các khối trên nếu chưa có dữ liệu cần có trạng thái rỗng riêng (không phải 1 thông báo chung cho cả trang).

---

## 2. Danh sách lớp học — `/giao-vien/classes`

Giáo viên quản lý các lớp mình tạo. Mỗi lớp có: tên, mô tả (tuỳ chọn), mã mời tham gia tự sinh, số học sinh đã duyệt, số học sinh đang chờ duyệt.

Luồng chính:
- **Tạo lớp mới**: chỉ cần nhập tên (bắt buộc) và mô tả (tuỳ chọn) — không có field môn học/khối lớp/sĩ số/ảnh bìa. Mã mời do hệ thống tự sinh, không cho giáo viên tự đặt.
- **Copy link mời**: sinh link tham gia lớp từ mã mời, copy vào clipboard cho giáo viên gửi học sinh — không cần hiển thị QR hay modal riêng.
- **Xoá lớp**: có xác nhận trước khi xoá (không có điều kiện lớp phải rỗng mới xoá được).
- Click vào một lớp để xem chi tiết.

---

## 3. Chi tiết lớp học — `/giao-vien/classes/:id`

3 khu vực chức năng trong 1 lớp: **Thành viên**, **Bài tập**, **Thống kê & Phân tích** (mục 4). Ngoài ra có nút copy link mời và xoá lớp giống trang danh sách.

### Thành viên
Danh sách học sinh đã yêu cầu tham gia lớp, kèm trạng thái: đang chờ duyệt / đã duyệt / đã từ chối. Học sinh đang chờ duyệt có 2 hành động: **Duyệt** và **Từ chối**. Không có chức năng xoá học sinh đã duyệt hay sửa thông tin học sinh từ đây.

### Bài tập
- Xem danh sách bài tập đã giao trong lớp, và với mỗi bài tập xem được ai đã nộp, điểm số, thời gian nộp.
- **Giao bài tập mới**: đặt tên bài tập, chọn nguồn thí nghiệm (thí nghiệm hệ thống có sẵn, hoặc thí nghiệm do chính giáo viên tự tạo ở trang "Quản lý thí nghiệm"), ghi chú, hạn nộp (tuỳ chọn).
- **Đây là màn hình chỉ xem kết quả, không phải màn hình chấm điểm** — giáo viên không nhập/sửa điểm ở đây, điểm là do học sinh tự nộp bài sinh ra. Không có chức năng sửa hoặc xoá bài tập sau khi đã tạo.

---

## 4. Thống kê & Phân tích lớp học

Báo cáo trực quan cho 1 lớp, có bộ lọc theo tuần/tháng. Cần có các nhóm thông tin sau (không nhất thiết đúng thứ tự/hình thức, miễn đầy đủ):
- Số liệu tổng quan của lớp (số học sinh, số bài tập, số bài nộp, điểm TB, tỉ lệ hoàn thành).
- Phân bố điểm số của học sinh trong lớp.
- Tỉ lệ đã nộp / chưa nộp bài.
- Tiến độ nộp bài theo thời gian (số bài nộp + số học sinh tham gia theo từng mốc thời gian).
- Xếp hạng học sinh theo điểm trung bình, có thể xuất Excel.
- So sánh hiệu quả giữa các bài tập (tỉ lệ nộp, điểm TB mỗi bài).
- Bảng chi tiết từng học sinh (số bài nộp, điểm TB/cao nhất/thấp nhất, bài gần nhất), có tìm kiếm, phân trang, xuất Excel.

Mỗi phần cần trạng thái rỗng riêng khi chưa có dữ liệu; bảng chi tiết học sinh không có thao tác sửa/xoá, chỉ để xem và xuất báo cáo.

---

## 5. Ngân hàng câu hỏi — `/giao-vien/question-bank`

Kho câu hỏi dùng chung để tạo đề thi. Mỗi câu hỏi có: nội dung (hỗ trợ công thức toán/LaTeX), môn, lớp, chủ đề, loại câu hỏi (trắc nghiệm/tự luận/ngắn), độ khó, tags.

Chức năng chính:
- CRUD câu hỏi thủ công: form nhập loại câu hỏi trước, tuỳ loại mà hiện danh sách đáp án (trắc nghiệm, hỗ trợ nhiều đáp án đúng) hoặc ô đáp án tự do (tự luận/ngắn). Có phần giải thích đáp án.
- Nhập/xuất hàng loạt qua file Excel (có file mẫu để tải).
- **AI sinh câu hỏi**: giáo viên chọn môn/lớp (bắt buộc), có thể để trống chủ đề/loại để AI tự quyết định, chọn số lượng và độ khó — AI sinh xong sẽ được thêm thẳng vào ngân hàng (không có bước giáo viên duyệt từng câu trước khi lưu).

---

## 6. Quản lý đề thi — `/giao-vien/exams`, `/giao-vien/exams/create`, in đề thi

**Danh sách đề thi**: lọc theo môn/lớp, mỗi đề thi có thể xem trước, in, hoặc xoá. Đề thi được đánh dấu là tạo thủ công hay do AI sinh.

**Tạo đề thi mới** (3 bước: Thông tin đề → Chọn câu hỏi/AI tạo đề → Xem lại & Lưu):
- Nhập thông tin chung: tên, mô tả, môn, lớp, thời gian làm bài, tổng điểm.
- Chọn 1 trong 2 cách tạo nội dung đề:
  - **Thủ công**: đề được chia thành nhiều **phần** (VD phần trắc nghiệm, phần tự luận), mỗi phần có tên riêng và điểm số riêng; giáo viên chọn câu hỏi từ Ngân hàng câu hỏi để thêm vào từng phần.
  - **AI tạo đề**: giáo viên chọn môn/lớp/độ khó, có thể để trống chủ đề, có thể tự mô tả cấu trúc đề (số câu mỗi loại) hoặc để AI tự phân bổ. Kết quả AI cho xem trước toàn bộ đề (đầy đủ câu hỏi + đáp án đúng) trước khi lưu, giáo viên có thể yêu cầu AI tạo lại nếu chưa ưng ý.
- Bước cuối: xem lại tổng thể (số phần, số câu, tổng điểm) rồi lưu; tổng điểm phải lớn hơn 0 mới lưu được.

**In đề thi**: xuất bản in gọn gàng của đề đã lưu — có phần thông tin đầu bài (trường/môn/lớp/thời gian/điểm), các phần đề đánh số câu hỏi liên tục từ đầu đến cuối đề (không đánh số lại theo từng phần), khoảng trống để học sinh làm bài tự luận/câu ngắn, và các lựa chọn để khoanh đáp án trắc nghiệm.

---

## 7. Quản lý thí nghiệm — `/quan-ly-thi-nghiem`

Danh sách các thí nghiệm/mô phỏng do giáo viên **tự tạo** (khác với thí nghiệm hệ thống có sẵn). Đây chính là nguồn cho lựa chọn "thí nghiệm của tôi" khi giao bài tập ở mục 3. Mỗi thí nghiệm có thể: mở vào phòng thí nghiệm 3D để xem/tương tác, hoặc xoá. Có lối vào trang "Tạo thí nghiệm" (mục 8) để tạo mới.

---

## 8. Tạo thí nghiệm — `/tao-thi-nghiem`

Đây là luồng phức tạp nhất, cần giữ đúng cấu trúc chức năng vì có nhiều bước phụ thuộc lẫn nhau.

### Hai cách tạo thí nghiệm
Giáo viên chọn 1 trong 2 cách, có thể chuyển qua lại mà không mất dữ liệu đang nhập ở cách còn lại:
1. **Tạo thủ công** — đi qua wizard nhiều bước.
2. **Tạo bằng AI** — trò chuyện với AI bằng ngôn ngữ tự nhiên để mô tả thí nghiệm muốn tạo, AI đề xuất một cấu hình thí nghiệm hoàn chỉnh (tên + môn + danh sách dụng cụ), giáo viên xem cấu hình đề xuất và bấm tạo luôn — không cần thao tác qua từng bước thủ công. Thông số môi trường (trọng lực/nhiệt độ) trong trường hợp này dùng giá trị mặc định, giáo viên không chỉnh tay được ở đây.

### Wizard tạo thủ công — các bước
1. **Chọn môn học & thông tin cơ bản**: đặt tên thí nghiệm (bắt buộc để đi tiếp), chọn 1 trong 3 môn (Vật lý / Hóa học / Toán học), chỉnh thông số môi trường chung (trọng lực, nhiệt độ — luôn có giá trị mặc định sẵn, riêng "hệ số ma sát" chỉ áp dụng cho môn Vật lý).
2. **Chọn dụng cụ**: duyệt/tìm kiếm/lọc (theo lớp, chương, chủ đề, loại dụng cụ) danh sách dụng cụ phù hợp với môn đã chọn, chọn nhiều dụng cụ cho thí nghiệm. **Mỗi loại dụng cụ chỉ chọn được 1 cái** (không thêm trùng 2 dụng cụ cùng loại).
   - Riêng **môn Hóa học có thêm 1 bước lọc/chọn hoá chất** ở giữa (bước Chọn dụng cụ và bước Cấu hình): chọn hoá chất qua một khu vực tra cứu riêng (nguyên tố + hợp chất), khác với dụng cụ thường ở chỗ **có thể chọn nhiều hoá chất khác nhau dù cùng dạng** (rắn/lỏng/khí).
   - Trong lúc chọn dụng cụ, hệ thống kiểm tra và **nhắc (không chặn)** các vấn đề như: chưa chọn dụng cụ nào, thiếu giá đỡ cho con lắc/lò xo, thiếu dụng cụ chứa cho hoá chất, kết hợp dụng cụ của 2 môn khác nhau, dụng cụ đo lường mà không có gì để đo — kèm gợi ý tự động thêm dụng cụ còn thiếu nếu áp dụng được.
3. **Cấu hình dụng cụ**: với mỗi dụng cụ đã chọn, cho phép chỉnh các thông số vật lý/hiển thị phù hợp với loại dụng cụ đó (khối lượng, chiều dài, độ cứng, tần số dao động, màu sắc, thể tích chất lỏng...) — dụng cụ nào không có thông số nào thì không cần hiện field. Luôn có giá trị mặc định hợp lý sẵn.

### Lưu thí nghiệm (áp dụng cho cả 2 cách tạo — thủ công và AI)
- Bắt buộc phải có tên thí nghiệm mới lưu được.
- Trước khi lưu, hệ thống kiểm tra tính hợp lý của danh sách dụng cụ:
  - Nếu có **lỗi nghiêm trọng** (ví dụ: chưa chọn dụng cụ nào, thiếu giá đỡ cho con lắc, thiếu vật chứa hoá chất) → **chặn lưu**, báo rõ lỗi để giáo viên quay lại sửa.
  - Nếu chỉ có **cảnh báo nhẹ** (thí nghiệm có thể chưa hoàn chỉnh nhưng không sai logic) → hỏi lại giáo viên có muốn vẫn lưu hay quay lại chỉnh sửa.
  - Nếu không có vấn đề gì → lưu ngay.
- Sau khi lưu thành công, tự động đưa giáo viên vào phòng thí nghiệm 3D để xem/tương tác với thí nghiệm vừa tạo.

---
