# ADR-0002 — Tech Stack

**Status:** Accepted  
**Date:** 2026-06-08  
**Deciders:** Tech Lead

## Frontend

| Layer | Lựa chọn | Lý do |
|-------|----------|-------|
| Framework | React 18 | Ecosystem lớn, team quen, Concurrent Mode cho streaming |
| Build tool | Vite 5 | HMR nhanh, bundle nhỏ, ESM native |
| Language | TypeScript 5 | Type-safety giảm bug runtime, ADR-004 enforce strict |
| Styling | Tailwind CSS 3 | Utility-first, không cần design system riêng cho MVP |
| State | TanStack Query v5 + useState/useReducer | Server state vs UI state rõ ràng |
| Math render | KaTeX | Nhanh hơn MathJax, bundle nhỏ hơn |
| Simulation | D3.js + Canvas API | D3 cho data binding, Canvas cho animation FPS cao |
| SSE client | Native EventSource | Không cần library thêm |

## Backend

| Layer | Lựa chọn | Lý do |
|-------|----------|-------|
| Framework | Fastify 4 | Nhanh nhất Node.js web framework, schema validation built-in |
| Language | TypeScript 5 | Consistency với FE |
| Database | PostgreSQL 15 | ACID, JSON support, Railway free tier |
| Cache/Queue | Redis 7 + BullMQ | Session cache + AI job queue |
| Auth | fastify-jwt + @fastify/oauth2 | Native Fastify plugins |
| ORM | Drizzle ORM | Type-safe, lightweight, migration-first |

## AI

| | Lựa chọn | Lý do |
|---|----------|-------|
| Primary | Claude Haiku (nếu POC pass) | Rẻ nhất ($0.25/M input), đủ nhanh |
| Fallback | GPT-4o-mini hoặc Gemini Flash | Dự phòng nếu Claude down |
| SDK | `@anthropic-ai/sdk` | Official, streaming support |

**Quyết định cuối về AI model:** Sau ASS-003 POC.

## Infra

| | Lựa chọn |
|---|----------|
| FE Hosting | Vercel (free tier) |
| BE Hosting | Railway (starter $5/month) |
| Assets | Cloudflare R2 (free 10GB) |
| CI/CD | GitHub Actions |
| Monitoring | Sentry (free) + PostHog (free) |
