# ASS-009 — CI/CD Pipeline & Staging Deploy
**Sprint:** 1  
**Owner:** Backend (B)  
**Status:** Todo  
**Branch:** feature/ASS-009-cicd

## Mô tả
Thiết lập CI/CD pipeline tự động để đảm bảo mọi push vào main đều được kiểm tra chất lượng và deploy lên staging một cách tự động.

## Acceptance Criteria
- [ ] Push vào main → tự động deploy staging trong < 5 phút

## Ghi chú kỹ thuật
GitHub Actions workflow: lint → test → build → deploy Vercel (FE) + Railway (BE); secrets lưu trong GitHub repo settings.
