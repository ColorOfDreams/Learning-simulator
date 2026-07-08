# ADR-0003 — Folder Structure

**Status:** Superseded — cập nhật 2026-07-08  
**Date:** 2026-06-08  
**Deciders:** Tech Lead

> [!IMPORTANT]
> **Cấu trúc thực tế khác bản dự kiến này:** Frontend là **UmiJS** (không có `vite.config.ts`/`tailwind.config.ts`/`main.tsx`; dùng `config/`, `pages/{HocSinh,GiaoVien,Admin,...}`, `models/`, `services/`). Backend là **NestJS module-based** (`src/modules/*`), **không phải Fastify + Drizzle**. Cây thư mục hiện hành: [../README.md](../README.md#-cấu-trúc-thư-mục) và [../src/frontend/README.md](../src/frontend/README.md).

## Frontend (`/src/frontend/`)

```
src/frontend/
├── public/
│   └── thumbnails/          # Simulation preview images
├── src/
│   ├── components/          # Shared UI components (Button, Card, Loader...)
│   │   ├── ui/              # Primitive components
│   │   └── simulation/      # Simulation-specific components
│   ├── pages/               # Route-level components
│   │   ├── Home.tsx
│   │   ├── Input.tsx        # Bài tập input screen
│   │   ├── Simulation.tsx   # Simulation + AI explanation screen
│   │   ├── Quiz.tsx
│   │   ├── Library.tsx
│   │   ├── History.tsx
│   │   └── Share.tsx        # Teacher share view
│   ├── hooks/               # Custom hooks (useSSE, useSimulation, useAuth...)
│   ├── utils/               # Pure functions (formatters, validators)
│   ├── api/                 # API client functions (typed wrappers)
│   ├── types/               # TypeScript type definitions
│   ├── store/               # Global state (React context / useReducer)
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Simulations (`/src/simulations/`)

```
src/simulations/
├── types.ts                 # SimulationConfig, SimulationParam types
├── registry.ts              # Map: simulation_id → component
├── physics/
│   ├── SIM-01-uniform-motion.tsx
│   ├── SIM-02-projectile.tsx
│   ├── SIM-03-newton.tsx
│   ├── SIM-04-circuit.tsx
│   └── SIM-05-pendulum.tsx
├── chemistry/
│   ├── SIM-06-acid-base.tsx
│   └── SIM-07-redox.tsx
└── math/
    ├── SIM-08-quadratic.tsx
    ├── SIM-09-trig.tsx
    └── SIM-10-geometry.tsx
```

## Backend (`/src/backend/`)

```
src/backend/
├── src/
│   ├── app.ts               # Fastify app factory
│   ├── server.ts            # Entry point (listen)
│   ├── plugins/             # Fastify plugins (auth, cors, rate-limit)
│   ├── routes/              # Route handlers
│   │   ├── analyze.ts
│   │   ├── explain.ts
│   │   ├── quiz.ts
│   │   ├── library.ts
│   │   ├── history.ts
│   │   ├── sessions.ts
│   │   └── auth.ts
│   ├── services/            # Business logic (ai.service.ts, quiz.service.ts...)
│   ├── db/                  # Drizzle schema + client
│   └── types/               # Shared TypeScript types
├── tsconfig.json
└── package.json
```

## Database (`/src/database/`)

```
src/database/
├── migrations/              # Drizzle migration files (timestamped)
└── seeds/                   # Seed data (30 library items, test users)
```

## AI Service (`/src/ai-service/`)

```
src/ai-service/
├── client.ts                # Anthropic SDK client singleton
├── analyze.ts               # Extract subject/topic/params from bài tập
├── explain.ts               # 4-layer SSE explanation
├── quiz.ts                  # MCQ generation
└── prompts/                 # Prompt templates
    ├── analyze.txt
    ├── explain.txt
    └── quiz.txt
```

## Quy tắc

- **Không import ngược domain:** FE không import từ `/backend/`, BE không import từ `/frontend/`.
- **Shared types:** Chỉ qua `/specs/api-contracts.md` và tay-type trong mỗi domain — không có shared package ở MVP.
- **Test files:** Đặt cạnh source file, hậu tố `.test.ts` hoặc `.test.tsx`.
