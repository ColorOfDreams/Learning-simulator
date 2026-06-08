# ASS-035 — Analytics Setup — PostHog Funnels
**Sprint:** 4  
**Owner:** Backend (B)  
**Status:** Todo  
**Branch:** feature/ASS-035-analytics

## Mô tả
Tích hợp PostHog để track 6 sự kiện quan trọng trong funnel học tập và thiết lập funnel dashboard. Đảm bảo dữ liệu xuất hiện trong PostHog dashboard trong vòng 5 phút sau khi trigger event.

## Acceptance Criteria
- [ ] Track đủ 6 events: `exercise_submitted`, `simulation_loaded`, `explanation_started`, `quiz_started`, `quiz_completed`, `session_restored`
- [ ] Funnel dashboard hiển thị đúng số liệu trong vòng 5 phút sau khi event xảy ra

## Ghi chú kỹ thuật
- FE: PostHog JS SDK (`posthog-js`) — init trong `main.tsx`; gọi `posthog.capture(event, properties)` tại các điểm trong luồng (theo cấu trúc ADR-003)
- BE: Server-side capture cho events xảy ra ở backend (e.g., `quiz_completed`) dùng PostHog Node SDK — tránh mất event nếu user đóng tab
- Properties cần track: `{ user_id, session_id, subject, topic, simulation_id }` trong mọi event
- Environment: dùng PostHog project key từ env var `POSTHOG_API_KEY`
- Privacy: không track PII (email, tên) trong event properties — chỉ dùng anonymous `distinct_id`
