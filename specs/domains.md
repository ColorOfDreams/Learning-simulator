# Domains — AI Study Simulator

> [!NOTE]
> **Trạng thái: sơ đồ domain theo kế hoạch ban đầu (lịch sử).** Khác biệt so với thực tế: AI dùng **Mistral** (không phải Claude); **không dùng Redis** và **không dùng SSE**; mô phỏng dùng **Three.js/SVG** (không phải D3/Canvas); backend là **NestJS + TypeORM + PostgreSQL/pgvector**. Kiến trúc & tech stack hiện hành: [../README.md](../README.md#-kiến-trúc-tổng-quan).

## Domain Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│ React 19 + TypeScript + UmiJS + Ant Design + D3/Canvas + KaTeX  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / SSE
┌────────────────────────▼────────────────────────────────────────┐
│                      API GATEWAY (NestJS)                       │
│   Auth middleware · Rate limiting · Request validation · CORS   │
└──────┬──────────────────┬──────────────────────┬───────────────┘
       │                  │                       │
┌──────▼──────┐  ┌────────▼────────┐  ┌──────────▼──────────┐
│  AI SERVICE │  │  QUIZ SERVICE   │  │  SESSION SERVICE    │
│  (Claude)   │  │  (MCQ Generate) │  │  (History/Library)  │
└──────┬──────┘  └────────┬────────┘  └──────────┬──────────┘
       │                  │                       │
┌──────▼──────────────────▼───────────────────────▼──────────────┐
│                    DATA LAYER                                    │
│           PostgreSQL (Railway) · Redis (cache + queue)          │
└─────────────────────────────────────────────────────────────────┘
```

## Phân chia Domain

| Domain | Owner | Mô tả |
|--------|-------|-------|
| **Frontend UI** | Frontend (A) | React components, pages, routing, UX |
| **Simulation Engine** | Frontend (A) | D3/Canvas animation templates |
| **AI Service** | Tech Lead | Claude API integration, prompt engineering |
| **API Gateway** | Tech Lead | NestJS routing, middleware, auth |
| **Quiz Service** | Backend (B) | MCQ generation, answer tracking |
| **Session Service** | Backend (B) | History, library, sharing |
| **Database** | Backend (B) | PostgreSQL schema, migrations, Redis cache |
| **CI/CD & Infra** | Backend (B) | GitHub Actions, Railway, Vercel |
