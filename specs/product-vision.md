# Product Vision — AI Study Simulator

> [!NOTE]
> **Trạng thái: tầm nhìn/kế hoạch MVP ban đầu (lịch sử).** Sản phẩm thực tế đã vượt phạm vi MVP này (thêm vai trò giáo viên/admin, lớp học, tạo đề & ngân hàng câu hỏi bằng AI, gamification). Một số chỉ tiêu/tính năng dưới đây (guest mode, SSE, teacher share QR) **chưa/không được triển khai đúng như mô tả**. Nguồn sự thật hiện hành: [../README.md](../README.md).

## Vấn đề cốt lõi

Học sinh THPT Việt Nam học Vật lý, Hóa học, Toán qua bài giải văn bản — không trực quan, khó hình dung hiện tượng. Kết quả: học vẹt, không hiểu bản chất.

## Giải pháp

**AI Study Simulator** là nền tảng học khoa học tự nhiên qua mô phỏng tương tác + AI giải thích bằng tiếng Việt.

1. Học sinh nhập bài tập (text hoặc ảnh chụp).
2. AI phân tích → xác định chủ đề → chọn simulation template phù hợp.
3. Simulation chạy trực quan với các tham số từ bài tập.
4. AI giải thích từng bước theo 4 lớp: Hiện tượng → Công thức → Áp dụng → Thử nghiệm.
5. Quiz MCQ tự sinh để kiểm tra hiểu bài.

## Mục tiêu MVP (4 tuần)

- 10 simulation templates (3 Vật lý + 2 Toán đồ thị + 2 Hóa + 2 Vật lý nâng cao + 1 Hình học)
- AI explanation SSE streaming, tiếng Việt, follow-up nhớ context
- Auth: Email/Password + Google OAuth + Guest mode
- Sample library: 30 bài mẫu có filter theo môn
- Session history: 20 session/user

## Chỉ số thành công

| Chỉ số | Mục tiêu |
|--------|---------|
| AI extraction accuracy | ≥ 85% trên test set 50 bài |
| Simulation FPS | ≥ 30 FPS |
| P95 latency (full flow) | < 8 giây (50 concurrent users) |
| Beta NPS | ≥ 30 |
| Học sinh nói "hiểu bài tốt hơn" | ≥ 4/6 |

## Người dùng mục tiêu

- **Học sinh THPT** (chủ yếu lớp 10–12) ôn thi, làm bài tập khó
- **Giáo viên** dùng Teacher Share Mode chiếu trong lớp hoặc gửi bài về nhà
