# ASS-013 — Simulation Templates — Toán (2 sim)
**Sprint:** 2  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-013-sim-math-2

## Mô tả
Xây dựng 2 simulation template cho môn Toán: đồ thị hàm bậc 2 (parabol) và đồ thị hàm lượng giác. Người dùng điều chỉnh hệ số qua slider và xem đồ thị cập nhật real-time với công thức KaTeX.

## Acceptance Criteria
- [ ] SIM-08: Đồ thị hàm bậc 2 — thay đổi a, b, c → đồ thị cập nhật đúng
- [ ] SIM-09: Hàm lượng giác — sin/cos/tan với biên độ, chu kỳ, pha
- [ ] Cập nhật đồ thị sau khi kéo slider ≤ 300ms
- [ ] Công thức toán học render đúng bằng KaTeX (không hiển thị raw LaTeX)

## Ghi chú kỹ thuật
- Thư mục: `src/simulations/math/` (theo cấu trúc ADR-003)
- D3.js cho data visualization (scale, axis, path)
- Debounce slider input 50ms trước khi re-render đồ thị
- KaTeX render inline trong component, không dùng dangerouslySetInnerHTML nếu tránh được
- Props interface: `SimulationConfig` từ `api-contracts.md`
