# Deploy SciLab trên Cloudflare Pages

Quyết định triển khai: [ADR-0008](../adrs/0008-cloudflare-pages.md).

## Kiến trúc

Frontend UmiJS/React chạy dưới dạng static assets trên Cloudflare Pages. Backend
NestJS vẫn ở `https://scilab-demo-api-bl06.onrender.com`, kết nối PostgreSQL trên
Supabase theo [hướng dẫn database](supabase-migration.md).

Project Pages: `scilab-learning-simulator`. Đã deploy production ngày 19/11/2026:
**https://scilab-learning-simulator.pages.dev**.

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

Google client hiện tại thuộc project `ai-lab-16-longbl` (số `617306138360`), tên
hiển thị `ai-lab-16-gcp`. Tài khoản `thanosid17@gmail.com` có quyền cấu hình client;
`baolongid2006@gmail.com` không có quyền truy cập project này.

## Kết quả deploy ngày 19/11/2026

Cloudflare báo `Success!` sau khi nhận đủ 441/441 tài nguyên và xuất bản project.
Deployment production: `02ecbb1d-1ceb-4abf-9920-2f263c5a1f58`; URL bất biến:
`https://02ecbb1d.scilab-learning-simulator.pages.dev`.
Archive đã upload có SHA-256
`d530f8e9654b7131113e6ad329f8ad68861fd142b7638717ae1e7b45f98410b5`;
kích thước 22.431.582 byte. Chỉ gồm output build, không chứa `.env`, database
backup hoặc sourcemap.

Các kiểm tra đã hoàn tất:

- `/`, `/user/login`, `/hoc-sinh/workspace` và một route động lớp học trả HTTP 200,
  `text/html`, được phục vụ bởi Cloudflare.
- SHA-256 của JavaScript bundle tải từ Pages khớp với bundle local đã build;
  bundle dùng API Render đúng cấu hình, không chứa connection string PostgreSQL.
- API health và CORS cho origin Pages hoạt động; API templates trả đủ 19 mục.
- Đăng nhập email bằng tài khoản giáo viên demo thành công từ giao diện Pages,
  chuyển tới `/dashboard`.
- Giao diện mô phỏng ném xiên và phản ứng Fe với CuSO₄ hiển thị trên Pages.

Backend và database tiếp tục chạy trên Render + Supabase. Đây là deployment
Direct Upload, chưa có auto-deploy GitHub.

## Sửa Google login trên Cloudflare ngày 19/11/2026

Đã tái hiện lỗi Google `origin_mismatch`; log trình duyệt ghi rõ
`The given origin is not allowed for the given client ID.` Client `SciLab Render
Web` khi đó chỉ cho phép origin Render.

Theo yêu cầu và xác nhận của chủ dự án, đã dùng tài khoản Google Cloud
`thanosid17@gmail.com` thêm `https://scilab-learning-simulator.pages.dev` vào
Authorized JavaScript origins của client
`617306138360-lp9o43cbnndkadavilvu2fgtg9e8p5a7.apps.googleusercontent.com`.
Origin Render được giữ lại. Google Cloud báo lưu thành công và mở lại client
hiển thị cả hai origin. Thay đổi nằm trong Google Cloud; không cần build hoặc
deploy lại frontend/backend.

Sau khi tải lại trang, Google hiển thị màn hình chọn tài khoản thay vì báo
`origin_mismatch`. Chủ dự án hoàn tất chọn tài khoản và xác nhận đăng nhập thành
công; kiểm tra lại tab ứng dụng thấy `/hoc-sinh` với tài khoản và danh sách bài
học. Luồng Google login trên tên miền Pages đã được kiểm chứng thành công.

## Nguồn

- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/configuration/serving-pages/
- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
