# ASS-006 — POC Simulation Engine — D3 vs Canvas
**Sprint:** 1  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-006-simulation-poc

## Mô tả
Thực hiện POC so sánh hai thư viện/API để rendering simulation vật lý, từ đó đưa ra quyết định kỹ thuật có cơ sở cho toàn bộ simulation engine.

## Acceptance Criteria
- [ ] Report so sánh FPS giữa D3 và Canvas
- [ ] Report so sánh DX (Developer Experience) giữa D3 và Canvas
- [ ] Report so sánh bundle size giữa D3 và Canvas
- [ ] Quyết định chọn library gửi Lead review

## Ghi chú kỹ thuật
Tạo 2 prototype giống nhau (chuyển động thẳng) bằng D3 và Canvas API thuần; đo FPS bằng requestAnimationFrame counter; target machine i5 Gen 10 / 8GB RAM.
