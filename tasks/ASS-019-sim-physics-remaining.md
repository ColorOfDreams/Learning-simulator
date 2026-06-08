# ASS-019 — Simulation Templates — Vật lý (2 sim còn lại)
**Sprint:** 3  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-019-sim-physics-remaining

## Mô tả
Hoàn thiện 2 simulation Vật lý còn lại: mạch điện R nối tiếp/song song và con lắc đơn. Mỗi simulation phải có unit test đầy đủ và sai số vật lý ≤ 5%.

## Acceptance Criteria
- [ ] SIM-04: Mạch điện R nối tiếp/song song — tính điện trở tương đương, dòng điện, điện áp đúng
- [ ] SIM-05: Con lắc đơn — chu kỳ T = 2π√(L/g), biên độ dao động đúng
- [ ] Unit test pass 100% với vitest
- [ ] Sai số tính toán vật lý ≤ 5%

## Ghi chú kỹ thuật
- Thư mục: `src/simulations/physics/` (theo cấu trúc ADR-003)
- Unit test: vitest; mock `requestAnimationFrame` với `vi.fn()` trong test setup
- Props interface `SimulationConfig` định nghĩa trong `api-contracts.md`
- SIM-04: vẽ sơ đồ mạch bằng Canvas; highlight đường dòng điện
- SIM-05: dùng `requestAnimationFrame` cho animation con lắc; dừng khi component unmount
