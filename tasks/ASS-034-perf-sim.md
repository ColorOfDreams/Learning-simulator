# ASS-034 — Performance Tuning — Simulation FPS
**Sprint:** 4  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-034-perf-sim

## Mô tả
Tối ưu hiệu năng các simulation component để đạt ≥ 30 FPS trên thiết bị tầm trung (i5 Gen 10 / 8GB RAM). Sử dụng Chrome DevTools Performance tab để phân tích bottleneck.

## Acceptance Criteria
- [ ] Tất cả simulation đạt ≥ 30 FPS trên i5 Gen 10 / 8GB RAM
- [ ] Không có jank (frame drop > 16ms) khi kéo slider

## Ghi chú kỹ thuật
- Profiling: Chrome DevTools Performance tab → record 10s khi đang animation; tìm long tasks > 50ms
- `useMemo` cho heavy calculations (e.g., tính quỹ đạo ném xiên, eigen values)
- `requestAnimationFrame` throttle: chỉ re-render khi frame thực sự cần (tránh gọi RAF bên trong slider onChange)
- Debounce slider `onChange` 16ms để tránh re-calculate nhiều hơn 1 lần/frame
- Canvas: dùng `clearRect` thay vì `fillRect` toàn màn hình; tránh `getImageData` trong animation loop
- Sau tối ưu: chụp ảnh Performance flame chart trước/sau, đính vào PR
