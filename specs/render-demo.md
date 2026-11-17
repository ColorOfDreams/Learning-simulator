# Demo online trên Render

Yêu cầu ngày 2026-11-17: tạo một demo online riêng từ bản mô phỏng đã tinh gọn,
dùng dịch vụ miễn phí thay Railway vì tài khoản Railway đã hết trial.

- Một Static Site build frontend UmiJS bằng Node 22 và phục vụ SPA với fallback về index.html.
- Đặt `SHARP_IGNORE_GLOBAL_LIBVIPS=1` để sharp dùng binary theo lockfile thay vì libvips hệ thống của Render.
- Một Web Service Docker chạy backend NestJS bằng Dockerfile hiện hành.
- Một PostgreSQL riêng, bật pgvector trước khi NestJS đồng bộ schema.
- Dịch vụ dùng cùng nhánh `feature/ASS-040-render-demo`; triển khai không cần merge dev/main.
- URL API frontend lấy từ URL công khai của dịch vụ backend. Database và JWT dùng giá trị do Render cấp, không commit credentials.
- Lệnh khởi động demo đợi API sẵn sàng rồi upsert học liệu trong image. Khi khởi tạo/seed lỗi, dịch vụ báo lỗi thay vì bỏ qua.
- Không cấu hình khóa LLM/embedding cho demo: dùng retrieval và câu trả lời dự phòng từ học liệu. Đăng nhập email/mật khẩu dùng tài khoản mẫu trong README.

Kiểm tra bàn giao: CI build, endpoint `/learning/health`, đăng nhập học sinh/giáo viên/admin,
học liệu có dữ liệu, mở mô phỏng ném xiên, slider và bảng số đo cập nhật trên URL public.

Giới hạn [gói miễn phí Render](https://render.com/docs/free): database hết hạn sau 30 ngày;
web service ngủ khi không có truy cập. Đó là demo có dữ liệu mẫu, không phải môi trường production.

## Bản đã triển khai ngày 2026-11-17

- Web: https://scilab-demo-web-bl06.onrender.com
- Backend: https://scilab-demo-api-bl06.onrender.com
- Swagger: https://scilab-demo-api-bl06.onrender.com/api
- Blueprint: https://dashboard.render.com/blueprint/exs-dbu146t6e07s73bg8jug
- Commit chạy khi bàn giao: `0b4cab0` (gồm giao diện tinh gọn `13b0a2d`).
- PR cấu hình: https://github.com/ColorOfDreams/Learning-simulator/pull/2

Đã xác nhận HTTP 200 cho web, deep link SPA và backend health; ba tài khoản mẫu
đăng nhập qua API thành công. Database có 4.634 theory chunks, truy hồi trả năm
kết quả và `/ai/chat` trả câu trả lời dự phòng (`used_llm: false`). Trên trình duyệt
online, tài khoản học sinh vào được trang chủ và mô phỏng ném xiên; slider đổi góc,
chạy/tạm dừng và bảng số đo cập nhật thành công.

Mỗi thay đổi trên nhánh deploy có thể kích hoạt build trên Render. Không xóa nhánh
`feature/ASS-040-render-demo` khi demo vẫn sử dụng nguồn này. Các nhánh `dev` và `main`
chưa được merge trong lần triển khai demo này.
