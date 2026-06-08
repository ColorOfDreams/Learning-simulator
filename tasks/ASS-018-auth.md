# ASS-018 — Auth: Email + Google OAuth
**Sprint:** 2  
**Owner:** Backend (B)  
**Status:** Todo  
**Branch:** feature/ASS-018-auth

## Mô tả
Triển khai hệ thống xác thực người dùng hỗ trợ đăng nhập bằng Email/Password và Google OAuth. Phát JWT + refresh token cho session dài hạn. Hỗ trợ Guest mode với giới hạn 3 session/ngày.

## Acceptance Criteria
- [ ] Login flow hoàn thành trong < 3 bước (nhập thông tin → submit → redirect)
- [ ] JWT access token + refresh token có hạn 30 ngày
- [ ] Guest mode giới hạn 3 session/ngày per IP

## Ghi chú kỹ thuật
- File: `src/backend/src/routes/auth.ts` (theo cấu trúc ADR-003)
- Plugin JWT: `fastify-jwt`; plugin OAuth: `@fastify/oauth2` với provider Google
- Password hash: `bcrypt` với salt rounds = 12
- Rate limit Guest mode: dùng Redis IP tracking (key: `guest_limit:{ip}:{date}`, TTL đến hết ngày)
- Refresh token lưu trong Redis (key: `refresh:{token_hash}`, value: `user_id`)
- Auth endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/google`, `POST /auth/refresh`, `POST /auth/logout` — xem `api-contracts.md` cho request/response schema
