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

## Nguồn

- https://supabase.com/docs/guides/database/connecting-to-postgres
- https://supabase.com/docs/guides/database/extensions/pgvector
- https://supabase.com/kb/guides/migrate-from-render
