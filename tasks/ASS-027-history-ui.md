# ASS-027 — Session History UI
**Sprint:** 3  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-027-history-ui

## Mô tả
Xây dựng màn hình lịch sử học tập: hiển thị 20 session gần nhất với thumbnail, timestamp, và môn học. Click vào session sẽ restore lại simulation và context trong < 500ms.

## Acceptance Criteria
- [ ] Hiển thị danh sách 20 session với thumbnail, timestamp (múi giờ VN), và môn học
- [ ] Click session → restore simulation và context < 500ms
- [ ] Empty state khi chưa có session nào

## Ghi chú kỹ thuật
- File: `src/frontend/src/pages/History.tsx` (theo cấu trúc ADR-003)
- Click session → `GET /analyze` với `session_id` để load cached session params (không gọi AI lại)
- TanStack Query `useQuery` cho `GET /history` — xem `api-contracts.md` cho response schema
- Hiển thị timestamp dùng `created_at_vn` từ response (đã có offset +07:00)
- Skeleton loading khi fetch history; error state nếu API fail
