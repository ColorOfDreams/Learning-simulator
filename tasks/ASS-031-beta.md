# ASS-031 — Closed Beta — 20 học sinh + 5 giáo viên
**Sprint:** 4  
**Owner:** Tech Lead  
**Status:** Todo  
**Branch:** feature/ASS-031-beta

## Mô tả
Tổ chức closed beta với 20 học sinh và 5 giáo viên để thu thập feedback thực tế. Theo dõi NPS và hành vi người dùng để định hướng cải tiến trước khi launch chính thức.

## Acceptance Criteria
- [ ] ≥ 20 user hoàn thành ít nhất 1 full flow (nhập bài → xem simulation → đọc explanation)
- [ ] Thu thập NPS score và ít nhất 10 feedback định tính

## Ghi chú kỹ thuật
- Tạo invite codes (unique per user) để track từng beta tester — lưu trong bảng `invite_codes`
- Google Form NPS survey: thang điểm 0–10 + câu mở (gửi sau khi user hoàn thành first flow)
- Hotjar session recording (optional): cài snippet vào `index.html`, chỉ record với consent banner
- Analytics events cần có trước beta: `exercise_submitted`, `simulation_loaded`, `explanation_started` (xem ASS-035)
- Tổng kết beta: document kết quả vào `docs/beta-report.md` trước Sprint 4 retro
