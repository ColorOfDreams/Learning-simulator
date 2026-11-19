# Chuyển SciLab từ Render Postgres sang Supabase

Project đích chuẩn bị ngày 19/11/2026: `scilab-learning-simulator`, Oregon,
session pooler. Tài khoản backend `scilab_app` chỉ có quyền DML trong schema
`scilab`, kết nối có CA Supabase và kiểm tra TLS. Không ghi mật khẩu vào tài liệu.

## Phạm vi

Giữ NestJS, TypeORM, Google login và các API hiện có. Supabase đóng vai trò
PostgreSQL được quản lý. Data API không cần bật, bảng ứng dụng đặt trong schema
`scilab` để không tự mở dữ liệu tài khoản qua REST.

## Chuẩn bị đã có trong mã nguồn

- `src/core/database-options.ts`: cấu hình URL, TLS có kiểm tra chứng chỉ, schema,
  pool và tùy chọn đồng bộ schema. Các DB_* cũ vẫn được hỗ trợ.
- `scripts/database-config.cjs`: dùng cùng thiết lập cho startup script.
- `DEMO_SEED_ON_START=false`: tắt cả dataset seed, users seed và question-bank
  seed khi dữ liệu đã chuyển.
- `scripts/prepare-supabase-dump.py`: đổi schema của pg_dump SQL sang `scilab`
  mà không thay đổi dữ liệu trong COPY. Có kiểm thử bảo toàn nội dung người dùng.

## Trình tự chuyển

1. Tạo project Supabase Free riêng, chọn Oregon nếu API Render còn ở Oregon;
   ghi mật khẩu database trong nơi lưu bí mật. Không dừng project khác để lấy chỗ
   nếu chưa được chủ dự án cho phép.
2. Chuẩn bị đường kết nối nguồn. Nếu nguồn chặn truy cập ngoài, chỉ mở tạm đúng
   IP máy chuyển dữ liệu sau khi có xác nhận, rồi gỡ lại.
3. Dùng pg_dump tương thích với phiên bản nguồn để tạo backup schema public:
   `--quote-all-identifiers --no-owner --no-privileges --no-comments --schema=public`.
   Credentials truyền qua môi trường/pgpass riêng, không đặt trong đối số được log.
   Đặt backup trong thư mục riêng không commit vì chứa dữ liệu người dùng.
4. Trên database đích mới, bật vector và uuid-ossp trong schema extensions khi
   cần. Chuyển DDL/reference từ public sang scilab; kiểm tra SQL trước restore.
   Chỉ restore vào schema đích mới, không chạy DROP/CLEAN vào schema Supabase.
5. Restore bằng psql ON_ERROR_STOP và một transaction. Kiểm tra số bản ghi từng
   bảng, khóa ngoại, dữ liệu quan trọng và checksum theo nội dung. Nếu có ghi mới
   ở nguồn sau snapshot, thực hiện lượt đồng bộ cuối trong thời gian bảo trì.
6. Kiểm tra backend với kết nối đích trước cutover. Chạy auth, mở bài, chat,
   ghi/đọc kết quả; không dùng một health endpoint tĩnh để xác nhận toàn migration.
7. Cấu hình Render bằng các biến dưới, deploy và kiểm tra lại. Giữ JWT secret,
   Google và cấu hình pool LLM hiện có. Giữ database Render để rollback.

```dotenv
DATABASE_URL=postgresql://ROLE:PASSWORD@SESSION_POOLER_HOST:5432/postgres
DB_SSL=true
DB_SCHEMA=scilab
DB_POOL_MAX=5
DB_SYNCHRONIZE=false
DEMO_SEED_ON_START=false
```

Dùng session pooler cho backend IPv4 chạy lâu dài. CA riêng nếu provider yêu cầu
được đặt ở DB_SSL_CA; không dùng rejectUnauthorized=false. URL chứa mật khẩu phải
percent-encode đúng, không thêm sslmode query làm ghi đè cấu hình TLS.

Tài khoản ứng dụng nên chỉ có quyền cần thiết trên schema scilab; không cấp quyền
cho anon/authenticated và không thêm scilab vào exposed schemas. Các bảng Auth
của ứng dụng là bảng NestJS hiện có, khác với schema auth do Supabase quản lý.

## Rollback

Giữ biến DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME cũ và backup đã kiểm tra. Nếu
cutover lỗi, đưa kết nối về Render trước khi mở ghi trở lại. Nếu đã có ghi vào
Supabase, cần bảo toàn phần ghi mới trước rollback, không chỉ đổi URL ngược lại.
Không xóa database cũ như một bước tự động sau deploy.

## Kiểm chứng thực tế ngày 19/11/2026

Backend cục bộ (`src/backend/.env`, không commit) đã chuyển sang session pooler
của project hiện có `scilab-learning-simulator`, dùng role ứng dụng `scilab_app`
và schema `scilab`. Cấu hình PostgreSQL cũ được sao lưu riêng ngoài repository;
các biến auth/Google/LLM được giữ nguyên. Mẫu không chứa bí mật để tái sử dụng:
[`../src/backend/.env.supabase.example`](../src/backend/.env.supabase.example).

Các kiểm tra sau đã thực hiện với database Supabase thật:

| Kiểm tra | Kết quả |
| --- | --- |
| TLS từ Node tới pooler | Mã hóa và xác minh chứng chỉ thành công |
| Quyền role ứng dụng | Đọc/ghi được dữ liệu; không có quyền CREATE trong schema ứng dụng |
| Schema | `scilab`, 25 bảng ứng dụng |
| Dữ liệu hiện có | 15 users; 4.634 theory chunks; 19 simulation templates; 128 learning items; 24 problem patterns |
| pgvector | Extension 0.8.2; cột vector 1.024 chiều |
| Build backend | Pass |
| Jest | 6 suites, 25 tests pass |
| API dùng Supabase | 5/5 HTTP 200: simulation templates, theory chunks, keyword RAG search, chat sessions, hồ sơ với JWT hợp lệ |
| Ghi dữ liệu | INSERT + SELECT phiên chat trong transaction thành công; ROLLBACK được xác minh không để lại bản ghi |

`DB_SYNCHRONIZE=false` và `DEMO_SEED_ON_START=false` trong cấu hình cục bộ đã được
kiểm tra, nhằm dùng dữ liệu hiện có trên Supabase. Kiểm tra hồ sơ dùng JWT ngắn
hạn ký bằng khóa cục bộ và tài khoản đã tồn tại; chưa kiểm tra lại Google OAuth.

Giới hạn: hiện không có chunk nào mang embedding, vì vậy kiểm tra RAG nói trên
xác nhận nhánh keyword, chưa xác nhận retrieval vector. Không chạy tạo embedding
hoặc gọi LLM chỉ để kiểm tra việc đổi database.

### Cutover bản demo online

Theo xác nhận của chủ dự án, API Render `scilab-demo-api-bl06` đã được bật lại,
cấu hình kết nối Supabase và deploy mã có hỗ trợ `DATABASE_URL`. Các biến
JWT/Google/LLM và địa chỉ API công khai được giữ nguyên.

Trước khi mở lại API, đã thực hiện:

- Đổi tạm đúng một rule IP `/32` của nguồn Render theo xác nhận của chủ dự án,
  lấy bản backup đầy đủ bằng pg_dump 17 và kiểm tra archive bằng pg_restore.
  Backup riêng ngoài repo có 25 mục TABLE DATA, kích thước 1.561.722 byte.
- Đối chiếu nội dung từng bản ghi bằng SHA-256 trên JSON chuẩn hóa: mọi bản ghi
  nguồn trong cả 25 bảng được bảo toàn tại đích. 23 bảng khớp hoàn toàn;
  `ai_usage_logs` và `daily_active_users` chỉ có thêm bản ghi do kiểm tra ở đích.
  Không cần ghi đè hoặc đồng bộ bổ sung dữ liệu nguồn.
- Khôi phục rule IP cũ ngay sau khi lấy backup và đối chiếu; giữ database nguồn
  Render để có thể phục hồi khi cần.
- Thay mật khẩu role ứng dụng sau khi màn hình import biến của Render hiện
  chuỗi kết nối trong kết quả kiểm tra. Cấu hình cục bộ và Render sử dụng mật khẩu
  mới; không đưa connection string vào mã nguồn hoặc tài liệu.

Kiểm chứng online sau deploy:

- Log Render báo ứng dụng đã chạy và `Migrated database: startup dataset seed
  disabled.`; dịch vụ đã live.
- 7 request API thành công: health, danh sách simulation templates, keyword RAG,
  danh sách phiên chat và tạo/đọc/xóa riêng một phiên kiểm tra.
- Phiên chat được tạo qua API công khai đã xuất hiện trong Supabase khi truy vấn
  bằng kết nối ứng dụng, rồi biến mất sau DELETE qua API. Đây là kiểm tra database
  thực sự được bản online sử dụng, ngoài kiểm tra HTTP health.
- Frontend `https://scilab-demo-web-bl06.onrender.com` trả HTTP 200; API giữ nguyên
  tại `https://scilab-demo-api-bl06.onrender.com`.

Thay đổi mã nguồn nằm trên `feature/ASS-040-render-demo`, PR #2 vào `dev`, chưa
merge vào `dev` hoặc `main`. Hai CI checks build backend/frontend đã pass cho mã
cấu hình Supabase. Việc xác minh này không bao gồm thử tải hoặc Google OAuth.

## Nguồn

- https://supabase.com/docs/guides/database/connecting-to-postgres
- https://supabase.com/docs/guides/database/extensions/pgvector
- https://supabase.com/kb/guides/migrate-from-render
