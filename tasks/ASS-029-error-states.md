# ASS-029 — Error States & Edge Cases
**Sprint:** 3  
**Owner:** Tech Lead  
**Status:** Todo  
**Branch:** feature/ASS-029-error-states

## Mô tả
Triển khai đầy đủ các error states và xử lý edge cases trong toàn bộ ứng dụng: out-of-scope input, API timeout, parameter clamping, offline banner, và giới hạn guest session. Mục tiêu 0 unhandled exception trong smoke test.

## Acceptance Criteria
- [ ] Out-of-scope: hiển thị message hướng dẫn người dùng nhập lại khi AI không nhận dạng được môn học
- [ ] Timeout: hiển thị thông báo lỗi thân thiện khi API > 30s
- [ ] Param clamp: slider không cho vượt giá trị min/max hợp lệ
- [ ] Offline banner: banner xuất hiện khi mất kết nối internet
- [ ] Guest limit: thông báo và prompt đăng ký khi guest hết 3 session/ngày
- [ ] 0 unhandled exception trong 30 phút smoke test liên tục

## Ghi chú kỹ thuật
- FE: Error Boundary component bọc các route chính (theo cấu trúc ADR-003); offline detection qua `window.addEventListener('offline', ...)`
- BE: Global error handler Fastify (`fastify.setErrorHandler(...)`) — xem `api-contracts.md` cho error response schema
- Param clamp trong mỗi simulation component: `Math.min(Math.max(value, MIN), MAX)` trước khi tính toán
- Smoke test script: chạy lần lượt tất cả happy path + edge case có trong QA checklist (ASS-030)
