# ASS-022 — Quiz Module — MCQ Generation & Feedback
**Sprint:** 3  
**Owner:** Backend (B)  
**Status:** Todo  
**Branch:** feature/ASS-022-quiz-backend

## Mô tả
Xây dựng backend cho module Quiz: sinh câu hỏi trắc nghiệm (MCQ) tự động từ AI dựa trên chủ đề simulation, độ khó tăng dần. Lưu kết quả trả lời của người dùng để phân tích sau.

## Acceptance Criteria
- [ ] `POST /quiz/generate` trả về 3–5 câu MCQ trong ≤ 5 giây
- [ ] Các câu hỏi có độ khó tăng dần (easy → medium → hard)
- [ ] `POST /quiz/answer` lưu kết quả vào database thành công

## Ghi chú kỹ thuật
- File service: `src/backend/src/services/quiz.service.ts` (theo cấu trúc ADR-003)
- Claude Haiku prompt tại `src/ai-service/prompts/quiz.txt`
- Cache quiz theo `quiz_id` trong Redis TTL 1h (key: `quiz:{quiz_id}`)
- Response schema `POST /quiz/generate`: `{ quiz_id, questions: [{id, text, options: [A,B,C,D], difficulty}] }` — xem `api-contracts.md`
- `POST /quiz/answer` body: `{ quiz_id, answers: [{question_id, selected_option}] }`; response: `{ score, correct_ids[], explanations{} }`
