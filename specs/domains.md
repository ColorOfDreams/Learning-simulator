# Domains — AI Study Simulator

## Domain Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│   React 18 + TypeScript + Vite + Tailwind + D3/Canvas + KaTeX  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / SSE
┌────────────────────────▼────────────────────────────────────────┐
│                      API GATEWAY (Fastify)                      │
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
| **API Gateway** | Tech Lead | Fastify routing, middleware, auth |
| **Quiz Service** | Backend (B) | MCQ generation, answer tracking |
| **Session Service** | Backend (B) | History, library, sharing |
| **Database** | Backend (B) | PostgreSQL schema, migrations, Redis cache |
| **CI/CD & Infra** | Backend (B) | GitHub Actions, Railway, Vercel |
