# ASS-008 — Setup Backend Boilerplate
**Sprint:** 1  
**Owner:** Backend (B)  
**Status:** Todo  
**Branch:** feature/ASS-008-be-boilerplate

## Mô tả
Thiết lập boilerplate cho backend với đầy đủ dependencies và kết nối database, đảm bảo server hoạt động và sẵn sàng cho việc phát triển feature.

## Acceptance Criteria
- [ ] Server chạy được không lỗi
- [ ] Endpoint /healthcheck trả về HTTP 200
- [ ] Kết nối PostgreSQL thành công
- [ ] Kết nối Redis thành công

## Ghi chú kỹ thuật
Fastify 4 + TypeScript + Drizzle ORM + fastify-jwt + @fastify/oauth2 + ioredis; env từ .env.example.
