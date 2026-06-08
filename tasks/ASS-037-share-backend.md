# ASS-037 — Teacher Share Mode — Shareable URL
**Sprint:** 4  
**Owner:** Backend (B)  
**Status:** Todo  
**Branch:** feature/ASS-037-share-backend

## Mô tả
Xây dựng tính năng tạo public shareable URL cho session, cho phép giáo viên chia sẻ simulation với học sinh qua link. Guest access vào share link không được thấy lịch sử cá nhân.

## Acceptance Criteria
- [ ] `POST /sessions/:id/share` trả về public shareable link thành công
- [ ] Guest truy cập share link chỉ thấy simulation và explanation, không thấy history

## Ghi chú kỹ thuật
- Bảng mới `shares`: `id` (uuid), `session_id` (uuid FK), `token` (varchar 10, nanoid, unique), `created_at` (timestamp UTC) — theo cấu trúc ADR-003
- Dùng `nanoid(10)` để sinh token ngắn nhưng đủ entropy (~1B unique values)
- `GET /share/:token` — public endpoint (không cần auth); trả simulation config + explanation nhưng không trả user_id/history
- Token expires: không hết hạn ở v1 (để đơn giản); plan cho v2: thêm `expires_at` column
- Response `POST /sessions/:id/share`: `{ share_url: "https://app.domain/share/{token}" }` — xem `api-contracts.md`
