# ASS-036 — Sentry Error Monitoring
**Sprint:** 4  
**Owner:** Backend (B)  
**Status:** Todo  
**Branch:** feature/ASS-036-sentry

## Mô tả
Tích hợp Sentry error monitoring cho cả Frontend và Backend. Cấu hình alert Slack khi error rate vượt 1% và xác minh alert xuất hiện trong vòng 2 phút khi có lỗi thực tế.

## Acceptance Criteria
- [ ] Sentry alert tới Slack khi error rate > 1% trong 5 phút
- [ ] Test error → alert xuất hiện trong Slack < 2 phút

## Ghi chú kỹ thuật
- BE: `@sentry/node` — init trong `src/backend/src/app.ts` trước khi register routes (theo cấu trúc ADR-003)
- FE: `@sentry/react` — wrap App với `Sentry.ErrorBoundary`; init trong `main.tsx`
- Sentry → Slack: tạo Slack webhook integration trong Sentry project settings; alert rule: `error rate > 1% over 5min`
- Performance tracing: `tracesSampleRate: 0.1` (10% sampling để tránh quota overhead)
- Không capture sensitive data: filter `password`, `token`, `authorization` headers trong `beforeSend`
- Environment tags: `environment: staging | production` từ env var `NODE_ENV`
