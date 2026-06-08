# ASS-011 — AI Pipeline — Input → Extract → Simulation Config
**Sprint:** 2  
**Owner:** Tech Lead  
**Status:** Todo  
**Branch:** feature/ASS-011-ai-pipeline

## Mô tả
Xây dựng AI pipeline xử lý đầu vào từ người dùng (bài toán/câu hỏi), trích xuất thông tin (môn học, chủ đề, tham số), và tạo ra Simulation Config để render đúng simulation tương ứng.

## Acceptance Criteria
- [ ] Đạt ≥ 85% accuracy trên test set 50 bài
- [ ] POST /analyze trả về JSON đúng schema: `{subject, topic, parameters[], confidence, simulation_id}`
- [ ] Latency < 10s p95

## Ghi chú kỹ thuật
- File chính: `src/ai-service/analyze.ts` (theo cấu trúc ADR-003)
- Model: Claude Haiku (primary), GPT-4o-mini (fallback) — xem `api-contracts.md` cho request/response schema
- Prompt lưu tại `src/ai-service/prompts/analyze.txt` (không hardcode trong code)
- Cache identical input trong Redis TTL 1h (key: `analyze:{hash(input)}`)
- Trả lỗi 422 nếu input không thuộc scope (out-of-scope handler)
