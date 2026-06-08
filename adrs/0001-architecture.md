# ADR-0001 — System Architecture

**Status:** Accepted  
**Date:** 2026-06-08  
**Deciders:** Tech Lead

## Context

Cần kiến trúc phù hợp cho ứng dụng web có AI streaming, real-time simulation, auth, và kỳ vọng scale lên 1000 concurrent users trong tương lai gần.

## Decision

Kiến trúc **Monorepo, 3-tier, API-first**.

```
Browser (React SPA)
    │  HTTPS + SSE
    ▼
API Gateway (Fastify/Node.js)   ←──── Redis (cache + BullMQ queue)
    │
    ├── /analyze  → AI Service (Claude API)
    ├── /explain  → AI Service (SSE stream)
    ├── /quiz/*   → Quiz Service (in-process)
    ├── /library  → PostgreSQL (cached in Redis)
    ├── /history  → PostgreSQL
    └── /auth/*   → PostgreSQL + Google OAuth
    │
    ▼
PostgreSQL (Railway)
```

**Tại sao không microservices:**  
Team 3 người, 4 tuần. Microservices tăng overhead ops không cần thiết ở giai đoạn này. Monolith Fastify đủ để scale vertical + horizontal stateless đến ~10k req/min.

**Tại sao SSE thay vì WebSocket:**  
AI explanation là một chiều (server → client). SSE đơn giản hơn, không cần maintain connection bidirectional. Fastify có plugin SSE native.

## Consequences

- **Tốt:** Đơn giản deploy, debug dễ, team nhỏ dễ maintain.
- **Đánh đổi:** Khi cần real-time bidirectional (v2) sẽ cần migrate sang WebSocket.
- **Rủi ro:** Cold start Railway nếu free tier → mitigate bằng health ping cron.
