# API Contracts — AI Study Simulator

> Cập nhật theo mã nguồn thực tế (`src/backend/src/modules/**`). Đây là bản phản ánh API đang chạy — thay cho bản kế hoạch cũ (Fastify, `/api/v1`, SSE, guest mode) vốn không còn đúng.

## Quy ước chung

- **Base URL (dev):** `http://localhost:3000` — **không có prefix `/api/v1`**.
- **Swagger UI:** `GET /api` (chỉ là trang tài liệu, không phải prefix API).
- **Auth:** `Authorization: Bearer <jwt>` cho các route yêu cầu đăng nhập (Passport JWT).
- **Envelope:** mọi response được `ResponseInterceptor` bọc:

```json
{ "data": { }, "message": "Thành công", "statusCode": 200 }
```

→ Frontend phải unwrap `response.data`. Với Umi/axios có thể gặp double-wrap `res.data.data`.

- **Validation:** `ValidationPipe({ transform: true, whitelist: true })` toàn cục.

---

## AI / RAG (`/ai`)

| Method | Path | Mô tả |
|---|---|---|
| POST | `/ai/analyze` | Phân tích dạng bài, chọn simulation, trả references |
| POST | `/ai/chat` | Hỏi đáp Hybrid RAG (vector + keyword) qua Mistral |
| POST | `/ai/quiz/generate` | Sinh quiz MCQ |

👉 **Contract chi tiết (request/response, prompt, fallback):** [../Backend-Ai.md](../Backend-Ai.md).

### Chat sessions (`/ai/chat`, module `chat`) — có lưu lịch sử

| Method | Path | Mô tả |
|---|---|---|
| POST/GET | `/ai/chat/sessions` | Tạo / liệt kê phiên chat |
| GET/DELETE | `/ai/chat/sessions/:id` | Lấy / xóa phiên |
| GET/POST | `/ai/chat/sessions/:id/messages` | Lấy / gửi tin nhắn trong phiên |
| POST | `/ai/chat/generate-experiment` | Sinh cấu hình thí nghiệm |
| POST | `/ai/chat/sessions/:id/experiment-chat` | Chat thiết kế thí nghiệm |
| POST | `/ai/chat/sessions/:id/guidance` | Gợi ý hướng dẫn |

---

## Auth (`/auth`)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Đăng ký (201) |
| POST | `/auth/login` | ❌ | Đăng nhập email/mật khẩu |
| POST | `/auth/google/verify` | ❌ | Xác thực Google ID token từ frontend |
| GET | `/auth/google` | ❌ | Khởi tạo luồng Google OAuth (redirect) |
| GET | `/auth/google/callback` | ❌ | Callback Google → redirect kèm token |

**Register — request:**
```json
{ "email": "student@example.com", "password": "SecurePass123!", "firstName": "Nguyễn", "lastName": "Văn A", "phone": "0912345678" }
```
`email`, `password` bắt buộc; các trường còn lại tùy chọn.

**Login — request:** `{ "email": "...", "password": "..." }`
**Google verify — request:** `{ "token": "<google_id_token>" }` → `data: { "access_token": "..." }`

---

## Users & Gamification (`/users`)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/users/me` | Thông tin user hiện tại |
| PATCH | `/users/me` | Cập nhật hồ sơ |
| GET | `/users/me/stats` | `{ xp, level, streak, maxStreak, levelTitle, nextThreshold, xpToNextLevel }` |
| POST | `/users/me/complete-activity` | Gửi XP kiếm được `{ xpEarned }` |
| POST | `/users/me/touch` | Cập nhật hoạt động (streak) |
| GET | `/users/leaderboard?limit=N` | Bảng xếp hạng theo XP |
| POST | `/users/me/labs/open` · `/complete` | Mở / hoàn thành một lab (mô phỏng) |
| GET | `/users/me/labs` | `{ inProgress[], completed[] }` |
| CRUD | `/users/page`, `/all`, `/one`, `/:id`, ... | CRUD chuẩn `BaseController` |

---

## Lớp học (`/classrooms`)

| Method | Path | Mô tả |
|---|---|---|
| POST | `/classrooms` | Tạo lớp (giáo viên) |
| GET | `/classrooms/teacher` | Lớp của giáo viên |
| GET | `/classrooms/student/me` | Lớp của học sinh |
| GET/DELETE | `/classrooms/:id` | Chi tiết / xóa lớp |
| POST | `/classrooms/join` | Học sinh tham gia bằng mã |
| PATCH | `/classrooms/:classId/members/:memberId` | Cập nhật thành viên |
| POST | `/classrooms/:classId/assignments` | Giao bài |
| POST | `/classrooms/assignments/:assignmentId/submit` | Nộp bài |

---

## Đề thi (`/exams`) & Ngân hàng câu hỏi (`/question-bank`)

| Method | Path | Mô tả |
|---|---|---|
| POST | `/exams` | Tạo đề thủ công |
| POST | `/exams/ai-generate` | **Sinh đề bằng AI** |
| GET | `/exams` · `/exams/:id` · `/exams/:id/questions` | Xem đề & câu hỏi |
| PUT/DELETE | `/exams/:id` | Sửa / xóa |
| POST | `/question-bank/ai-generate` | **AI sinh câu hỏi** (chống trùng) |
| POST | `/question-bank/bulk` | Import hàng loạt |
| CRUD | `/question-bank/...` | CRUD chuẩn `BaseController` |

---

## Thí nghiệm (`/scene`)

`GET /scene/all`, `GET /scene/page`, `POST /scene`, `PUT /scene/:id`, `DELETE /scene/:id`, và `POST /scene/import/validate|execute`, `POST /scene/export/execute`.

---

## Phân tích (`/analytics`, `/classrooms/:id/analytics`)

- Giáo viên: `/analytics/teacher/overview`, `/class-comparison`, `/monthly-trends`, `/top-students`, `/recent-activity`, `/subject-breakdown` (+ `/export/xlsx`).
- Theo lớp: `/classrooms/:id/analytics/overview`, `/completion`, `/score-distribution`, `/timeline`, `/student-ranking`, `/per-assignment`, `/student-detail` (+ export xlsx).

---

## Admin (`/admin`)

- Thống kê: `/admin/stats/overview`, `/admin/stats/railway-metrics`.
- Người dùng: `GET/POST /admin/users`, `PUT /admin/users/:id/role|lock`, `POST /admin/users/:id/reset-password`, `POST /admin/users/import`, `DELETE /admin/users/:id`.
- Lớp: `GET /admin/classes`, `PUT /admin/classes/:id/teacher|lock`, `DELETE /admin/classes/:id`.
- Kiểm duyệt nội dung: `/admin/content/sims`, `/admin/content/questions`, `/admin/content/exams` (publish/approve/reject).

---

## Learning / RAG data (`/learning`)

| Path | Mô tả |
|---|---|
| `GET /learning/theory-chunks` · `/:id` | Học liệu đã chunk |
| `GET /learning/theory-chunks/rag/search` | Tìm kiếm RAG |
| `GET /learning/simulation-templates` · `/:simulationId` | Template mô phỏng |
| `GET /learning/problem-patterns` · `/learning/items` | Mẫu bài / học liệu |
| `POST /learning/seed*`, `.../seed/default` | Seed dữ liệu |
| `GET /learning/health` | Health check module learning |

---

## Khác

- **Readiness:** `GET /health/ready` (public, không cần JWT). Thực hiện `SELECT 1`
  qua kết nối TypeORM hiện tại; trả `200` với `data: { status: "ok", database:
  "ok" }` trong envelope khi truy vấn thành công. Khi DB không sẵn sàng, trả
  `503` với thông báo chung, không lộ lỗi DB/credentials. Header
  `Cache-Control: no-store`. Không ghi dữ liệu, seed hoặc gọi dịch vụ AI/Google.
- **Thông báo:** `GET /notification/me/page`, `POST /notification/read`.
- **Danh mục:** `/subjects`, `/topics`, `/difficulties`, `/question-types`, `/grades` (CRUD chuẩn).

---

## Mã lỗi HTTP

- `400` validation · `401` thiếu/sai token · `403` sai vai trò · `429` rate limit (`@nestjs/throttler`) · `500` lỗi server.

Lỗi cũng đi qua envelope; `message` là chuỗi tiếng Việt dễ đọc.
