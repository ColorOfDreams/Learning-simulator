# ASS-020 — Simulation Templates — Hóa học (2 sim)
**Sprint:** 3  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-020-sim-chemistry

## Mô tả
Xây dựng 2 simulation Hóa học: phản ứng axit-bazơ (pH chart với đổi màu theo pH) và phản ứng oxi hóa khử (electron flow animation). Mỗi simulation phải có disclaimer rõ ràng đây là mô phỏng khái niệm.

## Acceptance Criteria
- [ ] SIM-06: Axit-bazơ — pH chart cập nhật khi thêm axit/bazơ; màu dung dịch đổi theo pH (đỏ → tím → xanh)
- [ ] SIM-07: Oxi hóa khử — electron flow animation hiển thị chiều di chuyển electron
- [ ] Disclaimer "mô phỏng khái niệm, không thay thế thí nghiệm thực tế" hiển thị rõ ràng

## Ghi chú kỹ thuật
- Thư mục: `src/simulations/chemistry/` (theo cấu trúc ADR-003)
- SIM-06: D3.js cho pH chart (axis, bar/line); màu sắc map theo scale pH 0–14
- SIM-07: Canvas API cho electron flow animation (particle animation dọc theo dây dẫn)
- Disclaimer: component overlay cố định ở góc dưới màn hình simulation, không che slider
- Props interface `SimulationConfig` từ `api-contracts.md`
