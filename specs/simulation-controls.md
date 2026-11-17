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
