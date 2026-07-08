# User Roles — AI Study Simulator

> [!IMPORTANT]
> **Trạng thái: kế hoạch ban đầu — đã khác thực tế.** Hệ thống thực tế dùng 3 vai trò **`admin` / `teacher` (giáo viên) / `student` (học sinh)**; **không có Guest mode** và **không có rate-limit theo IP** như mô tả dưới. Đăng nhập: Email/Mật khẩu hoặc **Google OAuth** (đều đã triển khai). Phân quyền route qua Passport JWT. Chi tiết auth: [api-contracts.md](api-contracts.md#auth-auth). Phần dưới giữ lại làm lịch sử.

## Vai trò người dùng

### 1. Guest (Khách)
- Không cần đăng ký
- Giới hạn: 3 session/ngày
- Không lưu lịch sử
- Không dùng Teacher Share Mode

### 2. Student (Học sinh đã đăng ký)
- Đăng ký bằng Email/Password hoặc Google OAuth
- Không giới hạn session
- Lưu history 20 session gần nhất
- Dùng được Sample Library

### 3. Teacher (Giáo viên)
- Tất cả quyền của Student
- Tạo Teacher Share Mode: sinh shareable URL + QR code
- Link public có thể xem không cần đăng nhập (read-only)

## Phân quyền

| Tính năng | Guest | Student | Teacher |
|-----------|-------|---------|---------|
| Nhập bài & xem simulation | ✅ (3/ngày) | ✅ | ✅ |
| AI explanation streaming | ✅ (3/ngày) | ✅ | ✅ |
| Follow-up questions | ✅ (3/ngày) | ✅ | ✅ |
| Quiz MCQ | ✅ (3/ngày) | ✅ | ✅ |
| Sample Library | ✅ | ✅ | ✅ |
| Session History | ❌ | ✅ (20 session) | ✅ (20 session) |
| Teacher Share Mode | ❌ | ❌ | ✅ |
| Restore session | ❌ | ✅ | ✅ |

## Auth Flow

```
Email/Password → POST /auth/register → POST /auth/login → JWT (access 1h + refresh 30d)
Google OAuth   → POST /auth/google   → JWT (access 1h + refresh 30d)
Guest          → Không cần token; rate-limit bằng IP (3 session/IP/ngày)
```
