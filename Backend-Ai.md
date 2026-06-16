# Backend AI - Learning Simulator

Tài liệu này ghi lại toàn bộ phần đã cập nhật cho luồng backend AI, dataset chương 1 Dao động Vật lí 11, LLM chat/fallback và frontend test tối giản.

Mục tiêu hiện tại:

- Seed được dataset thật của chương 1 vào backend.
- Chạy được luồng end-to-end để test nhanh: seed -> analyze -> chat.
- Ưu tiên dữ liệu nội bộ từ dataset, nhưng khi thiếu dữ liệu thì LLM được phép giải thích bằng kiến thức Vật lí 11 có kiểm soát.
- Không phụ thuộc frontend chính của dự án khi test.

---

## 1. Dataset đang dùng

Dataset chính trong repo:

```text
C2-App-107/src/database/data/learning_simulator_structured_chuong1/all-in-one.learning-data.json
```

Bản local ban đầu ở workspace ngoài repo:

```text
D:\LearnSimulator\data\learning_simulator_structured_chuong1/
```

Các file dataset quan trọng:

- `all-in-one.learning-data.json`: payload tổng hợp để seed/test.
- `theory-chunks.json`: mảnh lý thuyết cho RAG-lite.
- `problem-patterns.json`: dạng bài, công thức, mục tiêu, simulation id.
- `learning-items.json`: bài tập/ví dụ mẫu.
- `simulation-templates.json`: template mô phỏng 3D.
- `ai-test-cases.json`: bộ câu hỏi benchmark/demo.
- `media-assets.json`: reference ảnh, hiện chủ yếu là placeholder.

Dataset này tập trung vào chương 1 Dao động lớp 11:

- dao động cơ,
- dao động điều hòa,
- động học dao động `x-v-a`,
- năng lượng dao động,
- con lắc lò xo,
- con lắc đơn,
- dao động tắt dần,
- dao động cưỡng bức,
- cộng hưởng.

---

## 2. Backend NestJS chính

Backend chính nằm ở:

```text
C2-App-107/src/backend
```

### 2.1. Endpoint seed dataset

Đã thêm endpoint:

```http
POST /learning/seed/chapter1
```

File chính:

```text
src/backend/src/modules/learning/learning-dataset-seed.service.ts
src/backend/src/modules/learning/learning.controller.ts
src/backend/src/modules/learning/learning.module.ts
```

Service `LearningDatasetSeedService` đọc file `all-in-one.learning-data.json`, normalize dữ liệu và upsert vào các bảng hiện có:

- `simulation_templates`
- `theory_chunks`
- `problem_patterns`
- `learning_items`

Các normalize quan trọng:

- `simulationTemplates.defaultParameters` trong dataset có thể là object, backend cần array `{ key, label, value, unit? }`.
- `learningItems.answer.steps` trong dataset có thể là string array, backend cần object `{ step, content }`.
- `problemPatterns.solverKey` và `validationStatus` không có cột riêng, được giữ trong `metadata` khi phù hợp.
- `mainFormula` null được fallback thành `solverKey` hoặc `CONCEPTUAL_EXPLANATION`.

### 2.2. LearningModule

`LearningController` đã được đăng ký lại trong `LearningModule`, nên các endpoint sau có thể hoạt động:

```http
GET /learning/health
POST /learning/seed/chapter1
```

Trước đó file controller tồn tại nhưng chưa được khai báo trong module.

### 2.3. Simulation output type

File:

```text
src/backend/src/modules/learning/simulation-template/simulation-template.types.ts
```

`SimulationOutput` đã được nới để nhận thêm string, vì dataset mới có output như:

- `three_scene`
- `parameter_panel`
- `position_trace`
- `x_t_graph`

---

## 3. AI analyze và chat

File chính:

```text
src/backend/src/modules/ai/ai.service.ts
src/backend/src/modules/ai/ai.controller.ts
src/backend/src/modules/ai/ai.module.ts
src/backend/src/modules/ai/llm.service.ts
src/backend/src/modules/ai/dto/chat-request.dto.ts
```

### 3.1. Analyze endpoint

Endpoint có sẵn:

```http
POST /ai/analyze
```

Payload:

```json
{
  "message": "Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Xác định biên độ và pha ban đầu",
  "subject": "physics",
  "grade": 11
}
```

Kết quả mong đợi với câu trên:

```text
intent: solve_and_simulate
topic: simple_harmonic_motion
pattern: SHM_IDENTIFY_PARAMETERS
answer: Biên độ A = 2 cm, pha ban đầu phi = +π/2 rad.
simulation: SIM_SHM_BASIC_3D
references: TH_SHM_003, TH_SHM_014, TH_SHM_008, TH_SHM_015, TH_SHM_001
```

### 3.2. Chat endpoint

Đã thêm endpoint:

```http
POST /ai/chat
```

Payload:

```json
{
  "message": "Vì sao ở vị trí cân bằng vận tốc cực đại?",
  "subject": "physics",
  "grade": 11,
  "context": []
}
```

Response chính:

```json
{
  "intent": "explain",
  "subject": "physics",
  "grade": 11,
  "topic": "shm_kinematics",
  "answer": "...",
  "used_llm": true,
  "simulation": {},
  "references": []
}
```

`used_llm = true` nghĩa là LLM đã được gọi thành công.

`used_llm = false` nghĩa là backend fallback bằng dữ liệu nội bộ, thường do:

- chưa điền `LLM_API_KEY`,
- key sai,
- backend chưa restart sau khi sửa `.env`,
- LLM provider lỗi mạng/API.

### 3.3. Nhận diện topic/pattern

`AiService` đã được mở rộng để hiểu các topic mới của dataset:

- `mechanical_oscillation`
- `simple_harmonic_motion`
- `shm_kinematics`
- `shm_energy`
- `spring_oscillator`
- `simple_pendulum`
- `damped_oscillation`
- `forced_oscillation`
- `resonance`

Pattern ID mới được hỗ trợ:

- `SHM_IDENTIFY_PARAMETERS`
- `SHM_POSITION_AT_TIME`
- `SHM_FIND_PERIOD_FREQUENCY`
- `SHM_MAX_VELOCITY_ACCELERATION`
- `SHM_ENERGY_AT_POSITION`
- `SHM_ENERGY_FROM_VELOCITY`
- `SHM_ENERGY_RATIO`
- `SPRING_OSCILLATOR_PERIOD`
- `RESONANCE_CONDITION`

Vẫn giữ fallback cho một số ID cũ như:

- `SHM_FIND_PERIOD_FROM_EQUATION`
- `SHM_MAX_VELOCITY`
- `SHM_ENERGY_BASIC`

### 3.4. Parser phương trình

Parser hiện hỗ trợ cơ bản dạng:

```text
x = A cos(ωt + φ)
x = A cos(4πt + π/2) cm
x = A sin(...)
```

Nó trích xuất:

- `A`
- `omega`
- `omega_numeric`
- `phi`
- `phi_numeric`
- `t` nếu có dạng `t = ... s`

Lưu ý: parser vẫn là rule-based demo, không thay thế LLM. Các bài phức tạp sẽ cần LLM hoặc solver riêng.

---

## 4. LLM integration

LLM gọi theo chuẩn OpenAI-compatible Chat Completions bằng `fetch`, không cài thêm package.

File:

```text
src/backend/src/modules/ai/llm.service.ts
```

Biến môi trường:

```env
LLM_API_KEY=
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.45
LLM_MAX_TOKENS=900
```

Prompt LLM có các nguyên tắc:

- Trợ lý học Vật lí 11, chương Dao động.
- Ưu tiên dữ liệu nội bộ và dạng bài đã nhận diện.
- Nếu tài liệu nội bộ thiếu, được dùng kiến thức Vật lí 11 phổ thông.
- Khi suy luận ngoài dữ liệu nội bộ thì phải nói rõ.
- Không bịa nguồn.
- Không đi quá xa khỏi Vật lí 11.
- Giọng vui vừa phải, dễ hiểu.
- Nếu là bài tính: nhận dạng dữ kiện -> công thức -> thay số -> kết luận.
- Không dùng block LaTeX kiểu `\[...\]` hoặc `\(...\)`.
- Công thức nên viết bằng plain text/Unicode, ví dụ:

```text
v = ±ω√(A² - x²)
```

### 4.1. Clean công thức

Đã thêm clean output để tránh LLM trả công thức dạng:

```text
\[ v = \pm \omega \sqrt{A^2 - 0^2} = \pm \omega A \]
```

Backend/Frontend sẽ chuyển thành:

```text
v = ± ω √(A² - 0²) = ± ω A
```

File liên quan:

```text
src/backend/src/modules/ai/ai.service.ts
D:\LearnSimulator\simple-ai-test-frontend\script.js
D:\LearnSimulator\simple-ai-test-frontend\demo-backend.js
```

---

## 5. Environment

File:

```text
src/backend/.env
src/backend/.env.example
```

Các biến đã thêm:

```env
LEARNING_DATASET_PATH=../database/data/learning_simulator_structured_chuong1/all-in-one.learning-data.json
LLM_API_KEY=
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.45
LLM_MAX_TOKENS=900
```

Trong Docker Compose, backend container dùng path khác:

```env
LEARNING_DATASET_PATH=/data/learning_simulator_structured_chuong1/all-in-one.learning-data.json
```

Và mount:

```yaml
- ../database/data:/data:ro
```

File:

```text
src/backend/docker-compose.yml
```

---

## 6. Demo backend tạm thời

Vì máy hiện tại chưa có PostgreSQL local và Docker daemon chưa chạy, đã tạo một demo backend độc lập để test end-to-end ngay với data thật, không cần DB.

Lưu ý: demo backend này là công cụ local-only để test nhanh, không nằm trong phạm vi push lên Git.

File:

```text
D:\LearnSimulator\simple-ai-test-frontend\demo-backend.js
```

Chạy:

```bash
cd D:\LearnSimulator
node simple-ai-test-frontend\demo-backend.js
```

Server:

```text
http://localhost:3000
```

Endpoint demo:

```http
GET  /learning/health
POST /learning/seed/chapter1
POST /ai/analyze
POST /ai/chat
```

Demo backend đọc trực tiếp:

```text
C2-App-107/src/database/data/learning_simulator_structured_chuong1/all-in-one.learning-data.json
```

Nó cũng đọc key từ:

```text
C2-App-107/src/backend/.env
```

Lưu ý quan trọng:

- Demo backend chỉ dùng để unblock test frontend và luồng dữ liệu thật.
- Nó không ghi vào PostgreSQL.
- Khi Docker/Postgres đã chạy ổn, nên chuyển về Nest backend chính.

---

## 7. Frontend test độc lập

Frontend test nằm ngoài frontend chính:

```text
D:\LearnSimulator\simple-ai-test-frontend
```

Lưu ý: frontend test này chỉ để debug local, không commit/push lên nhánh `AI-data`.

Các file:

```text
index.html
styles.css
script.js
demo-backend.js
```

Mở trực tiếp:

```text
D:\LearnSimulator\simple-ai-test-frontend\index.html
```

Hoặc chạy static server:

```bash
cd D:\LearnSimulator\simple-ai-test-frontend
python -m http.server 5177
```

Sau đó mở:

```text
http://localhost:5177
```

Các nút trong UI:

- `Check backend`: kiểm tra backend ở `localhost:3000` và `localhost:3000/api`.
- `Seed chương 1`: gọi `POST /learning/seed/chapter1`.
- `Analyze`: gọi `POST /ai/analyze`.
- `Chat LLM`: gọi `POST /ai/chat`.

Frontend test có xử lý:

- hiển thị lỗi fetch rõ hơn,
- tự nhận biết prefix `/api`,
- render công thức dễ đọc hơn,
- không đụng vào frontend chính tại `src/frontend`.

---

## 8. Cách chạy end-to-end hiện tại

### Cách nhanh bằng demo backend

1. Chạy demo backend:

```bash
cd D:\LearnSimulator
node simple-ai-test-frontend\demo-backend.js
```

2. Mở frontend test:

```text
D:\LearnSimulator\simple-ai-test-frontend\index.html
```

3. Bấm `Check backend`.

4. Bấm `Seed chương 1`.

5. Test `Analyze` với:

```text
Một vật dao động điều hòa có phương trình x = 2cos(4πt + π/2) cm. Xác định biên độ và pha ban đầu
```

6. Test `Chat LLM` với:

```text
Vì sao ở vị trí cân bằng vận tốc cực đại?
```

### Cách bằng Nest backend thật

Cần PostgreSQL hoặc Docker.

Nếu dùng Docker:

```bash
cd D:\LearnSimulator\C2-App-107\src\backend
docker compose up --build
```

Sau khi backend chạy:

```http
POST http://localhost:3000/learning/seed/chapter1
POST http://localhost:3000/ai/analyze
POST http://localhost:3000/ai/chat
```

Nếu backend có global prefix `/api`, dùng:

```http
POST http://localhost:3000/api/learning/seed/chapter1
POST http://localhost:3000/api/ai/analyze
POST http://localhost:3000/api/ai/chat
```

---

## 9. Lỗi thường gặp

### 9.1. Failed to fetch

Nguyên nhân thường là:

- backend chưa chạy,
- sai Backend URL,
- sai prefix `/api`,
- CORS bị chặn,
- port 3000 chưa mở.

Cách kiểm:

```http
GET http://localhost:3000/learning/health
GET http://localhost:3000/api/learning/health
```

Trong frontend test, bấm `Check backend`.

### 9.2. Seed lỗi

Kiểm tra:

- `LEARNING_DATASET_PATH` đúng chưa.
- File `all-in-one.learning-data.json` có tồn tại không.
- Nếu chạy Docker, đã mount `../../../data:/data:ro` chưa.

### 9.3. LLM không chạy

Kiểm tra:

- `.env` đã có `LLM_API_KEY` chưa.
- Backend đã restart sau khi sửa `.env` chưa.
- `LLM_BASE_URL` đúng provider chưa.
- Response có `used_llm: true` không.

### 9.4. Công thức hiện kiểu `\[...\]`

Đã thêm clean/render để xử lý. Nếu vẫn thấy ở raw JSON thì kiểm tra:

- demo backend đã restart chưa,
- frontend đã refresh cache chưa,
- đang xem raw debug JSON hay answer card chính.

---

## 10. Kiểm chứng đã chạy

Đã chạy TypeScript check:

```bash
node node_modules\typescript\lib\tsc.js --noEmit -p tsconfig.build.json
```

Kết quả: pass.

Nest CLI build chưa chạy được trong môi trường hiện tại vì `node_modules`/Yarn state bị lỗi:

```text
Cannot find module 'string-width'
```

Và `corepack yarn install --immutable` từng bị timeout.

Điều này là vấn đề môi trường dependency, không phải lỗi TypeScript của phần AI vừa sửa.

---

## 11. Các file đã thêm/sửa chính

Backend Nest:

```text
src/backend/src/modules/learning/learning-dataset-seed.service.ts
src/backend/src/modules/learning/learning.controller.ts
src/backend/src/modules/learning/learning.module.ts
src/backend/src/modules/learning/simulation-template/simulation-template.types.ts
src/backend/src/modules/ai/ai.service.ts
src/backend/src/modules/ai/ai.controller.ts
src/backend/src/modules/ai/ai.module.ts
src/backend/src/modules/ai/llm.service.ts
src/backend/src/modules/ai/dto/chat-request.dto.ts
src/backend/.env.example
src/backend/docker-compose.yml
```

Demo/frontend test local-only, không push:

```text
D:\LearnSimulator\simple-ai-test-frontend\index.html
D:\LearnSimulator\simple-ai-test-frontend\styles.css
D:\LearnSimulator\simple-ai-test-frontend\script.js
D:\LearnSimulator\simple-ai-test-frontend\demo-backend.js
```

Dataset copy trong repo:

```text
src/database/data/learning_simulator_structured_chuong1/
```

---

## 12. Ghi chú cho người/AI làm tiếp

1. Ưu tiên giữ dataset là nguồn thật, không hardcode từng câu hỏi.

2. `ai-test-cases.json` chỉ là benchmark/demo. Hệ thống không nên yêu cầu câu hỏi phải trùng y hệt test case mới trả lời.

3. Với câu hỏi mới:

- tìm topic,
- tìm pattern,
- tìm theory chunks,
- nếu đủ thì trả lời từ dữ liệu nội bộ,
- nếu thiếu thì gọi LLM với ràng buộc chương Dao động Vật lí 11.

4. Demo backend chỉ là cầu tạm khi không có DB. Khi production hóa, đưa hết về Nest backend + PostgreSQL.

5. Nên bổ sung solver riêng cho các dạng bài hay gặp:

- `SHM_IDENTIFY_PARAMETERS`
- `SHM_FIND_PERIOD_FREQUENCY`
- `SHM_POSITION_AT_TIME`
- `SHM_MAX_VELOCITY_ACCELERATION`
- `SHM_ENERGY_AT_POSITION`
- `RESONANCE_CONDITION`

6. Nên bổ sung retrieval tốt hơn:

- pgvector/embedding,
- ranking theo topic + keyword + source,
- trả evidence text rõ hơn cho frontend.

7. Các media asset hiện vẫn là reference, chưa có ảnh thật trong workspace.

8. Nếu dùng Docker, nhớ Docker Desktop phải chạy trước. Hiện máy đã từng báo không kết nối được Docker daemon.
