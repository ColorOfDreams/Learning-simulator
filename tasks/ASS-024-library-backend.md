# ASS-024 — Sample Library — 30 bài mẫu + Filter
**Sprint:** 3  
**Owner:** Backend (B)  
**Status:** Todo  
**Branch:** feature/ASS-024-library-backend

## Mô tả
Seed 30 bài tập mẫu vào database và xây dựng endpoint GET /library với filter theo môn học và chủ đề. Cache kết quả trong Redis để đảm bảo load < 1 giây.

## Acceptance Criteria
- [ ] Seed đủ 30 bài mẫu vào database (ít nhất mỗi môn 5 bài)
- [ ] `GET /library?subject=&topic=` trả đúng danh sách được filter
- [ ] Kết quả được cache Redis; load < 1 giây kể cả lần đầu (cold cache < 2s)

## Ghi chú kỹ thuật
- Seed data: `src/database/seeds/exercises.json` → chạy bằng seed script (theo cấu trúc ADR-003)
- Drizzle ORM query với WHERE filter động cho `subject` và `topic`
- Redis cache key pattern: `library:{subject}:{topic}` (dùng `*` nếu không có filter)
- Response schema: `{ items: [{id, subject, topic, title, thumbnail_url, simulation_id}], total }` — xem `api-contracts.md`
- Invalidate cache khi có seed mới (thêm `--flush-library` flag vào seed script)
