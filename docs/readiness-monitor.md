# Kiểm tra API và database định kỳ

Worker Cloudflare: `scilab-readiness-monitor`. Lịch: mỗi 5 phút, 288 lần/ngày.
Mã nguồn và lịch chạy: `src/keepalive/worker.mjs`, `src/keepalive/wrangler.jsonc`.
Quyết định: [ADR-0009](../adrs/0009-scheduled-readiness-check.md).

Worker gọi `GET https://scilab-demo-api-bl06.onrender.com/health/ready`.
Backend thực hiện `SELECT 1` qua TypeORM tới Supabase, rồi trả envelope:

```json
{"data":{"status":"ok","database":"ok"},"message":"Thành công","statusCode":200}
```

Response dùng `Cache-Control: no-store`. Worker bỏ qua cache, không theo redirect,
và xác nhận JSON có cả `status=ok` và `database=ok`, tránh coi trang loading của
Render là thành công. Timeout 90 giây để chờ lượt cold start ban đầu. Nếu lỗi,
scheduled invocation báo failed; log chỉ lưu kết quả, HTTP status và elapsedMs.

Worker không có HTTP route công khai, không gọi AI, Google login hay ghi dữ liệu
người dùng. Nó chạy trên Cloudflare, không phụ thuộc máy cá nhân hoặc tab web mở.

## Deploy và kiểm tra

Dùng Wrangler đã được xác thực cho đúng tài khoản Cloudflare:

```powershell
wrangler deploy --config src/keepalive/wrangler.jsonc
wrangler tail scilab-readiness-monitor --format json
```

Trong dashboard, mở Workers & Pages → scilab-readiness-monitor → Settings để xem
Cron Trigger; Observability/Logs hiển thị kết quả thực thi. Thay đổi lịch có thể
mất tới 15 phút để lan truyền. Theo dõi ít nhất một lượt thực thi sau deploy.

Muốn tắt, xóa lịch trong `triggers.crons` rồi deploy lại. Không cần xóa database,
đổi OAuth client hoặc tác động đến các bản frontend.

## Giới hạn

Kiểm tra định kỳ giúp giảm idle spin-down của Render Free nhưng không vượt qua
giới hạn 750 giờ chạy/tháng/workspace hay ngăn nhà cung cấp restart dịch vụ.
Supabase Free vẫn chịu chính sách tạm dừng do hoạt động thấp. Request không gia
hạn JWT hoặc khôi phục API key đã hết hạn/thu hồi/hết quota.

## Triển khai ngày 25/11/2026

- Backend đã deploy endpoint readiness; kiểm tra online trả HTTP 200, database
  `ok`, header `Cache-Control: no-store`.
- Worker production version `9622705f-03c0-4a5c-bed2-3ea5da03fa04`, deploy lúc
  14:59 UTC (21:59 giờ Việt Nam). Cloudflare đã gắn Cron Trigger mỗi 5 phút và
  dashboard hiển thị `Every 5 minutes`.
- `workers_dev=false`, không có HTTP route; không cần public URL cho Worker.
- Backend build pass, 27 Jest tests pass; 3 tests Worker pass, bao gồm phản hồi
  loading HTML, JSON thiếu database readiness, HTTP/network lỗi và log không lộ
  response upstream. ESLint/Prettier pass cho các file readiness backend.

## Nguồn

- https://developers.cloudflare.com/workers/configuration/cron-triggers/
- https://render.com/docs/free
- https://supabase.com/docs/guides/platform/going-into-prod
