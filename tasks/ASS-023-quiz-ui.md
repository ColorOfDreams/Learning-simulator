# ASS-023 — Quiz UI — MCQ Screen & Results
**Sprint:** 3  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-023-quiz-ui

## Mô tả
Xây dựng giao diện Quiz: màn hình câu hỏi MCQ với highlight đúng/sai tức thì sau khi submit, màn hình kết quả với điểm số và gợi ý học thêm, và nút "Xem lại mô phỏng" không mất state simulation.

## Acceptance Criteria
- [ ] Highlight đáp án đúng (xanh) và sai (đỏ) ngay tức thì sau khi chọn
- [ ] Màn hình kết quả hiển thị điểm số và gợi ý ôn tập dựa trên câu sai
- [ ] Nút "Xem lại mô phỏng" đưa người dùng về simulation mà không reset state

## Ghi chú kỹ thuật
- File: `src/frontend/src/pages/Quiz.tsx` (theo cấu trúc ADR-003)
- Simulation state persist trong React Context (không unmount `<SimulationScreen />` khi chuyển sang Quiz)
- API calls qua TanStack Query — endpoints `POST /quiz/generate` và `POST /quiz/answer` theo `api-contracts.md`
- Dùng React Router với `<Outlet />` hoặc tab navigation để giữ simulation mount
- Animation highlight: Tailwind transition `bg-green-100`/`bg-red-100` với duration 300ms
