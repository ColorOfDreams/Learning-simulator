# ASS-039 — Security Audit — OWASP Top 10
**Sprint:** 4  
**Owner:** Tech Lead  
**Status:** Todo  
**Branch:** feature/ASS-039-security

## Mô tả
Thực hiện security audit theo OWASP Top 10: chạy SAST scan, npm audit, Snyk scan và kiểm tra thủ công các điểm rủi ro cao. Mục tiêu 0 critical finding khi launch.

## Acceptance Criteria
- [ ] SAST scan pass (0 critical finding)
- [ ] Medium findings có mitigation plan được document

## Ghi chú kỹ thuật
- Tools: `npm audit --audit-level=high`; Snyk CLI (`snyk test`) — chạy cho cả FE và BE (theo cấu trúc ADR-003)
- Checklist OWASP kiểm tra thủ công:
  - **SQL Injection**: Drizzle ORM dùng parameterized queries (không string concat)
  - **XSS**: React escaping tự động; kiểm tra `dangerouslySetInnerHTML` usage
  - **CSRF**: Cookie với `SameSite=Strict` hoặc `Lax`; JWT in header (không cookie) tránh CSRF
  - **Rate Limiting**: `@fastify/rate-limit` trên tất cả public endpoints
  - **Auth Bypass**: verify JWT middleware trên protected routes
  - **Sensitive Data Exposure**: không log password/token; HTTPS enforced; `Strict-Transport-Security` header
- Document kết quả audit vào `docs/security-audit-sprint4.md`
