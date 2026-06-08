# ASS-033 — Performance Tuning — AI Pipeline
**Sprint:** 4  
**Owner:** Tech Lead  
**Status:** Todo  
**Branch:** feature/ASS-033-perf-ai

## Mô tả
Tối ưu AI pipeline để đạt p95 < 8 giây và không OOM khi có 50 concurrent users. Sử dụng Locust để load test và đo kết quả trước/sau khi tối ưu.

## Acceptance Criteria
- [ ] P95 latency `/analyze` + `/explain` < 8 giây dưới 50 concurrent users
- [ ] Không xảy ra OOM (Out of Memory) trong suốt load test
- [ ] Load test script Locust chạy được và report kết quả

## Ghi chú kỹ thuật
- Locust script: `scripts/load-test.py` (theo cấu trúc ADR-003); target 50 users, spawn rate 5/s, duration 5 phút
- Tune BullMQ concurrency: tăng worker concurrency từng bước (4 → 8 → 16) và đo throughput
- Claude prompt caching: cache system prompt bằng Anthropic prompt caching feature (thêm `cache_control: {type: "ephemeral"}` vào system message) — giảm input token cost và latency
- Monitor memory: `process.memoryUsage()` log mỗi 30s trong worker; alert nếu heapUsed > 1.5GB
- Baseline đo trước tối ưu, so sánh sau — document trong GitHub Issue
