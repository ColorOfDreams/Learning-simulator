# JOURNAL — AI Study Simulator

> Nhật ký hành trình sản phẩm theo tuần. Các mốc dưới đây tổng hợp từ lịch sử git (chỉ liệt kê những gì đã thực sự commit/ship). Dự án MVP, team 3 người. Chi tiết quyết định kỹ thuật: [WORKLOG.md](WORKLOG.md).

## Tổng quan
- **Khởi tạo:** 2026-05-29 (từ starter template Cohort 2) → dựng cấu trúc dự án 2026-06-08.
- **Sản phẩm:** nền tảng học Lý–Hóa–Toán THPT qua mô phỏng tương tác + trợ lý AI RAG, có công cụ giáo viên và gamification. Xem [README.md](README.md).

---

## Tuần 1 (29/5 – 08/6) — Khởi động & khung dự án
- Khởi tạo repo, dựng cấu trúc dự án AI Study Simulator, viết specs/adrs/tasks ban đầu.
- Chốt chiến lược nhánh `feature/* → dev → main`.
- *Đã ship:* bộ tài liệu kế hoạch (specs, ADRs), khung thư mục.

## Tuần 2 (09/6 – 15/6) — Base Web & Backend
- Dựng base **UmiJS Frontend** + **NestJS Backend** (generic CRUD `BaseController`/`useInitModel`), thêm `.env.example`.
- Mock-up module AI learning ở backend; bắt đầu nhánh `thinghiem` (tạo thí nghiệm cơ bản) và `backend-ai`.
- Redesign trang landing/login, bổ sung giao diện chatbot, đăng nhập/đăng ký.

## Tuần 3 (16/6 – 22/6) — Phân quyền, RAG nền & mô phỏng đầu tiên
- Luồng dữ liệu AI theo chương (nhánh `AI-data`); phân quyền FE↔BE; giao diện học sinh.
- Seed & validate learning data; viết tài liệu bàn giao AI ([Backend-Ai.md](Backend-Ai.md)).
- Mô phỏng ném xiên (projectile) tích hợp vào workspace; bộ **AI quiz** linh hoạt + in đề có/không đáp án + chat đa lượt; trang Profile học sinh.

## Tuần 4 (23/6 – 29/6) — RAG runtime, dàn mô phỏng 3D & tích hợp lớn
- **RAG runtime cơ bản hoàn thiện**; tích hợp loạt mô phỏng Vật lý SIM-31→52, nâng cấp lên 3D (Three.js).
- Merge hạ tầng RAG từ nhánh `AI-data` vào `dev`.
- **Deploy Railway** + CI/CD + lab tracking + RAG embedding; seed học sinh mẫu + leaderboard; xử lý corepack/yarn 4 trong CI.
- Refactor mô phỏng Hóa theo module chem10/11/12.

## Tuần 5 (30/6 – 06/7) — Toán, gamification, đề thi & admin
- Thêm mô phỏng Toán lớp 11 & 12 (mỗi khối 11 sim), thay 6 sim Toán 10 cũ bằng 8 sim 2D SVG mới, thêm pan/zoom cho toàn bộ sim Toán.
- **Gamification** nối API thật (XP/level/streak/badge/leaderboard); thumbnail tĩnh; **dark theme** mặc định.
- Chức năng **tạo đề thi**; kết nối trang **admin** với dữ liệu thật + vá lỗ hổng phân quyền.
- Promote dataset RAG đa môn (Lý+Hóa+Toán) thành canonical; chat lab-search đa lượt; harden an toàn + rate-limit cho chat AI; chống sinh câu hỏi trùng.

## Tuần 6 (07/7 – …) — Hoàn thiện & đánh bóng
- XP/streak thật + chỉnh sửa hồ sơ; sửa hiển thị tên app trên Railway (env rỗng); đánh bóng dark mode trang lớp học & tiến độ của học sinh.

---

## Việc còn mở / hướng tiếp theo
- Bật **vector search thật** cho RAG bằng embedding 1536 chiều (hiện lệch chiều nên rơi về keyword fallback) — xem [WORKLOG.md](WORKLOG.md).
- Rà soát/hoàn thiện benchmark RAG trước khi tinh chỉnh retriever ([reports/RAG_METRICS_SCORECARD.md](reports/RAG_METRICS_SCORECARD.md)).
- Mở rộng độ sâu mô phỏng cho các hiện tượng đặc thù (đồ thị, so pha, cộng hưởng).
