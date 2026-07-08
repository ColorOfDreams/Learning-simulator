# AI Study Simulator — Demo Day

## Tóm tắt sản phẩm (thẻ Demo Day)

**AI Study Simulator** là nền tảng học Vật lý – Hóa học – Toán THPT, nơi học sinh học qua **mô phỏng thí nghiệm 3D tương tác** kèm **trợ lý AI (RAG)** giải thích lý thuyết và gợi ý mô phỏng đúng ngữ cảnh; giáo viên dùng AI để tạo đề thi/ngân hàng câu hỏi và quản lý lớp học, còn học sinh được tạo động lực bằng hệ thống gamification (XP/level/streak).

---

## Bài toán

Học sinh THPT học Vật lý – Hóa – Toán chủ yếu qua lý thuyết và công thức trừu tượng, ít được **trực quan hóa hiện tượng** (dao động, sóng, điện trường, phản ứng hóa học…) vì thí nghiệm thật tốn kém, nguy hiểm hoặc không có điều kiện tại trường. Khi bí, các em thường tra Google hoặc hỏi chatbot chung chung — nhưng câu trả lời **không bám sát chương trình SGK Việt Nam**, dễ "bịa" nguồn và không gắn với một thí nghiệm cụ thể để tự khám phá.

Về phía giáo viên: việc soạn đề, xây ngân hàng câu hỏi và theo dõi tiến độ từng học sinh tốn nhiều thời gian thủ công.

Bài toán đặt ra: xây một nền tảng vừa **cho học sinh "nhìn thấy và điều chỉnh" hiện tượng khoa học**, vừa có **trợ lý AI trả lời đúng học liệu Việt Nam**, đồng thời **giảm tải cho giáo viên** — tất cả trong một sản phẩm web dùng được ngay trên trình duyệt.

## Giải pháp kỹ thuật

Nền tảng web full-stack với 3 vai trò (Học sinh / Giáo viên / Quản trị), phân quyền bằng JWT.

### Mô phỏng tương tác (Frontend)

- Hơn **50+ mô phỏng** dựng bằng **Three.js/React**: Vật lý (động học, ném xiên, con lắc, dao động điều hòa/tắt dần/cộng hưởng, sóng, giao thoa, điện trường, mạch điện, từ trường/cảm ứng, hạt nhân…), Hóa học lớp 10–11–12 (phản ứng, thử màu ngọn lửa, tốc độ phản ứng, nhận biết ion…), và Toán.
- Học sinh chỉnh tham số trực tiếp và quan sát hiện tượng thay đổi theo thời gian thực; các mô phỏng dùng chung pattern (`GenericChemSimulation`, `GenericMathSimulation`) + `registry` để dễ mở rộng.
- Frontend: **React + UmiJS (Umi v4), Ant Design v5, KaTeX**.

### Trợ lý AI theo kiến trúc RAG (Backend)

- **NestJS + TypeORM + PostgreSQL + pgvector**. Học liệu được chia thành `theory_chunks`, embedding và cache theo `content_hash` (chỉ embed lại chunk thay đổi).
- Hai API chính:
  - `POST /ai/analyze` — nhận diện dạng bài, giải rule-based khi có thể, chọn mô phỏng phù hợp và trả về references.
  - `POST /ai/chat` — **Hybrid RAG** (vector search pgvector + keyword fallback → merge & rerank top-5) rồi đưa qua LLM (**Mistral**, cấu hình OpenAI-compatible) để trả lời tiếng Việt bám theo học liệu đã truy hồi. Có gắn `simulationId` để AI gợi ý thao tác đúng mô phỏng đang xem.
- **Thiết kế fallback nhiều lớp**: thiếu API key, lỗi LLM, hoặc lỗi vector đều **không làm request fail** — hệ thống vẫn trả lời từ theory chunk hoặc keyword retrieval. Ổn định là ưu tiên hàng đầu.

### Công cụ cho giáo viên & gamification

- Backend module: `classrooms`, `exams`, `question-bank`, `question-types`, `grades`, `analytics`, `notifications` — hỗ trợ tạo lớp, sinh đề/câu hỏi bằng AI (`generateQuiz`), chấm và theo dõi.
- **Gamification**: XP theo độ khó bài (Cơ bản/Trung bình/Nâng cao), công thức level `floor(sqrt(xp/100))+1`, streak theo ngày, badge và bảng xếp hạng — toàn bộ chạy trên dữ liệu thật.

### Hạ tầng

- Docker Compose cho dev local; **Railway** cho production (service backend/frontend/Postgres tách riêng, build qua `Dockerfile.railway`); GitHub Actions CI. Postgres production cài sẵn `pgvector`; TypeORM `synchronize` tự đồng bộ schema.

## Tính khả thi

- **Đã chạy end-to-end, không chỉ là ý tưởng**: đã verify runtime trên Docker — boot sạch, seed hàng trăm theory chunks, `/ai/chat` trả `used_llm:true` qua Mistral với câu hỏi tiếng Việt UTF-8, vector retrieval trả references thật. Đã deploy được lên Railway.
- **Chi phí thấp**: dùng Mistral (rẻ hơn GPT-4) và kiến trúc có fallback nên vận hành được cả khi hết quota API; mô phỏng chạy hoàn toàn phía client nên không tốn compute server.
- **Kiến trúc dễ mở rộng**: thêm mô phỏng mới chỉ cần cập nhật 3 điểm (component + registry + metadata AI); thêm học liệu chỉ cần seed chunk rồi chạy lại `embed:theory` (tự skip chunk không đổi).
- **Đúng chương trình VN**: nội dung bám SGK, trả lời tiếng Việt, đã phủ nhiều chương của cả 3 môn.

## Hướng phát triển

- **Nâng chất lượng RAG**: hiện vector search bị giới hạn do embedding Mistral 1024 chiều lệch với cột `vector(1536)` nên nhiều truy vấn rơi về keyword fallback → chuyển sang embedding 1536-chiều (OpenAI-compatible) để bật vector search thật, tăng độ chính xác.
- **Mở rộng độ sâu mô phỏng**: một số scene 3D còn map xấp xỉ (nhiều dao động quy về "lò xo"); phát triển render riêng cho đồ thị, so pha, cộng hưởng để mô phỏng đúng đặc thù từng hiện tượng.
- **Phủ hết chương trình THPT** cả 3 khối lớp và bổ sung học liệu tương ứng.
- **Cá nhân hóa & lưu hội thoại**: hiện `session_id` chưa được persist — thêm lưu lịch sử chat, gợi ý lộ trình học theo điểm yếu, và phân tích tiến độ sâu hơn cho giáo viên.
- **Tính năng lớp học nâng cao**: giao bài theo mô phỏng, chấm tự động, báo cáo lớp, thông báo real-time.
