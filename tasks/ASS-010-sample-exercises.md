# ASS-010 — 30 bài tập mẫu (draft) — Tất cả 3 môn
**Sprint:** 1  
**Owner:** Cả nhóm  
**Status:** Todo  
**Branch:** feature/ASS-010-sample-exercises

## Mô tả
Tạo bộ 30 bài tập mẫu dạng draft cho 3 môn học, phục vụ việc test LLM và seed database cho môi trường development/staging.

## Acceptance Criteria
- [ ] 30 bài đúng định dạng JSON: {id, subject, topic, text, parameters[]}
- [ ] Đã review chéo giữa các thành viên
- [ ] Không có bài trùng chủ đề

## Ghi chú kỹ thuật
Chia đều: Vật lý 12 bài (4 per sim x 3 sim), Hóa 8 bài, Toán 10 bài; lưu tại src/database/seeds/exercises.json.
