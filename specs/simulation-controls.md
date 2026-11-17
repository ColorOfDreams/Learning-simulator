# Giao diện điều khiển mô phỏng gọn

Yêu cầu ngày 2026-11-17: tham khảo cách trình bày mô phỏng của
[bai-giang](https://github.com/nclamvn/bai-giang), áp dụng trực tiếp lên demo với ít chữ và ít thông số.

## Hành vi

- Màn hình Vật lý và Toán ưu tiên tối đa ba thanh điều chỉnh mỗi nhóm; các thanh còn lại nằm trong mục **Thêm thông số**, mặc định đóng.
- Nhãn điều chỉnh dùng tên tiếng Việt ngắn, giữ đơn vị bên cạnh giá trị. Thanh trượt có tên truy cập cho bàn phím và trình đọc màn hình.
- **Công thức** và **Ký hiệu** là các mục mở theo nhu cầu. Đóng/mở không đặt lại tham số.
- Số đo Vật lý hiển thị bằng chữ HTML trong góc cảnh, tối đa bốn đại lượng có ý nghĩa cho từng bài. Bảng không xoay theo camera và không chặn kéo/zoom.
- Những đại lượng đã có ở thanh điều chỉnh không cần lặp lại trong bảng kết quả. Với va chạm, ưu tiên giữ kết quả của cả hai xe.
- Play/pause, chạy chậm, đặt lại, công thức tính, dữ liệu API và tiến trình thí nghiệm Hóa học giữ nguyên hành vi.

## Kiểm tra

- Xem ném xiên, Newton, va chạm, dao động, một bài Toán và một bài Hóa.
- Đổi thanh trượt, chạy/tạm dừng/đặt lại và mở/đóng phần chi tiết.
- Kiểm tra chữ và bảng số không bị cắt ở kích thước desktop và tablet.
- So sánh kiểm tra TypeScript với trạng thái trước thay đổi; không thêm lỗi mới.

Đây là thay đổi giao diện cho demo local. Tài liệu không xác nhận PR/CI/review đã hoàn tất.

## Bố cục điện thoại (ASS-028, ngày 2026-11-17)

- Áp dụng giao diện một vùng nội dung cho màn hình rộng tối đa 900 px, thay cách xếp chồng ba cột desktop.
- Mặc định mở **Mô phỏng**; thanh chuyển mục phía dưới gồm **Mô phỏng**, **Hướng dẫn** (Hóa) hoặc **Thông số** (Lý/Toán), **Trợ lý AI**, **Quiz**. Nút chạm tối thiểu 44 px.
- Chuyển mục giữ nguyên simulation instance, tham số, bước Hóa, hội thoại và trạng thái quiz; không dựng lại canvas khi mở hướng dẫn hoặc chat.
- Mỗi vùng tự cuộn khi cần; cảnh và thanh thao tác không bị bảng hướng dẫn/AI che. Header có tên bài tối đa hai dòng, nhãn môn một dòng và nút Đặt lại/Lưu không ngắt chữ.
- Bài Hóa hiển thị bước hiện tại ngắn gọn cạnh mô phỏng; toàn bộ hướng dẫn/quan sát xem trong mục Hướng dẫn.
- Dùng chiều cao viewport động, chừa vùng an toàn ở đáy và hỗ trợ bàn phím ảo. Ở desktop tiếp tục hiển thị ba cột.
- Kiểm thử 360×800, 390×844, 412×915, 844×390, 768×1024 và desktop 1440×900: canvas có diện tích, không cuộn ngang; chuyển mục, kéo slider, chạy/tạm dừng, Hóa tự chạy, AI và Quiz vẫn sử dụng được.
