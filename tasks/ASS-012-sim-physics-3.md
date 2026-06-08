# ASS-012 — Simulation Templates — Vật lý (3 sim)
**Sprint:** 2  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-012-sim-physics-3

## Mô tả
Xây dựng 3 simulation template cho môn Vật lý: chuyển động thẳng đều/biến đổi đều, ném xiên, và định luật Newton F=ma. Mỗi simulation phải tương tác được qua slider và hỗ trợ Play/Pause/Reset.

## Acceptance Criteria
- [ ] SIM-01: Chuyển động thẳng (đều / biến đổi đều) hoạt động đúng
- [ ] SIM-02: Ném xiên — quỹ đạo parabol đúng với góc và vận tốc đầu
- [ ] SIM-03: Newton F=ma — hiển thị lực, gia tốc, khối lượng tương tác
- [ ] Sai số tính toán vật lý ≤ 5% so với công thức lý thuyết
- [ ] FPS ≥ 30 trong suốt animation
- [ ] Slider điều chỉnh tham số + nút Play/Pause/Reset hoạt động đúng

## Ghi chú kỹ thuật
- Thư mục: `src/simulations/physics/` (theo cấu trúc ADR-003)
- Mỗi component nhận `SimulationConfig` props (định nghĩa trong `api-contracts.md`)
- Export mặc định: `export default function SimXX({ config }: { config: SimulationConfig })`
- Dùng Canvas API cho animation (không dùng CSS animation)
- `requestAnimationFrame` loop; dọn dẹp trong `useEffect` cleanup
