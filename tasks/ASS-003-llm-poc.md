# ASS-003 — POC LLM — Phân tích bài tập tiếng Việt
**Sprint:** 1  
**Owner:** Tech Lead  
**Status:** In Progress  
**Branch:** feature/ASS-003-llm-poc

## Mô tả
Thực hiện POC so sánh các LLM để tìm ra model phù hợp nhất cho việc phân tích bài tập tiếng Việt, đảm bảo độ chính xác và output đúng định dạng yêu cầu.

## Acceptance Criteria
- [ ] Đạt >= 80% accuracy trên 20 bài test
- [ ] Báo cáo so sánh Claude Haiku vs GPT-4o-mini vs Gemini Flash
- [ ] Output đúng định dạng JSON: {subject, topic, parameters[], confidence}

## Ghi chú kỹ thuật
Tạo script test tại src/ai-service/poc/; 20 bài test cover Vật lý (8 bài), Hóa (6 bài), Toán (6 bài).
