# ADR-0004 — Coding Conventions

**Status:** Accepted  
**Date:** 2026-06-08  
**Deciders:** Tech Lead

## TypeScript

```typescript
// ✅ Đúng
interface SimulationParam {
  key: string;
  value: number;
  unit: string;
  label: string;
}

// ❌ Sai — dùng any
const params: any = {};

// ❌ Sai — type assertion không cần thiết
const val = data as SomeType;
```

- **strict: true** trong tsconfig.json — bắt buộc.
- Không dùng `any`. Nếu cần, dùng `unknown` và type guard.
- Prefer `interface` cho object shape, `type` cho union/alias.
- Export types rõ ràng — không dùng `export default` cho types.

## Naming

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Component | PascalCase | `SimulationCanvas.tsx` |
| Hook | camelCase, prefix `use` | `useSSEStream.ts` |
| Util function | camelCase | `formatTimestamp.ts` |
| Constant | SCREAMING_SNAKE | `MAX_SESSIONS = 20` |
| API route | kebab-case | `/api/v1/quiz/generate` |
| DB table | snake_case | `user_sessions` |
| DB column | snake_case | `created_at` |
| Env variable | SCREAMING_SNAKE | `DATABASE_URL` |

## React

- Functional components only (không dùng class component).
- Props interface đặt ngay trên component: `interface Props { ... }`.
- Không dùng `React.FC` — khai báo thẳng: `function MyComp(props: Props)`.
- `useMemo`/`useCallback` chỉ khi có performance measurement chứng minh cần.
- Không dùng `useEffect` để fetch data — dùng TanStack Query.

## Fastify

- Mỗi route file export một `async function` nhận `fastify: FastifyInstance`.
- Validate schema với Fastify's JSON Schema (không dùng Zod ở BE để tránh overhead).
- Không throw raw Error — dùng `fastify.httpErrors.*`.

## Commit Messages

```
<type>(<scope>): <mô tả ngắn gọn, tiếng Anh hoặc Việt>

Ví dụ:
feat(sim): add SIM-01 uniform motion template
fix(ai): handle Claude timeout with 30s fallback
docs(adr): add ADR-004 coding conventions
test(auth): unit tests for JWT refresh flow
chore(ci): add Railway staging auto-deploy
```

**Types hợp lệ:** `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `perf`

## ESLint & Prettier

Cấu hình trong `.eslintrc.json` và `.prettierrc` tại mỗi package. CI sẽ fail nếu lint error còn tồn tại.

```
npm run lint     # ESLint check
npm run format   # Prettier format
npm run check    # Cả hai
```
