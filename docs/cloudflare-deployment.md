# Deploy SciLab trên Cloudflare Pages

Quyết định triển khai: [ADR-0008](../adrs/0008-cloudflare-pages.md).

## Kiến trúc

Frontend UmiJS/React chạy dưới dạng static assets trên Cloudflare Pages. Backend
NestJS vẫn ở `https://scilab-demo-api-bl06.onrender.com`, kết nối PostgreSQL trên
Supabase theo [hướng dẫn database](supabase-migration.md).

Project Pages: `scilab-learning-simulator`. Địa chỉ dự kiến:
`https://scilab-learning-simulator.pages.dev` (xác nhận sau khi deploy).

## Build

Dùng Node.js 22 và Yarn theo package.json. Từ `src/frontend`:

```powershell
corepack enable
yarn install --immutable
yarn build:cloudflare
```

Các biến public tham khảo ở
[`src/frontend/.env.cloudflare.example`](../src/frontend/.env.cloudflare.example).
Script `build:cloudflare` dùng API Render và Google web client hiện tại theo mặc
định; có thể truyền `APP_CONFIG_IP_ROOT`, `APP_CONFIG_GOOGLE_CLIENT_ID` và
`APP_CONFIG_TEN_TRUONG` để thay đổi. Không đặt mật khẩu database, JWT secret hoặc
khóa LLM trong frontend.

UmiJS đọc `.env` sau biến môi trường của shell. Script build sử dụng `.env.local`
tạm thời để bảo đảm địa chỉ API deploy được chọn đúng, rồi khôi phục nguyên trạng
file này khi build kết thúc. `.env` phát triển của người dùng không bị thay đổi.

Umi exportStatic sinh `404.html`; script chuẩn bị Pages bỏ riêng file này trong
thư mục build để Cloudflare bật SPA fallback cho route lồng nhau. Các HTML, JS,
CSS, ảnh và tài nguyên mô phỏng khác được giữ nguyên.

## Upload

Trong Cloudflare, vào Workers & Pages → project → Create deployment. Upload ZIP
của **nội dung bên trong** `src/frontend/dist`, với `index.html` ở gốc archive.
Chỉ upload output build, không upload source, `.env`, database backup hoặc
`node_modules`.

Đây là project Direct Upload; push GitHub không tự cập nhật Pages. Build và upload
lại khi phát hành phiên bản mới. Có thể dùng `wrangler pages deploy dist
--project-name=scilab-learning-simulator` sau khi xác thực Wrangler riêng. Project
Direct Upload không chuyển trực tiếp sang Git integration được; tạo project khác
nếu sau này cần Cloudflare tự build từ Git.

## Kiểm tra sau deploy

- Trang `/`, `/user/login`, `/hoc-sinh/workspace` và route động trả HTML thành công.
- JS bundle chứa địa chỉ API Render, không trỏ localhost, không chứa database URL.
- Login email, gọi API từ trình duyệt và một mô phỏng hoạt động trên origin mới.
- Google Identity Services cần thêm `https://scilab-learning-simulator.pages.dev`
  vào Authorized JavaScript origins của web client đang dùng. Đây là bước cấu hình
  trong Google Cloud, tách biệt với cấu hình CORS backend.

Ngày 19/11/2026, tài khoản Google Cloud đang mở báo không có quyền xem/sửa project
`617306138360`, nơi sở hữu Google client hiện tại. Nếu origin chưa được thêm,
chủ project Google cần thực hiện bước này trước khi đăng nhập Google trên Pages.

## Nguồn

- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/configuration/serving-pages/
- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
