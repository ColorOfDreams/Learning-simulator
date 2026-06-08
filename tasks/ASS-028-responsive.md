# ASS-028 — Mobile Responsive — Toàn bộ app
**Sprint:** 3  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-028-responsive

## Mô tả
Đảm bảo toàn bộ các màn hình của ứng dụng responsive trên tablet (≥ 768px) và hỗ trợ touch events cho các slider trong simulation.

## Acceptance Criteria
- [ ] Tất cả màn hình (Input, Simulation, Quiz, Library, History) hiển thị đúng ở viewport ≥ 768px
- [ ] Sliders trong simulation hoạt động được bằng cảm ứng (touch)

## Ghi chú kỹ thuật
- Tailwind breakpoints: `md:` (768px) cho tất cả layout changes (theo cấu trúc ADR-003)
- Simulation canvas: tự scale theo container width (`width: 100%`, maintain aspect ratio bằng `viewBox` nếu dùng SVG hoặc resize observer cho Canvas)
- Touch events cho slider: thêm `ontouchstart` và `ontouchmove` handlers bên cạnh `onmousedown`/`onmousemove`
- Test thực tế trên Chrome DevTools Device Mode: iPad (768×1024), iPad Pro (1024×1366)
- Đảm bảo minimum tap target 44×44px theo WCAG cho các nút bấm
