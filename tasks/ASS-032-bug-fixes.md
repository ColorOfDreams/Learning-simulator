# ASS-032 — Bug Fixes từ Beta (P0 → P1)
**Sprint:** 4  
**Owner:** Cả nhóm  
**Status:** Todo  
**Branch:** feature/ASS-032-bug-fixes

## Mô tả
Xử lý toàn bộ bug P0 và P1 được phát hiện trong closed beta (ASS-031). Đảm bảo 0 P0 bug còn mở trước ngày launch chính thức.

## Acceptance Criteria
- [ ] 0 P0 bug còn mở khi launch
- [ ] Tất cả P1 bug đã có fix hoặc accepted mitigation plan

## Ghi chú kỹ thuật
- Ưu tiên fix theo thứ tự: P0 → P1 → P2 (P3 defer sang v1.1)
- Mỗi bug fix là 1 commit riêng biệt (không gom nhiều fix vào 1 commit)
- Commit message format: `fix: [ASS-032] <mô tả ngắn bug>` 
- Tag issue gốc với label `beta-reported` để truy vết nguồn gốc
- Sau khi fix P0/P1, yêu cầu người báo bug verify lại trên staging trước khi close issue
- Cập nhật `CHANGELOG.md` với danh sách bug đã fix trước launch
