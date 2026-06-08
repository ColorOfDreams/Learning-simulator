# ASS-014 — UI: Input Screen + Simulation Screen
**Sprint:** 2  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-014-ui-input-simulation

## Mô tả
Xây dựng hai màn hình chính của ứng dụng: Input Screen (người dùng nhập bài toán) và Simulation Screen (hiển thị simulation + explanation). Đảm bảo đúng Figma spec, responsive, và xử lý đầy đủ loading/error states.

## Acceptance Criteria
- [ ] Figma spec match ≥ 90% (spacing, typography, màu sắc)
- [ ] Không có layout shift (CLS = 0) khi load
- [ ] Responsive trên tablet ≥ 768px
- [ ] Loading skeleton hiển thị khi chờ API
- [ ] Error state hiển thị message thân thiện khi API thất bại

## Ghi chú kỹ thuật
- File: `src/frontend/src/pages/Input.tsx` và `src/frontend/src/pages/Simulation.tsx` (cấu trúc theo ADR-003)
- TanStack Query (`useQuery` / `useMutation`) cho tất cả API calls tới endpoints trong `api-contracts.md`
- SSE streaming qua hook tùy chỉnh `useSSEStream` sử dụng `EventSource` Web API
- Skeleton component dùng Tailwind `animate-pulse`
- Error boundary bọc `<SimulationScreen />` để tránh crash toàn trang
