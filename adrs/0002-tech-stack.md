# ADR-0002 — Tech Stack

**Status:** Superseded (một phần) — cập nhật 2026-07-08  
**Date:** 2026-06-08  
**Deciders:** Tech Lead

> [!IMPORTANT]
> **Khác thực tế:** phần **AI** đã chốt dùng **Mistral** (OpenAI-compatible), không phải Claude/GPT/Gemini; **Infra** frontend deploy trên **Railway** (không phải Vercel); Redis/Cloudflare R2/PostHog trong kế hoạch **không được sử dụng**. Phần Frontend/Backend bên dưới phần lớn vẫn đúng (UmiJS/React 19/AntD, NestJS 11/TypeORM/Passport/Swagger). Stack hiện hành đầy đủ: [../README.md](../README.md#-tech-stack).

## Frontend

| Layer | Lựa chọn | Lý do |
|-------|----------|-------|
| Framework | React 19 + UmiJS v4 (@umijs/max) | Enterprise-level framework, routing tự động, kiến trúc chuẩn |
| Language | TypeScript | Type-safety giảm bug runtime, dễ dàng scale |
| Styling | Ant Design (antd) + Less + Styled Components | UI library mạnh mẽ, có sẵn nhiều component phức tạp (ProComponents) |
| State | @umijs/plugin-model | State management tích hợp sẵn của UmiJS, nhẹ và dễ sử dụng |
| API Client | Axios | Thư viện gọi API phổ biến, dễ cấu hình interceptor |
| Charts | ApexCharts | Thư viện vẽ biểu đồ tương tác, dễ custom |
| Text Editor| TinyMCE | Tích hợp trình soạn thảo văn bản mạnh mẽ |

## Backend

| Layer | Lựa chọn | Lý do |
|-------|----------|-------|
| Framework | NestJS 11 | Kiến trúc module hóa chặt chẽ, dễ maintain và scale (Angular-like) |
| Language | TypeScript | Consistency với FE, type-safe APIs |
| Database | PostgreSQL | ACID, ổn định, hỗ trợ dữ liệu phức tạp |
| ORM | TypeORM | Tích hợp sâu với NestJS, hỗ trợ nhiều loại database, Active Record/Data Mapper |
| Auth | Passport (JWT, Google OAuth) | Tiêu chuẩn bảo mật được verify kỹ lưỡng, dễ dàng mở rộng nhiều strategy |
| Validation| class-validator + class-transformer | Decorator-based validation, tích hợp sẵn vào ValidationPipe của NestJS |
| API Docs | Swagger (@nestjs/swagger) | Tự động sinh tài liệu API từ Decorators |

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
