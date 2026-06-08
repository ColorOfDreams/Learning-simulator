# ASS-040 — Soft Launch — Deploy Production
**Sprint:** 4  
**Owner:** Tech Lead  
**Status:** Todo  
**Branch:** feature/ASS-040-launch

## Mô tả
Deploy ứng dụng lên môi trường production với custom domain và SSL. Thiết lập uptime monitoring để đảm bảo ≥ 99.5% uptime trong 24 giờ đầu sau launch.

## Acceptance Criteria
- [ ] App live và accessible qua custom domain với HTTPS
- [ ] Uptime ≥ 99.5% trong 24 giờ đầu sau launch (cho phép tối đa 7 phút downtime)

## Ghi chú kỹ thuật
- FE: Vercel production deploy — kết nối repo GitHub, set env vars `VITE_API_URL`, `VITE_POSTHOG_KEY` (theo cấu trúc ADR-003)
- BE: Railway production deploy — set env vars `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- Custom domain: thêm domain record trong Vercel (CNAME); SSL auto-provision bởi Vercel/Railway
- Uptime Robot: tạo monitor HTTP(S) check mỗi 5 phút; alert email + Slack nếu down
- Launch checklist trước deploy:
  - [ ] Database migration chạy thành công trên production DB
  - [ ] Smoke test trên staging pass (ASS-029)
  - [ ] 0 P0 bug (ASS-032)
  - [ ] Sentry active (ASS-036)
  - [ ] Analytics active (ASS-035)
