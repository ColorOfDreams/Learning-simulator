# Tài liệu Đặc tả Đầu vào/Đầu ra (I/O Spec) của AI Agent và Tích hợp RAG
> **Dự án:** AI Study Simulator (Mô phỏng Khoa học THPT + AI giải thích)  
> **Mục tiêu:** Tài liệu bàn giao (hand-off) kỹ thuật cho đội ngũ xây dựng RAG hoàn chỉnh.

---

## 1. Tổng quan Luồng AI Agent & RAG
Hệ thống AI Agent trong dự án đảm nhận 3 nhiệm vụ cốt lõi thông qua các API:
1. **Phân tích Đề bài & Đối chiếu Mô phỏng (`POST /analyze`)**: Nhận diện đề bài học tập tiếng Việt, trích xuất tham số, và ánh xạ tới 1 trong 15 phòng thí nghiệm ảo phù hợp.
2. **Hội thoại Trợ lý Học tập (`POST /explain` hoặc `POST /chat`)**: Nhận ngữ cảnh hội thoại kèm tài liệu lý thuyết RAG để phản hồi giải thích khoa học theo 4 tầng (Hiện tượng → Công thức → Áp dụng → Thử nghiệm).
3. **Sinh Câu hỏi trắc nghiệm (`POST /quiz/generate`)**: Tạo câu hỏi trắc nghiệm kiểm tra (MCQ) có độ khó tăng dần dựa trên chủ đề của phòng thí nghiệm hiện tại.

---

## 2. Đặc tả Chi tiết các API của AI Agent

### 2.1. API Phân tích Đề bài (`POST /analyze`)
* **Mục tiêu:** Trích xuất thực thể (Entity Extraction), nhận diện ý định (Intent Classification), phát hiện chủ đề (Topic Detection), và ánh xạ tới mã mô phỏng.

#### Đầu vào (Input)
* **Endpoint:** `/api/v1/analyze`
* **Format:** JSON
* **Trường dữ liệu:**
  ```json
  {
    "message": "Một vật dao động điều hòa có phương trình x = 5*cos(10*pi*t + pi/3) cm. Hãy tính chu kì và pha ban đầu của dao động?",
    "subject": "physics" // Optional: "physics" | "math" | "chem"
  }
  ```

#### Đầu ra (Output)
* **Format:** JSON
* **Trường dữ liệu trả về:**
  ```json
  {
    "intent": "solve_and_simulate", // Loại ý định: solve_and_simulate | simulate | explain | chat
    "subject": "physics",
    "topic": "simple_harmonic_motion", // Chủ đề trích xuất được
    "confidence": 0.86, // Độ tin cậy của mô hình
    "analysis": {
      "concepts": ["biên độ", "chu kỳ", "tần số góc", "pha ban đầu"],
      "skills": ["T", "phi"], // Tham số cần tìm
      "given": [ // Các đại lượng đã cho trong đề bài
        { "key": "A", "value": 5, "unit": "cm", "label": "Biên độ" },
        { "key": "omega", "value": "10π", "unit": "rad/s", "label": "Tần số góc" },
        { "key": "phi", "value": "π/3", "unit": "rad", "label": "Pha ban đầu" },
        { "key": "omega_numeric", "value": 31.416, "unit": "rad/s", "label": "Tần số góc dạng số" },
        { "key": "phi_numeric", "value": 1.047, "unit": "rad", "label": "Pha ban đầu dạng số" }
      ],
      "target": ["T"],
      "pattern_id": "SHM_FIND_PERIOD_FROM_EQUATION" // ID mẫu bài tập
    },
    "answer": {
      "short_answer": "Chu kì dao động là T = 0.2 s.",
      "steps": [
        "Từ phương trình dao động, ta xác định được tần số góc omega = 10π rad/s.",
        "Áp dụng công thức tính chu kì T = 2π / omega.",
        "Suy ra T = 2π / 10π = 0.2 s."
      ]
    },
    "simulation": { // Cấu hình mô phỏng tương ứng
      "simulation_id": "SIM-02",
      "title": "Dao động điều hòa con lắc lò xo",
      "parameters": [
        { "key": "A", "value": 5, "unit": "cm", "label": "Biên độ" },
        { "key": "omega", "value": 31.416, "unit": "rad/s", "label": "Tần số góc" },
        { "key": "phi", "value": 1.047, "unit": "rad", "label": "Pha ban đầu" }
      ]
    },
    "render_blocks": [
      { "type": "answer_card" },
      { "type": "formula_card" },
      { "type": "simulation_card" },
      { "type": "theory_card" }
    ],
    "references": [ // Các đoạn tài liệu RAG bổ trợ
      {
        "id": "theory_shm_01",
        "title": "Định nghĩa Dao động điều hòa",
        "text": "Dao động điều hòa là dao động trong đó li độ của vật là một hàm côsin (hoặc sin) của thời gian..."
      }
    ]
  }
  ```

---

### 2.2. API Trò chuyện & Giải thích Tích hợp RAG (`POST /explain` hoặc `/chat`)
* **Mục tiêu:** Trả lời các câu hỏi tự do hoặc giải thích chi tiết bài tập theo luồng RAG. Hỗ trợ phản hồi stream (SSE - Server-Sent Events) theo 4 tầng nội dung.

#### Đầu vào (Input)
* **Endpoint:** `/api/v1/explain` hoặc `/api/v1/chat`
* **Format:** JSON
* **Trường dữ liệu:**
  ```json
  {
    "session_id": "sess_abc123",
    "message": "Tại sao chu kỳ của con lắc đơn lại không phụ thuộc vào khối lượng vật?",
    "subject": "physics",
    "grade": 11,
    "simulationId": "SIM-08", // Cảnh ngữ cảnh mô phỏng hiện tại học sinh đang xem
    "context": [ // Lịch sử hội thoại (giới hạn 6 câu gần nhất để tối ưu token)
      { "role": "user", "content": "Khối lượng con lắc đơn ảnh hưởng thế nào?" },
      { "role": "assistant", "content": "Khối lượng không ảnh hưởng đến chu kỳ con lắc..." }
    ]
  }
  ```

#### Quy trình Xử lý của RAG (RAG Pipeline)
1. **Truy vấn Ngữ cảnh (Retrieval)**: Nhận `message` từ HS → Thực hiện Vector Search trong DB để tìm top 3-5 Theory Chunks có độ tương đồng cao nhất.
2. **Cấu trúc Prompt**: 
   - **System Prompt**: Chỉ định rõ vai trò AI (Trợ lý ảo phòng thí nghiệm), hướng dẫn ngôn ngữ (tiếng Việt tự nhiên, súc tích dưới 4-5 câu để hiển thị vừa vặn sidebar), và quy tắc không được dùng khối LaTeX phức tạp `\\[...\\]` hay `\\(...\\)` (ưu tiên dùng Unicode dạng `x = A*cos(w*t)` hoặc `v = ±ω√(A² - x²)`).
   - **User Prompt**: Kết hợp ngữ cảnh mô phỏng (`simulationId`), tài liệu RAG tìm được dưới dạng reference `[1]`, `[2]`, và câu hỏi hiện tại.

#### Đầu ra (Output)
Đối với SSE Stream, trả về các sự kiện theo tầng giải thích khoa học:
```http
event: layer
data: {"layer": "phenomenon", "text": "Khi ta thay đổi khối lượng quả nặng trên mô phỏng con lắc đơn, quỹ đạo dao động và thời gian đi hết một chu kỳ vẫn được giữ nguyên không đổi."}

event: layer
data: {"layer": "formula", "text": "Điều này được giải thích bằng công thức tính chu kỳ con lắc đơn: T = 2 * pi * sqrt(l / g)."}

event: layer
data: {"layer": "application", "text": "Trong công thức này, l là chiều dài dây, g là gia tốc trọng trường. Ta thấy hoàn toàn không có sự xuất hiện của đại lượng khối lượng m."}

event: layer
data: {"layer": "experiment", "text": "Hãy thử kiểm chứng trên mô phỏng: Bạn hãy tăng khối lượng quả nặng lên gấp đôi (m = 2kg) nhưng giữ nguyên chiều dài dây l = 1m. Bạn sẽ thấy chu kỳ T vẫn giữ nguyên ở mức ~2.01 giây!"}

event: done
data: {"message_id": "msg_xyz789"}
```

---

### 2.3. API Sinh Câu hỏi Trắc nghiệm khách quan (`POST /quiz/generate`)
* **Mục tiêu:** Sinh bộ câu hỏi trắc nghiệm kiểm tra nhanh kiến thức ngay sau khi học sinh tương tác với mô phỏng.

#### Đầu vào (Input)
* **Endpoint:** `/api/v1/quiz/generate`
* **Format:** JSON
* **Trường dữ liệu:**
  ```json
  {
    "simulationId": "SIM-01", // ID mô phỏng làm căn cứ tạo nội dung câu hỏi liên quan
    "subject": "chem",
    "count": 3 // Số lượng câu hỏi muốn sinh
  }
  ```

#### Đầu ra (Output)
* **Format:** JSON (Yêu cầu cấu trúc JSON hợp lệ tuyệt đối, không có văn bản thừa)
* **Trường dữ liệu trả về:**
  ```json
  {
    "simulationId": "SIM-01",
    "count": 3,
    "questions": [
      {
        "q": "Trong thí nghiệm điều chế ethyl acetate, vai trò chủ yếu của dung dịch H2SO4 đặc là gì?",
        "opts": [
          { "k": "a", "t": "Chất xúc tác và hút nước để dịch chuyển cân bằng" },
          { "k": "b", "t": "Chất oxi hóa sản phẩm phụ" },
          { "k": "c", "t": "Chất làm tăng nhiệt độ sôi của hỗn hợp" },
          { "k": "d", "t": "Dung môi hòa tan ester sinh ra" }
        ],
        "correct": "a",
        "explanation": "H2SO4 đặc vừa đóng vai trò chất xúc tác cho phản ứng ester hóa, vừa hút nước sinh ra giúp cân bằng chuyển dịch sang chiều thuận (tăng hiệu suất điều chế ethyl acetate)."
      }
    ],
    "used_llm": true
  }
  ```

---

## 3. Định dạng Dữ liệu RAG hỗ trợ Tìm kiếm (RAG Data Schemas)

Đơn vị xây dựng RAG cần chuẩn bị cơ sở dữ liệu Vector chứa hai bảng chính:

### 3.1. Bảng Lý thuyết Giáo khoa (`TheoryChunk`)
* **Mục tiêu:** Chứa kiến thức nền tảng sách giáo khoa GDPT 2018 (môn Lý/Hóa/Toán).
* **Schema đề xuất:**
  | Trường | Kiểu dữ liệu | Mô tả |
  | :--- | :--- | :--- |
  | `id` | VARCHAR(50) | Khóa chính (ví dụ: `theory_shm_01`) |
  | `subject` | VARCHAR(20) | Môn học (`physics`, `math`, `chem`) |
  | `topic` | VARCHAR(50) | Chủ đề học thuật (ví dụ: `resonance`, `ester`) |
  | `title` | VARCHAR(255)| Tiêu đề bài học/khái niệm |
  | `text` | TEXT | Nội dung kiến thức (cần được nhúng/embed thành vector) |
  | `metadata` | JSONB | Chứa thông tin bổ sung (lớp 10/11/12, chương, nguồn sách...) |

### 3.2. Bảng Nhận diện Dạng bài (`ProblemPattern`)
* **Mục tiêu:** Ánh xạ từ văn bản đề bài của học sinh sang công thức toán học và cấu hình mô phỏng.
* **Schema đề xuất:**
  | Trường | Kiểu dữ liệu | Mô tả |
  | :--- | :--- | :--- |
  | `pattern_id` | VARCHAR(50) | Khóa chính (ví dụ: `SHM_FIND_PERIOD_FREQUENCY`) |
  | `topic` | VARCHAR(50) | Ánh xạ chủ đề |
  | `name` | VARCHAR(255)| Tên dạng bài (tiếng Việt) |
  | `main_formula`| VARCHAR(255)| Công thức cốt lõi (Unicode/Plain text) |
  | `simulation_id`| VARCHAR(20) | Mã mô phỏng 3D tương ứng |
  | `target` | VARCHAR[] | Các tham số đầu ra cần tính (ví dụ: `['T', 'f']`) |
  | `metadata` | JSONB | Cấu hình tham số mặc định của mô phỏng |

---

## 4. Các Quy tắc Prompt & RAG quan trọng cần tuân thủ
1. **Định dạng công thức Toán học**: **KHÔNG dùng khối LaTeX lớn** như `$$...$$` hay `\\[...\\]` vì màn hình hiển thị trên thanh sidebar của học sinh khá hẹp (dễ bị vỡ dòng). Ưu tiên dùng ký tự Unicode chuẩn mực (`pi`, `omega`, `sqrt()`, các ký tự số mũ `A²`, `x²`).
2. **Ngắn gọn & Súc tích**: Phản hồi từ trợ lý học tập nên đi thẳng vào vấn đề, tối đa 4-5 câu để học sinh có thể vừa trò chuyện vừa quan sát phòng thí nghiệm tương tác ở trung tâm màn hình mà không cần cuộn trang nhiều.
3. **Liên hệ thực tiễn với Phòng Mô phỏng**: Gợi ý học sinh thay đổi thanh trượt thông số trong mô phỏng hiện tại để trực quan hóa hiện tượng vừa giải thích (ví dụ: *"Hãy kéo thanh trượt góc lệch lên 45 độ để kiểm chứng..."*).
