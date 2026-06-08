# ASS-026 — Session History — Lưu & Hiển thị
**Sprint:** 3  
**Owner:** Backend (B)  
**Status:** Todo  
**Branch:** feature/ASS-026-history-backend

## Mô tả
Xây dựng backend lưu và truy vấn lịch sử session của người dùng (tối đa 20 session mới nhất). Timestamps lưu UTC nhưng trả về theo múi giờ Việt Nam (+07:00), persist qua logout/login.

## Acceptance Criteria
- [ ] Lưu tối đa 20 session gần nhất per user (xóa cũ khi vượt quá)
- [ ] `GET /history` trả danh sách session đúng thứ tự mới nhất trước
- [ ] History persist khi logout và login lại
- [ ] Timestamps hiển thị đúng múi giờ Việt Nam (+07:00)

## Ghi chú kỹ thuật
- Drizzle query: `ORDER BY created_at DESC LIMIT 20` từ bảng `sessions` (schema tại ASS-016)
- Timestamps: lưu tất cả dạng UTC trong DB; khi trả response thêm field `created_at_vn` = UTC + 7h (format ISO 8601 với offset `+07:00`)
- Auth: endpoint yêu cầu JWT; guest không có history
- Response schema: `{ sessions: [{id, subject, topic, simulation_id, created_at, created_at_vn, message_count}] }` — xem `api-contracts.md`
- Implement soft delete (không xóa vật lý) — thêm `deleted_at` column để có thể restore
