# AGENTS.md — AI Study Simulator
> **Dành cho AI Agents:** Đọc file này để hiểu vai trò, quy tắc làm việc và chiến lược nhánh của team.

> [!IMPORTANT]
> **Nguồn sự thật về sản phẩm/kỹ thuật hiện hành là [README.md](README.md)** (kèm [Backend-Ai.md](Backend-Ai.md) cho AI/RAG, [specs/api-contracts.md](specs/api-contracts.md) cho API), **không phải file này**.
> File AGENTS.md được viết ở giai đoạn kế hoạch ban đầu: các phần mô tả **tech stack, kiến trúc và API** bên dưới (Fastify, Redis, SSE, Vercel, Claude, `/analyze`, `/explain`, `/api/v1`...) **đã lỗi thời** — stack thực tế là NestJS + TypeORM + PostgreSQL/pgvector + UmiJS/React 19 + Three.js + Mistral, deploy Railway. Phần **chiến lược nhánh, quy tắc commit và phân vai trò** vẫn còn giá trị tham khảo.

---

## 1. THÔNG TIN DỰ ÁN

```
Dự án   : AI Study Simulator
Mô tả   : Nền tảng học khoa học tự nhiên qua mô phỏng tương tác + AI giải thích
Team    : 3 người — 4 tuần — MVP launch
Workflow: Vibe Coding Blueprint (Spec-driven · Contract-first · Sprint 1 tuần)
Repo    : Single source of truth — mọi context đều trong repo này
```

---

## 1b. QUY TẮC NHÁNH (BRANCH STRATEGY)

```
main  ← production-ready. CHỈ merge từ dev. Tech Lead approve.
  └── dev  ← integration branch. Mọi feature merge vào đây.
        ├── feature/ASS-XXX-ten-task   (mỗi task = 1 branch)
        └── fix/ASS-XXX-ten-fix        (hotfix tương tự)
```

**Tạo branch mới:**
```bash
git checkout dev && git pull origin dev
git checkout -b feature/ASS-XXX-ten-task
```

**Khi xong task:** tạo PR → `dev` (KHÔNG phải `main`)

---

## 2. VAI TRÒ & DOMAIN CỦA TỪNG THÀNH VIÊN

> **Quy tắc cho AI:** Khi được giao task, chỉ đọc và chỉnh sửa file trong domain của người dùng hiện tại. Không tự ý thay đổi code hoặc spec của domain khác.

### 🔵 Tech Lead (Trưởng nhóm — Fullstack)
**Domain:** Kiến trúc hệ thống, AI pipeline, integration, deploy, review PR cuối.

**Sở hữu các thư mục/file:**
- `/specs/` — toàn bộ
- `/adrs/` — toàn bộ
- `/planning/` — toàn bộ
- `/src/ai-service/` — AI pipeline, prompt templates
- `/src/api-gateway/` — routing, middleware
- `AGENTS.md`, `README.md`

**Trách nhiệm:**
- Thiết lập và cập nhật Specs, ADRs, API Contracts
- Viết và tối ưu prompt templates cho LLM
- Kết nối Frontend ↔ Backend (integration layer)
- Review PR cuối — người duy nhất có quyền approve merge vào `dev` và `main`
- Giải quyết blocker trong vòng 2–4 giờ
- Chạy security audit, load test, production deploy

**KHÔNG làm:** Code thay Frontend hoặc Backend khi họ không bị blocker.

---

### 🟢 Thành viên A — Frontend Dev
**Domain:** React UI, Simulation Engine, UX/responsive.

**Sở hữu các thư mục/file:**
- `/src/frontend/` — toàn bộ
- `/src/simulations/` — simulation templates (D3/Canvas)

**Trách nhiệm:**
- Build toàn bộ React UI theo Figma spec và `/specs/features.md`
- Build Simulation Engine: 10 templates (Lý/Hóa/Toán)
- KaTeX math rendering, responsive ≥ 768px
- Xử lý SSE streaming trên FE (EventSource + React Query)
- Performance: ≥ 30 FPS cho simulation, re-render ≤ 300ms

**Đọc trước khi code:**
- `/specs/features.md` — danh sách tính năng
- `/adrs/0003-folder-structure.md` — cấu trúc thư mục FE
- `/adrs/0004-conventions.md` — coding convention
- `/specs/api-contracts.md` — API contract để mock

**KHÔNG làm:** Thay đổi BE code, DB schema, hoặc API logic.

---

### 🟣 Thành viên B — Backend Dev
**Domain:** Fastify API, Database, Auth, CI/CD.

**Sở hữu các thư mục/file:**
- `/src/backend/` — toàn bộ
- `/src/database/` — migrations, seeds
- `.github/workflows/` — CI/CD pipelines

**Trách nhiệm:**
- Fastify API endpoints theo `/specs/api-contracts.md`
- PostgreSQL schema + migrations, Redis cache
- Auth: Email/Password + Google OAuth 2.0 + Guest mode
- SSE streaming cho AI explanation
- CI/CD: GitHub Actions → staging (Vercel FE, Railway BE)
- Analytics (PostHog), Error monitoring (Sentry)

**Đọc trước khi code:**
- `/specs/api-contracts.md` — schema request/response
- `/adrs/0001-architecture.md` — kiến trúc hệ thống
- `/adrs/0002-tech-stack.md` — tech stack đã chọn
- `/adrs/0004-conventions.md` — coding convention

**KHÔNG làm:** Thay đổi FE code, simulation logic, hoặc Figma spec.

---

## 3. QUY TẮC BẮT BUỘC CHO AI AGENTS

> Đây là các nguyên tắc từ Vibe Coding Blueprint. Vi phạm bất kỳ quy tắc nào sẽ gây ra code conflict, kiến trúc lệch hướng, hoặc mất thời gian review.

### ① SPEC-DRIVEN — Không code trước khi có Spec
- Trước khi viết bất kỳ dòng code nào, đọc file Spec tương ứng trong `/specs/`.
- Nếu Spec chưa rõ → DỪNG LẠI, tạo issue "Spec Clarification" → chờ Tech Lead phản hồi.
- **Không tự đoán business logic.**

### ② ADR LÀ NỀN TẢNG — Không tự sáng tạo kiến trúc
- Mọi quyết định về tech stack, folder structure, naming convention đều đã có trong `/adrs/`.
- Đọc ADR trước khi tạo file hoặc folder mới.
- Nếu cần thay đổi kiến trúc → tạo ADR mới, không tự đổi.

### ③ CONTRACT FIRST — Giao tiếp qua API Contract
- FE và BE giao tiếp DUY NHẤT qua `/specs/api-contracts.md`.
- FE mock API từ contract. BE implement đúng contract.
- Nếu contract cần thay đổi → tạo PR riêng, tag Tech Lead review.

### ④ TASK ĐỦ LỚN — AI tự chia subtask
- Tech Lead giao task ở cấp Feature (ASS-XXX).
- AI Agent tự lập kế hoạch và chia nhỏ thành subtask kỹ thuật.
- Không cần chờ người dùng chia từng hàm nhỏ.

### ⑤ COMMIT THƯỜNG XUYÊN — Không commit cục
```
Format: <type>(<scope>): <mô tả ngắn>

Ví dụ:
feat(sim): add Newton F=ma simulation template
fix(ai): handle LLM timeout > 10s with fallback response
docs(adr): add ADR-004 coding conventions
test(auth): add unit tests for Google OAuth flow
chore(ci): add staging auto-deploy step
```

### ⑥ DEFINITION OF DONE — Chỉ báo Done khi đủ chuẩn
Task chỉ được coi là Done khi TẤT CẢ điều kiện sau đều đúng:
- [ ] Code implement đúng Spec trong `/tasks/ASS-XXX.md`
- [ ] Unit test viết xong và pass (không có test đỏ)
- [ ] ESLint + Prettier: không còn lỗi nào
- [ ] `/specs/api-contracts.md` hoặc Spec liên quan đã cập nhật (nếu có thay đổi)
- [ ] Pull Request đã được tạo và linked với task ID
- [ ] CI/CD pipeline: tất cả checks green
- [ ] Ít nhất 1 thành viên khác đã Approved PR

> ⚠️ **Done không phải là "code chạy được trên máy mình."**
> **Done là đủ chuẩn chất lượng để merge vào `main` mà không sợ break production.**

---

## 4. LUỒNG THỰC THI MỖI NGÀY (6 BƯỚC)

```
Bước 1: PICK TASK
  → Lấy task từ Sprint board (file /planning/sprints/sprint-XX.md)
  → Đọc file task: /tasks/ASS-XXX-ten-task.md
  → Đọc Spec + ADR + Contract liên quan
  → Checkout từ dev: git checkout dev && git pull origin dev
  → Tạo branch: git checkout -b feature/ASS-XXX-ten-task

Bước 2: AI + DEV CODE
  → Cung cấp đủ context cho AI: Spec + ADR + Contract + task file
  → Để AI tự lập kế hoạch và chia subtask kỹ thuật
  → Commit thường xuyên, message rõ nghĩa

Bước 3: SELF TEST
  → Chạy unit test: npm test (hoặc vitest / pytest)
  → Kiểm tra từng AC trong file task
  → ESLint + Prettier: npm run lint && npm run format

Bước 4: PR & REVIEW
  → Tạo Pull Request, title format: [ASS-XXX] Tên task
  → Link task ID trong PR description
  → CI/CD tự chạy — chờ green
  → Tag reviewer (thành viên khác + Tech Lead cho final)

Bước 5: MERGE
  → Sau khi đủ Approved + CI green → merge feature vào dev
  → Tech Lead review dev định kỳ → merge dev vào main khi đủ stable
  → Deploy tự động lên staging (từ dev) và production (từ main)

Bước 6: UPDATE DOCS
  → Đổi trạng thái task trong /tasks/ASS-XXX.md → Status: Done
  → Cập nhật Spec/Contract nếu có thay đổi trong quá trình code
```

---

## 5. PHÂN CÔNG TASK THEO SPRINT

### Sprint 1 — Foundation & Setup (Tuần 1)
**Mục tiêu:** Chốt toàn bộ Context (Specs, ADRs, Contracts) trước khi code. POC LLM và Simulation library. Setup repo và CI/CD.

**Go/No-Go cuối tuần 1:**
- LLM POC đạt ≥ 80% accuracy trên 20 bài test tiếng Việt
- Simulation POC đạt ≥ 30 FPS trên máy tham chiếu
- Repo cấu trúc đầy đủ, CI/CD chạy được, staging deploy thành công
- API Contracts được chốt — FE và BE sẵn sàng chạy song song tuần 2

| Task ID | Công việc | Owner | Acceptance Criteria |
|---------|-----------|-------|---------------------|
| ASS-001 | Khởi tạo Repo & Cấu trúc Context Base | Tech Lead | Clone → chạy được; cấu trúc đúng blueprint (`/specs`, `/adrs`, `/planning`, `/tasks`, `/src`, `AGENTS.md`, `README.md`) |
| ASS-002 | Viết Specs & Domains | Tech Lead | FE + BE đọc và không có câu hỏi về phạm vi; bao gồm `product-vision.md`, `domains.md`, `user-roles.md`, `features.md` |
| ASS-003 | POC LLM — Phân tích bài tập tiếng Việt | Tech Lead | ≥ 80% accuracy trên 20 bài test; có báo cáo so sánh Claude Haiku vs GPT-4o-mini vs Gemini Flash |
| ASS-004 | ADR: Architecture, Tech Stack, Folder Structure, Conventions | Tech Lead | AI Agent đọc ADR và code đúng convention; bao gồm 5 file: `0001` đến `0005` |
| ASS-005 | API Contracts — Tất cả endpoint MVP | Tech Lead | FE mock được API từ contract; BE implement đúng spec; bao gồm `/analyze`, `/explain` (SSE), `/quiz/generate`, Auth endpoints |
| ASS-006 | POC Simulation Engine — D3 vs Canvas | Frontend (A) | Report so sánh FPS + DX + bundle size; quyết định library gửi Lead review |
| ASS-007 | Setup Frontend Boilerplate | Frontend (A) | `npm run dev` chạy được; lint pass; CI build green; folder structure đúng ADR-003 |
| ASS-008 | Setup Backend Boilerplate | Backend (B) | Server chạy; `/healthcheck` trả 200; kết nối PostgreSQL + Redis thành công |
| ASS-009 | CI/CD Pipeline & Staging Deploy | Backend (B) | Push vào `main` → tự động deploy staging trong < 5 phút |
| ASS-010 | 30 bài tập mẫu (draft) — Tất cả 3 môn | Cả nhóm | 30 bài format JSON `{id, subject, topic, text, parameters[]}`; review chéo; không trùng chủ đề |

---

### Sprint 2 — Core Learning Loop (Tuần 2)
**Mục tiêu:** End-to-end flow hoạt động: nhập bài → AI phân tích → 5 simulation đầu → AI explanation streaming.

**Go/No-Go cuối tuần 2:**
- Full flow: Input → Extract → Sim → Explain (5 simulation đầu)
- AI explanation SSE streaming không bị timeout
- 3 QA tester nội bộ hoàn thành flow không cần hướng dẫn
- P95 latency < 10 giây trên staging

| Task ID | Công việc | Owner | Acceptance Criteria |
|---------|-----------|-------|---------------------|
| ASS-011 | AI Pipeline — Input → Extract → Simulation Config | Tech Lead | ≥ 85% accuracy trên test set 50 bài; `POST /analyze` trả JSON `{subject, topic, parameters[], confidence, simulation_id}` |
| ASS-012 | Simulation Templates — Vật lý (3 sim) | Frontend (A) | Chuyển động thẳng, Ném xiên, Newton F=ma; sai số ≤ 5%; FPS ≥ 30; slider + Play/Pause/Reset |
| ASS-013 | Simulation Templates — Toán (2 sim) | Frontend (A) | Đồ thị bậc 2, Hàm lượng giác; cập nhật ≤ 300ms; KaTeX render đúng |
| ASS-014 | UI: Input Screen + Simulation Screen | Frontend (A) | Figma spec match ≥ 90%; không layout shift; responsive tablet; loading skeleton + error states |
| ASS-015 | AI Explanation — SSE Streaming | Backend (B) | Stream không ngắt; 4-layer prompt: Hiện tượng → Công thức → Áp dụng → Thử nghiệm; follow-up nhớ context |
| ASS-016 | Session Management & Database Schema | Backend (B) | Tables: `sessions`, `messages`, `user_answers`; Redis cache TTL 24h; cache hit giảm LLM call ≥ 30% |
| ASS-017 | Integration: Frontend ↔ Backend (Core Flow) | Tech Lead | Full flow chạy trên staging; không console error; SSE xử lý đúng bằng EventSource |
| ASS-018 | Auth: Email + Google OAuth | Backend (B) | Login flow < 3 bước; JWT + refresh token 30 ngày; Guest mode 3 session/ngày |

---

### Sprint 3 — Complete MVP Features (Tuần 3)
**Mục tiêu:** Hoàn thành tất cả feature trong MVP scope: 10 simulation, quiz, library, history, responsive.

**Go/No-Go cuối tuần 3:**
- Tất cả 10 simulation pass QA checklist (không crash, sai số ≤ 5%)
- Quiz tạo MCQ trong < 5 giây
- Sample library hiển thị 30 bài, filter đúng theo môn
- Mobile responsive trên ≥ 768px

| Task ID | Công việc | Owner | Acceptance Criteria |
|---------|-----------|-------|---------------------|
| ASS-019 | Simulation Templates — Vật lý (2 sim còn lại) | Frontend (A) | Mạch điện R nối tiếp/song song, Con lắc đơn; pass unit test; sai số ≤ 5% |
| ASS-020 | Simulation Templates — Hóa học (2 sim) | Frontend (A) | Axit-bazơ (pH chart, đổi màu), Oxi hóa khử (electron flow); có disclaimer "mô phỏng khái niệm" |
| ASS-021 | Simulation Template — Toán: Hình học | Frontend (A) | Tam giác & đường tròn tương tác; diện tích/chu vi cập nhật real-time |
| ASS-022 | Quiz Module — MCQ Generation & Feedback | Backend (B) | `POST /quiz/generate` trả 3–5 MCQ trong ≤ 5s; độ khó tăng dần; `POST /quiz/answer` lưu kết quả |
| ASS-023 | Quiz UI — MCQ Screen & Results | Frontend (A) | Highlight đúng/sai tức thì; màn hình kết quả + gợi ý; "Xem lại mô phỏng" không mất state |
| ASS-024 | Sample Library — 30 bài mẫu + Filter | Backend (B) | Seed 30 bài; `GET /library?subject=&topic=`; cache Redis; load < 1 giây |
| ASS-025 | Sample Library UI | Frontend (A) | Grid card layout; filter + search; click → load simulation; thumbnail preview |
| ASS-026 | Session History — Lưu & Hiển thị | Backend (B) | Lưu 20 session/user; `GET /history`; persist qua logout/login; timezone Việt Nam |
| ASS-027 | Session History UI | Frontend (A) | List 20 session; thumbnail + timestamp + môn; restore session < 500ms |
| ASS-028 | Mobile Responsive — Toàn bộ app | Frontend (A) | Tất cả màn hình responsive ≥ 768px; touch-friendly sliders |
| ASS-029 | Error States & Edge Cases | Tech Lead | Implement: out-of-scope, timeout, param clamp, offline banner, guest limit; 0 unhandled exception trong 30 phút smoke test |
| ASS-030 | QA — Full Feature Checklist | Cả nhóm | Mỗi người test chéo 1/3 feature list; báo bug vào GitHub Issues với repro steps; 0 P0 bug |

---

### Sprint 4 — Beta, Polish & Launch (Tuần 4)
**Mục tiêu:** Bug fix từ beta, performance tuning, analytics, soft launch. Không thêm feature mới.

**Launch Criteria — Go/No-Go:**
- AI extraction accuracy ≥ 85% trên test set 50 bài
- Tất cả 10 simulation pass QA checklist
- P95 latency < 8 giây (50 concurrent users)
- 0 critical security vulnerability (OWASP Top 10)
- Beta NPS ≥ 30 (20 học sinh + 5 giáo viên)
- ≥ 4/6 học sinh beta nói "hiểu bài tốt hơn so với chỉ đọc lời giải"

| Task ID | Công việc | Owner | Acceptance Criteria |
|---------|-----------|-------|---------------------|
| ASS-031 | Closed Beta — 20 học sinh + 5 giáo viên | Tech Lead | ≥ 20 user hoàn thành ít nhất 1 full flow; thu NPS + feedback |
| ASS-032 | Bug Fixes từ Beta (P0 → P1) | Cả nhóm | 0 P0 bug còn mở khi launch |
| ASS-033 | Performance Tuning — AI Pipeline | Tech Lead | P95 < 8 giây; không OOM; load test 50 concurrent users bằng Locust |
| ASS-034 | Performance Tuning — Simulation FPS | Frontend (A) | FPS ≥ 30 trên i5 Gen 10 / 8GB RAM; optimize useMemo + debounce |
| ASS-035 | Analytics Setup — PostHog Funnels | Backend (B) | Track 6 events; funnel dashboard đúng trong 5 phút |
| ASS-036 | Sentry Error Monitoring | Backend (B) | Alert Slack khi error rate > 1%; test error → alert < 2 phút |
| ASS-037 | Teacher Share Mode — Shareable URL | Backend (B) | `POST /sessions/:id/share` → public link; guest không thấy history |
| ASS-038 | Teacher Share Mode — UI | Frontend (A) | Nút "Chia sẻ"; copy link + QR code; QR scan ra đúng URL |
| ASS-039 | Security Audit — OWASP Top 10 | Tech Lead | SAST scan pass; 0 critical; medium items có mitigation plan |
| ASS-040 | Soft Launch — Deploy Production | Tech Lead | App live; uptime ≥ 99.5% trong 24h đầu |
| ASS-041 | Sprint Retro & Retrospective Doc | Cả nhóm | Viết `/docs/retro-sprint4.md`; backlog v1.1 cập nhật |

---

## 6. MA TRẬN RACI

> R = Responsible · A = Accountable · C = Consulted · I = Informed

| Hoạt động | Tech Lead | Frontend (A) | Backend (B) |
|-----------|-----------|--------------|-------------|
| Viết & cập nhật Specs, ADRs | **R / A** | C | C |
| Thiết kế API Contracts | **R / A** | C | C |
| Sprint Planning & Backlog | **R / A** | C | C |
| AI Pipeline & Prompt Engineering | **R / A** | I | I |
| Kiến trúc hệ thống | **R / A** | C | C |
| Simulation Engine (D3/Canvas) | I | **R / A** | I |
| React UI & Responsive | C | **R / A** | I |
| KaTeX Math Rendering | I | **R / A** | I |
| Fastify API & Database | C | I | **R / A** |
| Redis Cache & Rate Limiting | I | I | **R / A** |
| Auth & Session Management | C | I | **R / A** |
| SSE Streaming | C | I | **R / A** |
| CI/CD & DevOps | A | I | **R** |
| PR Review (final approve) | **A** | R (review BE) | R (review FE) |
| QA & Bug Triage | A | R (FE bugs) | R (BE bugs) |
| Beta User Management | **R / A** | I | I |
| Performance Tuning | R (AI/BE side) | R (FE side) | R (DB side) |
| Security Audit | **R / A** | C | C |
| Production Deploy | **R / A** | I | I |

---

## 7. GIT WORKFLOW

### Branch Strategy
```
main              → Luôn ổn định. Chỉ merge qua PR. Không push trực tiếp.
feature/ASS-XXX-* → Mỗi task lớn = 1 branch. VD: feature/ASS-011-ai-pipeline
hotfix/*          → Sửa lỗi khẩn production. Chỉ Tech Lead tạo.
release/v*        → Chuẩn bị launch. Chỉ Tech Lead tạo.
```

### Pull Request Rules
- Title format: `[ASS-XXX] Tên task`
- Mô tả: link task file + tóm tắt thay đổi + screenshot nếu có UI
- Ít nhất 1 Approved trước khi merge
- CI/CD phải green trước khi merge
- Tech Lead approve final trước khi merge vào `main`

### Commit Convention
```
feat(scope)  : tính năng mới
fix(scope)   : sửa bug
docs(scope)  : cập nhật tài liệu
test(scope)  : thêm/sửa test
chore(scope) : CI, config, tooling
refactor(scope): refactor không đổi behavior

Ví dụ:
feat(sim): add Newton F=ma simulation template
fix(ai): handle LLM timeout > 10s with fallback
docs(adr): add ADR-004 coding conventions
test(auth): add unit tests for Google OAuth flow
chore(ci): add staging auto-deploy step
```

---

## 8. HỌP ĐỊNH KỲ

| Cuộc họp | Tần suất | Thời lượng | Nội dung |
|----------|----------|------------|----------|
| Sprint Planning | Đầu mỗi tuần | 30 phút | Tech Lead dẫn: review backlog, phân task, chốt goal tuần, cập nhật sprint file |
| Daily Sync | Mỗi ngày | 10–15 phút | 3 câu: Hôm qua làm gì? Hôm nay làm gì? Có blocker không? (Async Slack nếu không cần gặp) |
| PR Review | Khi có PR | Tùy | Đọc code + Spec + Contract; comment cụ thể; Tech Lead approve final |
| Sprint Retro | Cuối mỗi tuần | 20 phút | Làm tốt gì? Cần cải thiện gì? Cập nhật quy trình nếu cần |

---

## 9. XỬ LÝ BLOCKER

| Tình huống | Hành động | Thời hạn | Escalate |
|-----------|-----------|----------|---------|
| Bị stuck > 2 tiếng | Post vào Slack `#blockers`: mô tả vấn đề + đã thử gì. Không im lặng. | Trong ngày | Tech Lead |
| LLM trả kết quả sai liên tục | Kiểm tra `/specs` và `/adrs` — 90% do context chưa đủ. Update prompt. | 1 ngày | Tech Lead |
| API Contract không rõ | Không tự đoán. Tạo issue "Contract Clarification" → chờ Tech Lead quyết định. | 2 giờ | Tech Lead |
| Merge conflict phức tạp | Không tự resolve nếu không chắc. Gọi Tech Lead pair resolve. | Trong ngày | Tech Lead |
| Task estimate sai > 50% | Báo sớm trong Daily Sync. Tech Lead re-estimate và điều chỉnh sprint. | Daily Sync gần nhất | Tech Lead |
| CI/CD fail không rõ nguyên nhân | Tag `@backend` trong Slack. Check logs Railway/Vercel trước. | 4 giờ | Thành viên B |

---

## 10. CẤU TRÚC THƯ MỤC REPO

```
/
├── specs/
│   ├── product-vision.md       # Tầm nhìn sản phẩm & bài toán cốt lõi
│   ├── domains.md              # Phân chia domain/service
│   ├── user-roles.md           # Vai trò người dùng & phân quyền
│   ├── features.md             # Mô tả chi tiết tính năng MVP
│   └── api-contracts.md        # API Contract FE ↔ BE (Single Source of Truth)
├── adrs/
│   ├── 0001-architecture.md    # Kiến trúc hệ thống tổng thể
│   ├── 0002-tech-stack.md      # Tech stack đã chọn & lý do
│   ├── 0003-folder-structure.md# Quy ước cấu trúc thư mục code
│   ├── 0004-conventions.md     # Coding convention, naming, commit
│   └── 0005-dod.md             # Definition of Done
├── planning/
│   ├── backlog.md              # Product backlog
│   └── sprints/
│       ├── sprint-01.md        # Goal + task list sprint 1
│       ├── sprint-02.md
│       ├── sprint-03.md
│       └── sprint-04.md
├── tasks/
│   ├── ASS-001-repo-setup.md
│   ├── ASS-002-specs.md
│   └── ...                     # 1 file per task
├── src/
│   ├── frontend/               # React + Vite + TypeScript (Owner: A)
│   ├── simulations/            # Simulation templates (Owner: A)
│   ├── backend/                # Fastify + TypeScript (Owner: B)
│   ├── database/               # Migrations + seeds (Owner: B)
│   └── ai-service/             # AI pipeline + prompts (Owner: Tech Lead)
├── docs/
│   └── retro-sprint4.md
├── AGENTS.md                   # ← File này — đọc đầu tiên
└── README.md
```

---

## 11. THÔNG TIN KỸ THUẬT NHANH

### Tech Stack
```
Frontend : React 19 + TypeScript + UmiJS v4 (@umijs/max) + Ant Design + Less
Simulation: D3.js + Canvas API (quyết định sau ASS-006 POC)
Math     : KaTeX (inline LaTeX rendering)
State    : @umijs/plugin-model (built-in data flow)

Backend  : NestJS 11 + TypeScript + Node.js
Database : PostgreSQL (TypeORM) + Redis (cache + rate limit)
Auth     : Passport (JWT + Google OAuth 2.0)
Streaming: Server-Sent Events (SSE)
Queue    : BullMQ + Redis

AI       : Claude API (Haiku/Sonnet — quyết định sau ASS-003 POC)
           Fallback: GPT-4o-mini hoặc Gemini Flash

Infra    : Vercel (FE) + Railway (BE) + Cloudflare R2 (assets)
CI/CD    : GitHub Actions
Monitoring: Sentry (errors) + PostHog (analytics)
```

### API Endpoints (tóm tắt)
```
POST /api/v1/analyze          → Phân tích bài tập, trả simulation config
POST /api/v1/explain          → SSE stream AI explanation
POST /api/v1/quiz/generate    → Tạo MCQ
POST /api/v1/quiz/answer      → Lưu kết quả trả lời
GET  /api/v1/library          → Danh sách bài mẫu (filter: subject, topic)
GET  /api/v1/history          → Lịch sử session của user
POST /api/v1/sessions/:id/share → Tạo shareable URL
POST /api/v1/auth/register    → Đăng ký email
POST /api/v1/auth/login       → Đăng nhập
POST /api/v1/auth/google      → Google OAuth
```
> Chi tiết đầy đủ xem: `/specs/api-contracts.md`

---

*"AI không thay thế team. AI khuếch đại cách team làm việc."*
*— Vibe Coding Blueprint*

### ? TYPESCRIPT GUIDELINES - Tuy?t d?i kh�ng t�y ti?n �p ki?u
- TUY?T �?I KH�NG d�ng `as any` d? vu?t qua l?i TypeScript. Ph?i khai b�o d�ng ki?u d? li?u (Interface / Type) ho?c c?u tr�c l?i code.
- �?i v?i `useModel` trong UmiJS, d?m b?o t�n model truy?n v�o kh?p ch�nh x�c v?i t�n file trong thu m?c `models/` d? du?c auto-infer ki?u d? li?u.
