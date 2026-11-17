# Demo online trên Render

Yêu cầu ngày 2026-11-17: tạo một demo online riêng từ bản mô phỏng đã tinh gọn,
dùng dịch vụ miễn phí thay Railway vì tài khoản Railway đã hết trial.

- Một Static Site build frontend UmiJS bằng Node 22 và phục vụ SPA với fallback về index.html.
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
