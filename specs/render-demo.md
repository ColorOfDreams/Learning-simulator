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
- Backend cấu hình ModelAPI qua `LLM_BASE_URL=https://api.modelapi.vn/v1`, model `gpt-6-luna`. `LLM_API_KEY` được nhập riêng trên Render (`sync: false`), không lưu trong repository. Embedding vẫn dùng keyword retrieval khi chưa có embedding provider.
- Frontend lấy `APP_CONFIG_GOOGLE_CLIENT_ID` từ `GOOGLE_CLIENT_ID` của backend để hai bên xác minh cùng một audience. Google client ID là cấu hình công khai; API key LLM và Google client secret chỉ được lưu ở backend.
- Luồng đăng nhập đang dùng là Google Identity Services trả ID token cho `POST /auth/google/verify`; luồng này cần OAuth Web Client ID và JavaScript origin, không cần Google client secret.

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

## Bật ModelAPI và Google Identity Services

1. Render backend: nhập `LLM_API_KEY` trực tiếp trong Environment, giữ URL/model như Blueprint. Save và deploy. Kiểm tra `/ai/chat` có `used_llm: true`, model đúng và không có `metadata.error`.
2. Google Cloud: cấu hình branding cho SciLab, chỉ dùng các scope đăng nhập cơ bản (`openid`, `email`, `profile`). Tạo OAuth client loại **Web application**.
3. Authorized JavaScript origins của client phải có `https://scilab-demo-web-bl06.onrender.com`. Có thể thêm `http://localhost:8000` nếu sử dụng client đó cho local.
4. Nếu dùng luồng redirect OAuth phía backend trong tương lai, redirect URI là `https://scilab-demo-api-bl06.onrender.com/auth/google/callback`; giao diện hiện tại dùng luồng ID token nêu trên.
5. Render backend: đặt `GOOGLE_CLIENT_ID` thành client ID vừa tạo. Sync Blueprint và rebuild frontend để service reference cập nhật `APP_CONFIG_GOOGLE_CLIENT_ID`.
6. Kiểm thử đăng nhập Google trong trình duyệt bằng tài khoản do người dùng chọn. Không xác nhận Google login hoạt động chỉ dựa vào việc nút Google xuất hiện.

Project Google Cloud được người dùng chọn trong lần thiết lập này: `ai-lab-16-longbl`.
OAuth Web Client: `SciLab Render Web`, client ID công khai
`617306138360-lp9o43cbnndkadavilvu2fgtg9e8p5a7.apps.googleusercontent.com`.
Authorized JavaScript origin: `https://scilab-demo-web-bl06.onrender.com`.

ModelAPI đã được cấu hình và deploy trên backend Render ngày 2026-11-17. Hai request
`/ai/chat` thật xác nhận `used_llm: true`, `metadata.model: gpt-6-luna`, có references
và không có `metadata.error`. Kết quả này xác nhận kết nối LLM, không phải benchmark
độ chính xác của học liệu hay chất lượng câu trả lời.
