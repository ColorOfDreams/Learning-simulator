# ASS-025 — Sample Library UI
**Sprint:** 3  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-025-library-ui

## Mô tả
Xây dựng màn hình thư viện bài mẫu với grid card layout, bộ lọc theo môn/chủ đề, thanh tìm kiếm, và thumbnail preview. Click vào card sẽ load simulation tương ứng.

## Acceptance Criteria
- [ ] Hiển thị grid card layout đúng Figma spec
- [ ] Filter theo môn học + tìm kiếm text hoạt động đúng
- [ ] Click card → load và hiển thị simulation tương ứng
- [ ] Thumbnail lazy load (không block render ban đầu)

## Ghi chú kỹ thuật
- File: `src/frontend/src/pages/Library.tsx` (theo cấu trúc ADR-003)
- TanStack Query `useQuery` với search params (`subject`, `topic`, `q`) — endpoint `GET /library` theo `api-contracts.md`
- URL sync: filter params sync vào URL query string để shareable link
- Lazy load thumbnail: dùng `loading="lazy"` trên `<img>` hoặc Intersection Observer
- Responsive: 1 col (mobile) → 2 col (sm) → 3 col (md) → 4 col (lg) bằng Tailwind grid
