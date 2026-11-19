# AI Study Simulator

> Nền tảng học **Vật lý – Hóa học – Toán** THPT (Việt Nam) qua **mô phỏng thí nghiệm tương tác** kết hợp **trợ lý AI (RAG)** giải thích bằng tiếng Việt — kèm công cụ cho giáo viên (tạo thí nghiệm, tạo lớp, tạo đề & ngân hàng câu hỏi bằng AI) và cơ chế gamification cho học sinh.

`NestJS` · `TypeORM` · `PostgreSQL + pgvector` · `UmiJS/React 19` · `Ant Design v5` · `Three.js` · `Mistral (RAG)` · `Docker` · `Railway`

> [!NOTE]
> Đây là tài liệu **nguồn sự thật duy nhất (single source of truth)** cho dự án. Đọc hết file này là nắm được toàn bộ: sản phẩm làm gì, kiến trúc, tech stack, cách chạy, API và cách deploy. Xem [Bản đồ tài liệu](#-bản-đồ-tài-liệu) ở cuối để biết file nào còn hiệu lực, file nào chỉ mang tính lịch sử.

---

## 📚 Mục lục

- [Sản phẩm là gì](#-sản-phẩm-là-gì)
- [Tính năng chính](#-tính-năng-chính)
- [Tài khoản demo](#-tài-khoản-demo)
- [Kiến trúc tổng quan](#-kiến-trúc-tổng-quan)
- [Tech stack](#-tech-stack)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Bắt đầu nhanh (local)](#-bắt-đầu-nhanh-local)
- [Biến môi trường](#-biến-môi-trường)
- [Trợ lý AI & RAG](#-trợ-lý-ai--rag)
- [Thư viện mô phỏng](#-thư-viện-mô-phỏng)
- [API](#-api)
- [Deploy (Railway)](#-deploy-railway)
- [Scripts hữu ích](#-scripts-hữu-ích)
- [Quy trình đóng góp](#-quy-trình-đóng-góp)
- [Bản đồ tài liệu](#-bản-đồ-tài-liệu)

---

## 🎯 Sản phẩm là gì

Học sinh THPT thường học Vật lý – Hóa – Toán qua công thức trừu tượng, ít được trực quan hóa hiện tượng vì thí nghiệm thật tốn kém hoặc không có điều kiện; còn khi hỏi chatbot chung chung thì câu trả lời không bám chương trình SGK Việt Nam.

**AI Study Simulator** giải quyết việc đó bằng một web app duy nhất:

1. Học sinh chọn/được gợi ý một **mô phỏng thí nghiệm** (3D bằng Three.js hoặc 2D SVG) và **chỉnh tham số trực tiếp** để quan sát hiện tượng theo thời gian thực.
2. **Trợ lý AI (RAG)** trả lời câu hỏi bằng tiếng Việt, bám theo học liệu đã được truy hồi (retrieval) và gắn với mô phỏng đang xem.
3. Học sinh làm **quiz** kiểm tra, tích **XP/level/streak/badge** và tham gia **lớp học** do giáo viên tạo.
4. **Giáo viên** tạo thí nghiệm, tạo lớp, và dùng AI để **sinh đề thi / ngân hàng câu hỏi**; **Admin** quản trị người dùng, lớp, và kiểm duyệt nội dung.

Đối tượng: học sinh THPT (lớp 10–12), giáo viên bộ môn, và quản trị hệ thống.

---

## ✨ Tính năng chính

> Chỉ liệt kê tính năng đã có trong mã nguồn. Tính năng đang ở dạng khung/chưa hoàn thiện được ghi chú rõ.

### 👩‍🎓 Học sinh (`src/frontend/src/pages/HocSinh`)
- **Mô phỏng tương tác** — hơn 80 mô phỏng Vật lý / Hóa / Toán, chỉnh tham số + play/pause/reset (`src/simulations`).
- **Chat AI RAG** (`Workspace`) — hỏi đáp lý thuyết, AI gợi ý mô phỏng phù hợp, giữ ngữ cảnh hội thoại theo phiên.
- **Quiz** tự động kèm chấm điểm.
- **Gamification** — XP theo độ khó, level (`√(xp/100)+1`), streak theo ngày, badge, **bảng xếp hạng** (`Leaderboard`).
- **Lớp học** — tham gia lớp bằng mã, nhận và nộp bài tập (`Classes`).
- **Hồ sơ & tiến độ** — `Profile`, `Progress`, `MyLabs` dùng dữ liệu thật từ API.

### 👨‍🏫 Giáo viên (`src/frontend/src/pages/GiaoVien`)
- **Tạo & quản lý thí nghiệm/mô phỏng** — `TaoThiNghiem`, `QuanLyThiNghiem`, `ThiNghiem` (backend module `scene`, có import/export).
- **Tạo & quản lý lớp học** — tạo lớp, thêm học sinh, giao bài (`classrooms`).
- **Tạo đề thi bằng AI** — `POST /exams/ai-generate`, kèm giao diện tạo & in đề (`Exams/Create`, `Exams/Print`).
- **Ngân hàng câu hỏi + AI sinh câu hỏi** — `POST /question-bank/ai-generate`, import hàng loạt, có chống trùng câu hỏi.
- **Phân tích lớp học** — tổng quan, phân bố điểm, xếp hạng, xuất Excel (`analytics`, `ClassAnalytics`).

### 🛡️ Admin (`src/frontend/src/pages/Admin`)
- Thống kê hệ thống, quản lý người dùng (khóa/đổi vai trò/reset mật khẩu/import), quản lý lớp, và **kiểm duyệt nội dung** (duyệt/từ chối mô phỏng, câu hỏi, đề thi) — backend module `admin`.

---

## 🔑 Tài khoản demo

Được tạo sẵn khi seed (mật khẩu như dưới):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@gmail.com` | `abc123` |
| Giáo viên | `giaovien@gmail.com` | `abc123` |

Học sinh: tự đăng ký bằng Email/Mật khẩu hoặc đăng nhập Google.

---

## 🏗 Kiến trúc tổng quan

Monorepo, 3 tầng, API-first. AI trả lời theo pipeline **Hybrid RAG** (vector + keyword) rồi đưa qua LLM.

```
┌──────────────────────────────────────────────────────────────┐
│  Frontend — UmiJS / React 19 SPA (src/frontend)              │
│  Ant Design v5 · Three.js (mô phỏng) · KaTeX · ApexCharts    │
└───────────────┬──────────────────────────────────────────────┘
                │  HTTPS (REST/JSON, JWT Bearer)
                ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend — NestJS 11 (src/backend)                           │
│  Controller → Service → TypeORM Repository                    │
│  ResponseInterceptor bọc mọi response: {data,message,        │
│  statusCode}  ·  KHÔNG có prefix /api/v1  ·  Swagger tại /api │
│                                                              │
│   ├── /ai/analyze, /ai/chat, /ai/quiz/generate  ─┐           │
│   ├── /auth (JWT + Google OAuth)                 │           │
│   ├── /users (gamification, labs, leaderboard)   │           │
│   ├── /classrooms, /exams, /question-bank        │  AI/RAG   │
│   ├── /scene (thí nghiệm), /analytics, /admin    │  Module   │
│   └── /learning/* (theory-chunks, templates...)  │           │
│                                                  ▼           │
│   RagRetrievalService: vector search (pgvector) + keyword    │
│   fallback → merge/rerank top-5 → LlmService (Mistral)       │
└───────────────┬──────────────────────────────────────────────┘
                ▼
┌──────────────────────────────────────────────────────────────┐
│  PostgreSQL + pgvector                                        │
│  theory_chunks (embedding vector) · users · classrooms · ... │
│  TypeORM synchronize:true → schema tự đồng bộ khi khởi động  │
└──────────────────────────────────────────────────────────────┘
```

**Nguyên tắc quan trọng khi gọi API:**
- Mọi response bọc trong envelope `{ "data": ..., "message": "...", "statusCode": 200 }` → frontend phải unwrap `response.data`.
- Không có prefix `/api/v1`; route AI là `/ai/...`. Swagger UI ở `/api` chỉ là trang tài liệu.

---

## 🧰 Tech stack

| Tầng | Công nghệ |
|---|---|
| **Frontend** | UmiJS `@umijs/max` v4, React 19.2, TypeScript, Ant Design v5 + Less, `@umijs/plugin-model` (state), Axios |
| **Mô phỏng** | Three.js 0.184 + `@react-three/fiber` / `drei` / `rapier`; SVG cho sim Toán 2D; KaTeX (công thức); ApexCharts (đồ thị) |
| **Backend** | NestJS 11, TypeScript, TypeORM, `@nestjs/swagger`, `@nestjs/throttler` (rate limit), class-validator |
| **Auth** | Passport JWT + Google OAuth 2.0 (`passport-google-oauth20`), bcryptjs |
| **Database** | Supabase PostgreSQL + `pgvector` (cloud); `pgvector/pgvector:pg15` (Docker local) |
| **AI / RAG** | Mistral qua cấu hình OpenAI-compatible (`LLM_*` chat, `EMBEDDING_*` embedding); Hybrid RAG (vector + keyword) trên `theory_chunks` |
| **Khác** | exceljs (import/export Excel), OneSignal (push notification), TinyMCE (soạn thảo) |
| **Hạ tầng** | Docker Compose (dev local) · Railway (production) · GitHub Actions (CI build/test) |

---

## 📂 Cấu trúc thư mục

```
C2-App-107/
├── README.md                     ← file này (tổng quan dự án)
├── Backend-Ai.md                 ← tài liệu chi tiết AI/RAG cho FE↔BE (đang dùng)
├── DEMO_DAY.md                   ← bản mô tả sản phẩm cho Demo Day
├── Dockerfile.railway            ← build backend cho Railway (context = gốc repo)
├── Dockerfile.frontend.railway   ← build frontend cho Railway
├── src/
│   ├── frontend/                 ← UmiJS/React SPA (pages: HocSinh, GiaoVien, Admin, ...)
│   ├── backend/                  ← NestJS API (modules trong src/backend/src/modules)
│   ├── simulations/              ← Thư viện mô phỏng + registry.ts (map id → component)
│   ├── database/                 ← migrations (pgvector), seeds, data
│   └── ai-service/               ← POC/prompt phục vụ AI (tham khảo)
├── data/                         ← Học liệu SGK đã làm sạch + dataset RAG (learning-data)
├── reports/                      ← Báo cáo & scorecard đánh giá RAG (RAG_METRICS_SCORECARD.md)
├── specs/                        ← Đặc tả (một phần là kế hoạch ban đầu — xem Bản đồ tài liệu)
├── adrs/                         ← Architecture Decision Records
├── planning/ · tasks/            ← Backlog, sprint, task ASS-* (lịch sử quá trình làm)
└── scripts/                      ← Hook logging của khóa học (AI usage)
```

---

## 🚀 Bắt đầu nhanh (local)

Yêu cầu: **Node.js ≥ 18**, **Yarn**, **Docker Desktop** (cho PostgreSQL + pgvector).

### 1) Backend + Database (khuyến nghị dùng Docker)

Từ thư mục `src/backend`:

```bash
# Tạo .env (xem mục Biến môi trường bên dưới), rồi:
docker compose up -d --build
docker compose ps                      # đợi postgres healthy

# Chạy migration pgvector (một lần)
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /migrations/001-add-pgvector-theory-chunks.sql'

# Seed học liệu + kiểm tra
docker compose exec backend npm run seed:learning-data
docker compose exec backend npm run test:learning-data

# (Tùy chọn) Sinh embedding vector cho RAG — cần EMBEDDING_* trong .env
docker compose exec backend npm run embed:theory
```

API chạy ở `http://localhost:3000`, Swagger ở `http://localhost:3000/api`.

> Chạy backend trực tiếp không qua Docker: `yarn install` rồi `yarn start:dev` (cần một PostgreSQL có sẵn `pgvector`).

### 2) Frontend

Từ thư mục `src/frontend`:

```bash
yarn install
yarn start        # alias của "max dev"; mặc định chạy dev server UmiJS
```

Cấu hình API base qua biến `APP_CONFIG_IP_ROOT` trong `src/frontend/.env` (mặc định `http://localhost:3000`).

> Trên một số máy dev, `corepack` bị chặn mạng — có thể chạy Yarn 4 qua đường dẫn cli đã cài sẵn thay vì `corepack`.

---

## 🔐 Biến môi trường

### Supabase PostgreSQL

Backend có thể dùng PostgreSQL do Supabase quản lý qua `DATABASE_URL` (session
pooler cho kết nối IPv4), `DB_SSL=true`, `DB_SCHEMA=scilab`, `DB_POOL_MAX=5`,
`DB_SYNCHRONIZE=false` và `DEMO_SEED_ON_START=false`. Chỉ bật các giá trị này sau
khi đã restore schema/dữ liệu và kiểm tra. Dùng `DB_SSL_CA` nếu chuỗi chứng chỉ
provider cần CA riêng; luôn kiểm tra chứng chỉ TLS. Không đưa connection string
hoặc mật khẩu database ra frontend. Chi tiết: [ADR-0007](adrs/0007-supabase-postgres.md).

Đây là thay nơi lưu PostgreSQL, không thay auth của ứng dụng bằng Supabase Auth.
Các bảng ứng dụng nằm trong schema riêng; không cần bật Data API cho trình duyệt.

Mẫu cấu hình: [src/backend/.env.supabase.example](src/backend/.env.supabase.example).
Thêm các biến trong mẫu vào `src/backend/.env`, điền kết nối và CA của project,
giữ các cấu hình JWT/Google/LLM hiện có. `DATABASE_URL` được ưu tiên hơn nhóm
`DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`. Backend cục bộ đã được kiểm tra
với project `scilab-learning-simulator` ngày 19/11/2026; trạng thái triển khai và
giới hạn kiểm tra nằm trong [hướng dẫn chuyển database](docs/supabase-migration.md).

Backend (`src/backend/.env`) — các nhóm chính:

```dotenv
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ai_mo_phong
PORT=3000

# Auth
JWT_SECRET=change-this-in-production-min-32-chars
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# LLM (OpenAI Chat Completions-compatible; provider đổi được qua .env).
# Mặc định trong code nếu để trống: https://api.openai.com/v1 + gpt-4o-mini.
# Cấu hình đã dùng thực tế là Mistral (ví dụ dưới):
LLM_API_KEY=
LLM_BASE_URL=https://api.mistral.ai/v1
LLM_MODEL=mistral-small-latest

# Embedding (OpenAI Embeddings-compatible)
EMBEDDING_API_KEY=
EMBEDDING_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# Trả thêm data.debug cho /ai/chat khi cần chẩn đoán
AI_DEBUG=false
```

> Không commit `.env` thật; không đưa `LLM_API_KEY`/`EMBEDDING_API_KEY` ra frontend. Chi tiết đầy đủ trong [Backend-Ai.md](Backend-Ai.md).

---

## 🤖 Trợ lý AI & RAG

- Hai API chính: `POST /ai/analyze` (nhận diện dạng bài, chọn mô phỏng, trả references) và `POST /ai/chat` (hỏi đáp Hybrid RAG). Ngoài ra có `POST /ai/quiz/generate`.
- **Hybrid RAG**: truy hồi bằng **vector search** (pgvector) kết hợp **keyword fallback**, gộp và rerank top-5 chunk trong bảng `theory_chunks`, rồi đưa vào **Mistral** để sinh câu trả lời tiếng Việt bám học liệu.
- **Fallback nhiều lớp** (không phải lỗi HTTP): thiếu API key, lỗi LLM, hoặc lỗi vector đều **không làm request thất bại** — hệ thống vẫn trả lời từ theory chunk hoặc keyword retrieval.
- Học liệu được chia thành `theory_chunks`, embedding được **cache theo `content_hash`** → `embed:theory` chỉ tạo lại vector cho chunk có nội dung thay đổi.
- Phiên chat (session + messages) được lưu qua module `chat` (`/ai/chat/sessions...`).

📖 Chi tiết contract, prompt, fallback, và cách chuẩn bị dữ liệu: **[Backend-Ai.md](Backend-Ai.md)**.
📊 Kết quả đánh giá retrieval (Hit@k, MRR — dữ liệu *preview/dev*, chưa promote lên production): **[reports/RAG_METRICS_SCORECARD.md](reports/RAG_METRICS_SCORECARD.md)**.

---

## 🔬 Thư viện mô phỏng

Đăng ký tại [src/simulations/registry.ts](src/simulations/registry.ts) — map `simulation_id → component`.

| Môn | Phạm vi | Ghi chú |
|---|---|---|
| **Vật lý** | Động học, ném xiên, Newton, con lắc, dao động (điều hòa/tắt dần/cộng hưởng), sóng/giao thoa/sóng dừng, điện trường/mạch điện, từ trường/cảm ứng, hạt nhân... | Các component `SIM-02`, `SIM-21`…`SIM-52` (Three.js) |
| **Hóa học** | Lớp 10 (`CHEM10-01..12`), lớp 11 (`CHEM11-01..11`), lớp 12 (`CHEM12-01..13`) | Chung `GenericChemSimulation` |
| **Toán** | Các mô phỏng 2D (SVG) có pan/zoom, overlay công thức KaTeX | `GenericMathSimulation` theo `EXPERIMENTS_CONFIG` |

Các id `SIM-xx` cũ được giữ làm alias để tương thích link/phiên cũ.

---

## 🔌 API

Base URL `http://localhost:3000` (dev). Auth: `Authorization: Bearer <jwt>`. Response bọc `{data,message,statusCode}`.

| Nhóm | Route tiêu biểu |
|---|---|
| **AI** | `POST /ai/analyze`, `POST /ai/chat`, `POST /ai/quiz/generate` |
| **Chat** | `GET/POST /ai/chat/sessions`, `.../messages`, `POST .../generate-experiment`, `.../guidance` |
| **Auth** | `POST /auth/register`, `/auth/login`, `/auth/google/verify`, `GET /auth/google`, `/auth/google/callback` |
| **Users / Gamification** | `GET /users/me`, `/users/me/stats`, `POST /users/me/complete-activity`, `GET /users/leaderboard`, `/users/me/labs` |
| **Lớp học** | `POST /classrooms`, `GET /classrooms/teacher`, `/classrooms/student/me`, `POST /classrooms/join`, `.../assignments`, `.../submit` |
| **Đề thi** | `POST /exams`, `POST /exams/ai-generate`, `GET /exams/:id/questions` |
| **Ngân hàng câu hỏi** | `POST /question-bank/ai-generate`, `POST /question-bank/bulk` (+ CRUD) |
| **Thí nghiệm** | `GET /scene/all`, `POST /scene`, `/scene/import|export/*` |
| **Phân tích** | `GET /analytics/teacher/*`, `GET /classrooms/:id/analytics/*` (+ export xlsx) |
| **Admin** | `GET /admin/stats/*`, `/admin/users`, `/admin/classes`, `/admin/content/*` (duyệt nội dung) |
| **Learning/RAG** | `GET /learning/theory-chunks`, `/learning/theory-chunks/rag/search`, `/learning/simulation-templates` |

Danh sách đầy đủ: xem Swagger `/api` hoặc [specs/api-contracts.md](specs/api-contracts.md).

---

## ☁️ Deploy (Railway)

- Production build bằng **[Dockerfile.railway](Dockerfile.railway)** (backend) và **[Dockerfile.frontend.railway](Dockerfile.frontend.railway)** (frontend) — **build context là gốc repo**.
- Deploy được **trigger khi push nhánh `dev`** (không chỉ `main`).
- PostgreSQL trên Railway đã cài sẵn extension `pgvector`.
- `TypeORM synchronize: true` áp dụng cho **mọi môi trường** → schema tự đồng bộ khi backend khởi động, không cần migration tay.
- ⚠️ Dữ liệu **không** tự đồng bộ giữa local và production — seed/embed ở local không ảnh hưởng production; phải chạy lại nhắm vào production nếu cần.

---

## 🛠 Scripts hữu ích

Trong `src/backend` (xem `package.json`):

| Lệnh | Tác dụng |
|---|---|
| `yarn start:dev` | Chạy backend hot-reload |
| `npm run seed:learning-data` | Seed học liệu vào DB |
| `npm run embed:theory` | Sinh/cập nhật embedding cho `theory_chunks` |
| `npm run eval:rag` / `eval:answer` / `eval:full` | Đánh giá RAG / câu trả lời |
| `npm run backup:theory-embeddings` | Sao lưu/khôi phục embedding |

Trong `src/frontend`: `yarn start` (dev), `yarn build` (build tĩnh).

---

## 🤝 Quy trình đóng góp

Chiến lược nhánh (chi tiết trong [AGENTS.md](AGENTS.md)):

```
main  ← production-ready (merge từ dev)
  └── dev  ← nhánh tích hợp; deploy Railway trigger tại đây
        ├── feature/ASS-XXX-ten-task
        └── fix/ASS-XXX-ten-fix
```

---

## 🗺 Bản đồ tài liệu

Để không phải "mò": bảng dưới cho biết file nào phản ánh **thực tế hiện tại** và file nào là **kế hoạch/lịch sử**.

| Tài liệu | Nội dung | Trạng thái |
|---|---|---|
| [README.md](README.md) | Tổng quan toàn dự án | ✅ Hiện hành |
| [Backend-Ai.md](Backend-Ai.md) | Contract & vận hành AI/RAG | ✅ Hiện hành |
| [DEMO_DAY.md](DEMO_DAY.md) | Mô tả sản phẩm cho Demo Day | ✅ Hiện hành |
| [reports/RAG_METRICS_SCORECARD.md](reports/RAG_METRICS_SCORECARD.md) | Metrics RAG (preview/dev) | ✅ Hiện hành |
| [src/backend/README.md](src/backend/README.md) · [src/frontend/README.md](src/frontend/README.md) | Hướng dẫn từng phần | ✅ Hiện hành |
| [specs/api-contracts.md](specs/api-contracts.md) | Hợp đồng API | ✅ Đã cập nhật theo code |
| [specs/](specs/) (product-vision, features, user-roles, domains...) | Đặc tả sản phẩm | ⚠️ Một phần là **kế hoạch ban đầu**; đã gắn ghi chú khác biệt |
| [adrs/](adrs/) | Quyết định kiến trúc | ⚠️ Có ADR đã **superseded** (ghi rõ trong từng file) |
| [tasks/](tasks/) · [planning/](planning/) | Task ASS-*, sprint, backlog | 🕘 Lịch sử quá trình phát triển |
| [reports/](reports/) (ngoài scorecard) | Log đánh giá RAG tự sinh | 🕘 Dữ liệu quá trình |

> Bối cảnh: dự án khởi động với một stack kế hoạch khác (Fastify/Drizzle/Vite/Claude/SSE...) rồi **chuyển hẳn** sang stack thực tế ở trên trong quá trình phát triển. Một số `specs/` và `adrs/` viết theo kế hoạch cũ đã được cập nhật hoặc gắn nhãn để tránh gây hiểu nhầm.

---

*Dự án học tập trong khuôn khổ AI20K Build — Cohort 2.*
