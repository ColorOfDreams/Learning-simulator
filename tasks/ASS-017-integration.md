# ASS-017 — Integration: Frontend ↔ Backend (Core Flow)
**Sprint:** 2  
**Owner:** Tech Lead  
**Status:** Todo  
**Branch:** feature/ASS-017-integration

## Mô tả
Xác minh luồng tích hợp đầu cuối giữa Frontend và Backend trên môi trường staging: từ nhập bài toán → phân tích AI → load simulation → nhận explanation qua SSE. Đảm bảo không có lỗi CORS, SSE hoạt động đúng trên mọi trình duyệt mục tiêu.

## Acceptance Criteria
- [ ] Full flow chạy hoàn chỉnh trên staging (không dừng giữa chừng)
- [ ] Không có console error trong DevTools khi chạy happy path
- [ ] SSE được xử lý đúng bằng `EventSource` (không dùng fetch streaming)

## Ghi chú kỹ thuật
- Verify thứ tự: `POST /analyze` → simulation component load → `GET /explain` SSE — schema theo `api-contracts.md`
- Kiểm tra CORS headers: `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials` đúng với domain staging
- Test matrix: Chrome (latest), Firefox (latest), Safari (latest) × Desktop
- Ghi lại kết quả test vào GitHub Issue để truy vết
- Nếu phát hiện bug, tạo issue mới với label `integration` và assign đúng owner
