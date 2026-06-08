# ASS-015 — AI Explanation — SSE Streaming
**Sprint:** 2  
**Owner:** Backend (B)  
**Status:** Todo  
**Branch:** feature/ASS-015-ai-explanation-sse

## Mô tả
Xây dựng endpoint streaming giải thích khái niệm theo 4 lớp (Hiện tượng → Công thức → Áp dụng → Thử nghiệm) sử dụng Server-Sent Events. Hỗ trợ follow-up questions với context giữ nguyên trong session.

## Acceptance Criteria
- [ ] Stream không bị ngắt giữa chừng (không có SSE gap > 5s trừ heartbeat)
- [ ] Giải thích tuân theo đúng 4-layer prompt: Hiện tượng → Công thức → Áp dụng → Thử nghiệm
- [ ] Follow-up question nhớ context của toàn bộ conversation trong session
- [ ] Timeout 30s → gửi event `error` với message rõ ràng, không để client treo

## Ghi chú kỹ thuật
- File: `src/backend/src/routes/explain.ts` (theo cấu trúc ADR-003)
- Fastify SSE: dùng `reply.raw` (Node.js `ServerResponse`) để write chunks — xem `api-contracts.md` cho SSE event format
- BullMQ queue (`explain-queue`) để xử lý concurrent requests, tránh block event loop
- Headers bắt buộc: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
- Heartbeat comment (`: ping`) mỗi 15s để giữ connection
