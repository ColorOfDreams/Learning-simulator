# ASS-021 — Simulation Template — Toán: Hình học
**Sprint:** 3  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-021-sim-geometry

## Mô tả
Xây dựng simulation hình học tương tác: người dùng kéo các điểm/đỉnh để thay đổi hình tam giác và đường tròn; diện tích và chu vi cập nhật real-time kèm công thức KaTeX.

## Acceptance Criteria
- [ ] SIM-10: Tam giác tương tác — kéo đỉnh → diện tích và chu vi cập nhật real-time
- [ ] SIM-10: Đường tròn — kéo bán kính → diện tích và chu vi cập nhật real-time
- [ ] Công thức diện tích/chu vi hiển thị đúng bằng KaTeX bên cạnh hình

## Ghi chú kỹ thuật
- Thư mục: `src/simulations/math/` (theo cấu trúc ADR-003)
- D3.js drag handles cho các điểm kéo thả (`d3.drag()`)
- KaTeX render công thức động (cập nhật giá trị số trong công thức)
- Debounce tính toán 16ms (1 animation frame) để tránh recalculate quá nhiều khi drag
- Props interface `SimulationConfig` từ `api-contracts.md`
