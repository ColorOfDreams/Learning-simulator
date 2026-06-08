# ASS-030 — QA — Full Feature Checklist
**Sprint:** 3  
**Owner:** Cả nhóm  
**Status:** Todo  
**Branch:** feature/ASS-030-qa-checklist

## Mô tả
Thực hiện QA toàn bộ tính năng theo checklist: mỗi thành viên test chéo 1/3 feature list, báo cáo bug vào GitHub Issues với repro steps đầy đủ. Mục tiêu 0 P0 bug khi kết thúc Sprint 3.

## Acceptance Criteria
- [ ] Mỗi thành viên hoàn thành test chéo 1/3 danh sách tính năng
- [ ] Tất cả bug được báo vào GitHub Issues với đầy đủ repro steps
- [ ] 0 P0 bug còn mở khi kết thúc sprint

## Ghi chú kỹ thuật
- Test matrix: Chrome (latest) / Firefox (latest) / Safari (latest) × Desktop / Tablet (≥ 768px)
- Bug report format:
  - **Steps to Reproduce**: đánh số từng bước
  - **Expected**: kết quả mong đợi
  - **Actual**: kết quả thực tế
  - **Screenshot/Video**: đính kèm bắt buộc cho P0/P1
- Severity:
  - **P0**: app crash / data loss / không login được
  - **P1**: tính năng chính không hoạt động
  - **P2**: UI sai / UX không tốt
  - **P3**: minor cosmetic
- Feature list phân chia: Tech Lead (ASS-011, 017, 029) | Backend (ASS-015, 016, 018, 022, 024, 026) | Frontend (ASS-012–014, 019–021, 023, 025, 027, 028)
