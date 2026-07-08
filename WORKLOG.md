# WORKLOG — AI Study Simulator

> Nhật ký quyết định kỹ thuật & thay đổi hướng đi. Tổng hợp từ lịch sử git và mã nguồn thực tế (không suy diễn). Xem tổng quan dự án ở [README.md](README.md).

Các nhánh chính trong quá trình làm: `dev` (tích hợp) · `AI-data` (backend RAG/AI) · `thinghiem` (mô phỏng thí nghiệm) · `feature/ASS-020-sim-chemistry` · `backend-ai` · `BaseFeBe`.

---

## Các quyết định kỹ thuật quan trọng

### 1. Đổi toàn bộ stack so với kế hoạch ban đầu
- **Bối cảnh:** ADR/specs ban đầu dự kiến Fastify + Drizzle + Vite + Tailwind + Claude/Anthropic SDK + SSE + Vercel + Redis.
- **Quyết định (đã ship):** Backend **NestJS 11 + TypeORM**, Frontend **UmiJS `@umijs/max` + React 19 + Ant Design v5**, AI dùng **Mistral**, deploy **Railway**. Không dùng Redis/SSE.
- **Lý do:** tận dụng base code Web/Backend sẵn có (`BaseFeBe`, `feat/Base Web & Backend` — 2026-06-11) với generic CRUD `BaseController`/`useInitModel`, rút ngắn thời gian dựng khung; NestJS module hóa hợp với nhiều domain (auth, lớp học, đề thi, AI...).

### 2. Trợ lý AI theo kiến trúc Hybrid RAG
- **Quyết định:** truy hồi **vector (pgvector) + keyword fallback** → rerank top-5 trên `theory_chunks`, rồi đưa vào LLM. Cache embedding theo `content_hash` để `embed:theory` chỉ nhúng lại chunk thay đổi.
- **Lý do:** giữ hệ thống **không fail** khi thiếu API key / lỗi LLM / lỗi vector (luôn có keyword fallback), và bám học liệu SGK Việt Nam.
- **Hạn chế đã biết:** embedding Mistral 1024 chiều **lệch** với cột `vector(1536)` → nhiều truy vấn rơi về keyword fallback; muốn bật vector thật cần embedding 1536 chiều (OpenAI-compatible). Chi tiết: [Backend-Ai.md](Backend-Ai.md), số liệu: [reports/RAG_METRICS_SCORECARD.md](reports/RAG_METRICS_SCORECARD.md).

### 3. Envelope response & bỏ prefix `/api/v1`
- **Quyết định:** mọi response bọc `{data, message, statusCode}` qua `ResponseInterceptor`; route AI là `/ai/...`, không dùng `/api/v1`; Swagger đặt ở `/api`.
- **Ảnh hưởng:** frontend phải unwrap `response.data` (đôi khi double-wrap `res.data.data` do Umi axios) — đã gây vài bug filter/crash (fix 2026-07-02).

### 4. Mô phỏng: Three.js 3D + SVG 2D thay cho D3/Canvas
- **Quyết định:** Vật lý/Hóa dùng **Three.js** (`@react-three/fiber`/`drei`/`rapier`) nâng cấp lên 3D (SIM-31→52); Toán dùng **SVG 2D có pan/zoom** + overlay công thức KaTeX. Hóa gom về `GenericChemSimulation`, Toán về `GenericMathSimulation` + registry map id.
- **Lý do:** tái sử dụng chung một pattern, dễ thêm thí nghiệm (chỉ cập nhật component + registry + metadata AI).

### 5. Thumbnail tĩnh thay cho render phía client
- **Quyết định (2026-07-03):** sinh **ảnh thumbnail tĩnh** cho mô phỏng thay vì render client-side.
- **Lý do:** giảm tải trang danh sách/Home của học sinh, tránh khởi tạo nhiều canvas 3D cùng lúc.

### 6. Gamification dùng dữ liệu thật
- **Quyết định:** XP theo độ khó bài, level `floor(sqrt(xp/100))+1`, streak theo ngày, badge & leaderboard — nối API thật (`/users/me/stats`, `/complete-activity`, `/leaderboard`, `/me/labs`) thay cho giá trị hardcode (2026-07-02 → 07-08).

### 7. Deploy Railway (không Vercel)
- **Quyết định:** build bằng `Dockerfile.railway` + `Dockerfile.frontend.railway` ở **gốc repo**; deploy trigger khi push nhánh `dev`; `TypeORM synchronize:true` cho mọi môi trường.
- **Vấn đề đã xử lý:** nhiều lần vá build frontend trên Railway (env `APP_CONFIG_*` rỗng gây ReferenceError/màn trắng, cache Umi, heap Node 4GB, `@import url()` remote). Context build nặng (~2.5GB) do không có `.dockerignore`.

### 8. An toàn & rate-limit cho chat AI
- **Quyết định (2026-07-05):** thêm guard an toàn + rate-limit (`@nestjs/throttler`) cho lab chat; chống AI sinh câu hỏi trùng trong ngân hàng câu hỏi/đề thi.

---

## Bug/sự cố đáng chú ý (đã fix)
- Sim gợi ý sai do `SIM_CATALOG` không khớp key `_3D` → fallback nhầm lò xo (2026-06-17).
- Double-wrap `res.data.data` làm crash trang Profile (2026-07-02).
- Lỗ hổng phân quyền trang admin — vá khi kết nối dữ liệu thật (2026-07-04).
- 403 spam ở trang Home học sinh + sai mã lỗi (2026-07-05).
