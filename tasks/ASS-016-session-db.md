# ASS-016 — Session Management & Database Schema
**Sprint:** 2  
**Owner:** Backend (B)  
**Status:** Todo  
**Branch:** feature/ASS-016-session-db

## Mô tả
Thiết kế và triển khai database schema cho session, messages, và user_answers. Cấu hình Redis cache để giảm LLM calls lặp lại. Đảm bảo migration chạy được trên môi trường staging và production.

## Acceptance Criteria
- [ ] Tạo đủ 3 tables: `sessions`, `messages`, `user_answers`
- [ ] Redis cache session data với TTL 24h
- [ ] Cache hit giảm LLM call ≥ 30% (đo bằng log đếm cache hit/miss)

## Ghi chú kỹ thuật
- Thư mục migration: `src/database/migrations/` (theo cấu trúc ADR-003)
- Drizzle ORM schema definitions — xem `api-contracts.md` cho kiểu dữ liệu chuẩn
- Schema `sessions`: `id` (uuid), `user_id` (uuid, nullable cho guest), `subject`, `topic`, `simulation_id`, `created_at` (timestamp UTC)
- Schema `messages`: `id` (uuid), `session_id` (uuid FK), `role` (enum: user/assistant), `content` (text), `layer` (int 1–4, nullable), `created_at` (timestamp UTC)
- Schema `user_answers`: `id`, `session_id`, `quiz_id`, `answer`, `is_correct`, `answered_at`
- Redis key pattern: `session:{session_id}` → JSON serialized session object
