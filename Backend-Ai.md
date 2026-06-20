# Backend AI – Learning Simulator Vật lí 11

Tài liệu này là điểm bàn giao cho người hoặc AI tiếp tục triển khai backend AI. Mục tiêu là chạy được luồng dữ liệu thật, có kiểm tra trước khi seed, truy hồi kiến thức từ PostgreSQL và giữ nguyên nội dung Vật lí trong dataset.

## 1. Phạm vi và nguyên tắc

- Backend: NestJS + TypeORM + PostgreSQL tại `src/backend`.
- Dataset chuẩn hiện tại: `src/database/data/all-in-one.learning-data.json`.
- Không sửa câu hỏi, công thức, đáp án hoặc kiến thức Vật lí trong JSON nếu không có yêu cầu biên tập rõ ràng.
- `validationStatus` là metadata; chỉ nhận: `draft`, `ai_generated`, `needs_review`, `solver_verified`, `human_verified`, `gold`.
- Retrieval hiện ưu tiên keyword phrase, sau đó fallback theo từng token. Chưa cần `pgvector`.
- `sourceData` trong entity giữ nguyên bản ghi JSON nguồn để backend có thể normalize mà không làm mất thông tin.

Luồng dữ liệu:

```text
all-in-one.learning-data.json
  -> TypeScript validation schema
  -> TypeORM upsert vào PostgreSQL
  -> TheoryChunk keyword retrieval
  -> /ai/analyze hoặc /ai/chat
  -> answer + simulation + references
```

## 2. Cấu trúc repo cần biết

```text
C2-App-107/
├─ Backend-Ai.md
├─ src/backend/
│  ├─ src/modules/ai/
│  ├─ src/modules/learning/
│  ├─ scripts/
│  ├─ docker-compose.yml
│  └─ .env
└─ src/database/
   ├─ data/
   │  ├─ all-in-one.learning-data.json
   │  ├─ theory-chunks.json
   │  ├─ problem-patterns.json
   │  ├─ learning-items.json
   │  ├─ ai-test-cases.json
   │  ├─ simulation-templates.json
   │  ├─ media-assets.json
   │  └─ manifest.json
   └─ migrations/
```

`LEARNING_DATASET_PATH` được ưu tiên nếu được cấu hình. Nếu chưa có, seed service thử lần lượt:

1. `../database/data/11/all-in-one.learning-data.json` (tương thích layout cũ/mới);
2. `../database/data/all-in-one.learning-data.json` (layout thực tế hiện tại).

Trong Docker, `src/database/data` được mount thành `/data`, vì vậy biến môi trường phải là:

```env
LEARNING_DATASET_PATH=/data/all-in-one.learning-data.json
```

## 3. Data contract

Payload tổng hợp phải có sáu mảng:

```ts
type LearningDataset = {
  manifest?: Record<string, unknown>;
  theoryChunks: TheoryChunk[];
  problemPatterns: ProblemPattern[];
  learningItems: LearningItem[];
  aiTestCases: AiTestCase[];
  simulationTemplates: SimulationTemplate[];
  mediaAssets: MediaAsset[];
};
```

### TheoryChunk

Required: `id`, `subject`, `grade`, `chapter`, `lessonId`, `topic`, `type`, `title`, `text`, `validationStatus`.

Được dùng cho retrieval/RAG. `text` là nguồn tri thức chính, `keywords` là tín hiệu hỗ trợ tìm kiếm.

### ProblemPattern

Required: `id`, `subject`, `grade`, `topic`, `title`, `description`, `validationStatus`.

`simulationId` là optional nhưng nếu có phải trỏ tới `simulationTemplates[].id`.

### LearningItem

Required: `id`, `subject`, `grade`, `chapter`, `lessonId`, `topic`, `title`, `text`, `patternId`, `validationStatus`.

- `patternId` bắt buộc trỏ tới `problemPatterns[].id`.
- `simulationId` optional; nếu có phải trỏ tới `simulationTemplates[].id`.
- `answer`, `parameters`, `target`, `concepts`, `skills` được seed theo dạng tương thích với entity cũ.

### AiTestCase

Required: `id`, `input`, `expected`, `validationStatus`.

- `expected.patternId` optional; nếu có phải tồn tại trong `problemPatterns`.
- `sourceLearningItemId` optional; nếu có phải tồn tại trong `learningItems`.

### SimulationTemplate và MediaAsset

`SimulationTemplate` cần `id`, `subject`, `grade`, `topic`, `title`, `engine`, `sceneType`, `validationStatus`.

`MediaAsset` cần `id`, `subject`, `grade`, `chapter`, `lessonId`, `title`, `type`, `path`, `validationStatus`.

Schema và các rule kiểm tra nằm tại:

```text
src/backend/src/modules/learning/learning-data.schema.ts
```

## 4. Validation trước seed

Script:

```text
src/backend/scripts/validate-learning-data.ts
```

Nó kiểm tra:

- file JSON parse được;
- đủ sáu collection;
- mỗi record là object và có các required field;
- ID không trùng trong từng collection;
- tất cả `validationStatus` hợp lệ;
- reference `LearningItem -> ProblemPattern`;
- reference optional `LearningItem -> SimulationTemplate`;
- reference optional `ProblemPattern -> SimulationTemplate`;
- reference optional `AiTestCase.expected.patternId -> ProblemPattern`;
- reference optional `AiTestCase.sourceLearningItemId -> LearningItem`.

Chạy:

```powershell
cd C2-App-107/src/backend
npm run validate:learning-data
```

Hoặc kiểm tra một file khác:

```powershell
node node_modules/ts-node/dist/bin.js scripts/validate-learning-data.ts D:\duong-dan\all-in-one.learning-data.json
```

Validator trả exit code `1` khi có lỗi. Seed service cũng chạy lại validation, nên không có trường hợp seed nửa chừng một dataset không hợp lệ.

## 5. Seed PostgreSQL

File triển khai:

```text
src/backend/src/modules/learning/learning-dataset-seed.service.ts
src/backend/scripts/seed-learning-data.ts
```

Thứ tự seed:

1. `simulation_templates`
2. `problem_patterns`
3. `theory_chunks`
4. `learning_items`
5. `ai_test_cases`
6. `media_assets`

Tất cả dùng TypeORM `upsert`, vì vậy có thể chạy lại an toàn theo ID. Seed không ghi đè JSON nguồn.

Lệnh:

```powershell
npm run seed:learning-data
```

Có thể truyền path rõ ràng:

```powershell
npm run seed:learning-data -- ..\database\data\all-in-one.learning-data.json
```

Endpoint tương đương:

```http
POST /learning/seed
```

Route cũ `POST /learning/seed/chapter1` vẫn còn để tương thích ngược, nhưng giờ seed dataset được cấu hình, không chỉ riêng Chương I.

## 6. Entity, migration và tương thích ngược

Các entity cũ được mở rộng bằng cột nullable, nên dữ liệu cũ vẫn hoạt động:

- `TheoryChunkEntity`: `lessonId`, `lessonTitle`, `validationStatus`, `sourceData`.
- `ProblemPatternEntity`: `validationStatus`, `sourceData`.
- `LearningItemEntity`: `lessonId`, `lessonTitle`, `source`, `validationStatus`, `sourceData`.
- `SimulationTemplateEntity`: `engine`, `sceneType`, `parameterSchema`, `supportedActions`, `validationStatus`, `sourceData`.

Entity mới:

```text
src/backend/src/modules/learning/ai-test-case/ai-test-case.entity.ts
src/backend/src/modules/learning/media-asset/media-asset.entity.ts
```

Migration PostgreSQL:

```text
src/database/migrations/1770000000000-learning-dataset-v11.ts
```

`app.module.ts` đang bật `synchronize: true` cho môi trường dev. Production cần chạy migration bằng pipeline TypeORM, sau đó tắt `synchronize`; không dựa vào sync schema trong production.

## 7. Retrieval và AI

### `/ai/analyze`

```http
POST /ai/analyze
Content-Type: application/json

{
  "message": "Giải thích dao động điều hòa",
  "subject": "physics",
  "grade": 11
}
```

`AiService` gọi `TheoryChunkService.searchForRag()`. Service này truy vấn bảng `theory_chunks` thật bằng `ILIKE`:

1. tìm exact phrase trên `title`, `text`, `topic`;
2. nếu không có, tách query theo token và gộp kết quả;
3. sau đó ưu tiên chunk cùng topic nếu phù hợp.

Không dùng mock data và chưa phụ thuộc pgvector. File liên quan:

```text
src/backend/src/modules/learning/theory-chunk/theory-chunk.service.ts
src/backend/src/modules/ai/ai.service.ts
```

Response có `references`; đây là các chunk đã lấy từ database. Khi mở rộng AI, luôn truyền các chunk này vào prompt trước khi dùng kiến thức ngoài dataset.

### `/ai/chat`

`POST /ai/chat` dùng cùng retrieval. Nếu `LLM_API_KEY` chưa cấu hình hoặc provider lỗi, backend trả fallback từ dữ liệu nội bộ thay vì throw lỗi cho frontend.

LLM env (không commit secret):

```env
LLM_API_KEY=
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.45
LLM_MAX_TOKENS=900
```

## 8. Kiểm thử sau seed

Script smoke test:

```text
src/backend/scripts/smoke-test-learning-data.ts
```

Chạy:

```powershell
npm run test:learning-data
```

Nó kiểm tra số bản ghi trong database và yêu cầu keyword search có kết quả cho:

- `dao động điều hòa`;
- `bước sóng`;
- `định luật Coulomb`.

Dataset hiện có số lượng kỳ vọng:

| Collection | Count |
| --- | ---: |
| TheoryChunk | 670 |
| ProblemPattern | 24 |
| LearningItem | 128 |
| AiTestCase | 125 |
| SimulationTemplate | 19 |
| MediaAsset | 122 |

TypeScript check không cần Nest CLI:

```powershell
node node_modules/typescript/bin/tsc --noEmit
```

## 9. Chạy local/Docker

`.env` local tối thiểu (dùng placeholder, không đưa credential thật vào tài liệu):

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<set-local-password>
DB_NAME=ai_mo_phong
PORT=3000
LEARNING_DATASET_PATH=../database/data/all-in-one.learning-data.json
```

Với Docker Desktop đang chạy:

```powershell
cd C2-App-107/src/backend
docker compose up -d postgres
npm run seed:learning-data
npm run test:learning-data
```

Hoặc chạy cả backend và database trong Docker:

```powershell
docker compose up --build
```

Sau khi seed, kiểm tra:

```http
GET  http://localhost:3000/learning/health
POST http://localhost:3000/learning/seed
POST http://localhost:3000/ai/analyze
POST http://localhost:3000/ai/chat
```

Swagger ở `http://localhost:3000/api`. Đây là đường dẫn Swagger, không phải global API prefix; route thực tế không có `/api` trừ khi người triển khai chủ động thêm prefix trong `main.ts`.

## 10. Checklist cho người/AI tiếp quản

1. Đọc `Backend-Ai.md`, `learning-data.schema.ts`, seed service và `AiService` trước khi sửa code.
2. Không tạo câu hỏi/đáp án Vật lí mới bằng script trừ khi được yêu cầu rõ và đánh dấu `validationStatus` phù hợp.
3. Mọi thay đổi dataset phải chạy `npm run validate:learning-data` trước.
4. Mọi migration mới phải backward compatible: cột nullable/default, không rename/drop cột đang dùng khi chưa có kế hoạch migrate dữ liệu.
5. Sau seed phải chạy `npm run test:learning-data`.
6. Nếu retrieval không tìm thấy chunk, kiểm tra database đã seed, query có keyword đúng, `isActive=true`, và field `text/title` có dữ liệu trước khi thêm embedding/vector.
7. Nếu seed lỗi `ECONNREFUSED 127.0.0.1:5432`, PostgreSQL/Docker chưa chạy; đó không phải lỗi JSON hay TypeScript.
8. Không commit `.env`, API keys, password hoặc dữ liệu cá nhân.

## 11. Hướng phát triển kế tiếp

- Viết unit test cho schema validator và keyword search.
- Thêm endpoint quản trị để xem validation report và seed history.
- Dùng pgvector chỉ khi keyword retrieval không còn đủ, nhưng vẫn giữ keyword retrieval làm fallback minh bạch.
- Bổ sung full-text index PostgreSQL (`GIN`/`tsvector`) trước khi dùng vector để cải thiện hiệu năng keyword search.
- Tạo bộ test `human_verified`/`gold` trước khi dùng đánh giá mô hình hoặc cho điểm học sinh.

## 12. Kết nối SQL/PostgreSQL từ đầu đến cuối

### 12.1. Cách khuyến nghị: để backend seed qua TypeORM

Đây là cách chuẩn. Không tự viết `INSERT` cho từng JSON record vì seed service đã xử lý:

- validate trước khi ghi;
- mapping schema dataset mới sang entity cũ;
- upsert theo primary key;
- lưu nguyên record nguồn trong `source_data`.

Điều kiện tối thiểu là PostgreSQL đang lắng nghe đúng host/port trong `.env`.

```powershell
cd C2-App-107/src/backend
npm run validate:learning-data
npm run seed:learning-data
npm run test:learning-data
```

Nếu PostgreSQL chạy bằng Docker:

```powershell
docker compose up -d postgres
docker compose ps
npm run seed:learning-data
```

`ECONNREFUSED 127.0.0.1:5432` nghĩa là DB chưa chạy hoặc sai `DB_HOST`/`DB_PORT`. Không phải lỗi của JSON.

### 12.2. Kết nối trực tiếp bằng `psql`

Các biến phải có trong `.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=<postgres-user>
DB_PASSWORD=<local-password>
DB_NAME=ai_mo_phong
```

Kiểm tra service PostgreSQL:

```powershell
pg_isready -h 127.0.0.1 -p 5432 -U <postgres-user>
psql "postgresql://<postgres-user>:<password>@127.0.0.1:5432/ai_mo_phong"
```

Nếu dùng container, mở SQL shell trong container:

```powershell
docker compose exec postgres psql -U <postgres-user> -d ai_mo_phong
```

Các truy vấn kiểm tra an toàn, chỉ đọc:

```sql
SELECT COUNT(*) FROM theory_chunks;
SELECT COUNT(*) FROM problem_patterns;
SELECT COUNT(*) FROM learning_items;

SELECT id, title, lesson_id
FROM theory_chunks
WHERE is_active = true
  AND (title ILIKE '%dao động điều hòa%' OR text ILIKE '%dao động điều hòa%')
LIMIT 5;

SELECT id, title, lesson_id
FROM theory_chunks
WHERE is_active = true
  AND text ILIKE '%bước sóng%'
LIMIT 5;

SELECT id, title, lesson_id
FROM theory_chunks
WHERE is_active = true
  AND text ILIKE '%định luật Coulomb%'
LIMIT 5;
```

Không cần và không nên dùng `psql` để import thẳng JSON trong giai đoạn này. Nếu bắt buộc import thủ công, phải map từng trường đúng với JSONB và vẫn chạy validator trước; điều đó dễ sai hơn seed TypeORM.

### 12.3. Các bảng được seed

| Dataset collection | PostgreSQL table | Primary key | Ghi chú |
| --- | --- | --- | --- |
| `theoryChunks` | `theory_chunks` | `id` | Nguồn retrieval/RAG |
| `problemPatterns` | `problem_patterns` | `pattern_id` | Dataset `id` được map sang `pattern_id` |
| `learningItems` | `learning_items` | `id` | Dataset `patternId`/`simulationId` được giữ |
| `simulationTemplates` | `simulation_templates` | `simulation_id` | Dataset `id` được map sang `simulation_id` |
| `aiTestCases` | `ai_test_cases` | `id` | Entity mới |
| `mediaAssets` | `media_assets` | `id` | Entity mới |

Các cột `source_data JSONB` là bản ghi JSON đầy đủ, để về sau có thể mở rộng schema mà không mất dữ liệu nguồn. Các trường JSON như `keywords`, `metadata`, `answer`, `parameters`, `target`, `expected`, `outputs` cũng được lưu bằng `JSONB`.

## 13. API contract: input, output và ví dụ gọi API

Mọi response thành công hiện đi qua `ResponseInterceptor`, nên payload thực tế được bọc theo cấu trúc:

```json
{
  "data": {},
  "message": "Thành công",
  "statusCode": 200
}
```

Frontend phải đọc `response.data.data`, không phải trực tiếp `response.data`.

### 13.1. Health và seed

```http
GET /learning/health
POST /learning/seed
POST /learning/seed/chapter1
```

Ví dụ output seed (nằm trong trường `data` của wrapper):

```json
{
  "message": "Learning dataset seeded successfully",
  "datasetPath": "D:/.../all-in-one.learning-data.json",
  "datasetId": "PHY11_STRUCTURED_MVP_26_LESSONS",
  "counts": {
    "theoryChunks": 670,
    "problemPatterns": 24,
    "learningItems": 128,
    "aiTestCases": 125,
    "simulationTemplates": 19,
    "mediaAssets": 122
  }
}
```

Ví dụ PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/learning/seed
Invoke-RestMethod -Method Get -Uri http://localhost:3000/learning/health
```

### 13.2. Theory retrieval API

```http
GET /learning/theory-chunks
GET /learning/theory-chunks?topic=oscillation
GET /learning/theory-chunks?q=dao%20động%20điều%20hòa
GET /learning/theory-chunks/rag/search?q=bước%20sóng
GET /learning/theory-chunks/:id
```

`q` dùng keyword search. `rag/search` trả tối đa năm chunk phù hợp, có ưu tiên topic khi topic được truyền vào.

### 13.3. Analyze API

Input:

```http
POST /ai/analyze
Content-Type: application/json

{
  "message": "Dao động điều hòa là gì?",
  "subject": "physics",
  "grade": 11
}
```

`message` là required string. `subject` và `grade` optional, mặc định `physics` và `11`.

Output `data` có dạng:

```json
{
  "intent": "explain",
  "subject": "physics",
  "topic": "simple_harmonic_motion",
  "confidence": 0.86,
  "analysis": {
    "concepts": ["..."],
    "skills": ["..."],
    "given": [],
    "target": [],
    "pattern_id": "PP_PHY11_SHM_IDENTIFY_PARAMETERS"
  },
  "answer": {
    "short_answer": "...",
    "steps": ["..."]
  },
  "simulation": {
    "simulation_id": "SIM_PHY11_SHM_BASIC_3D",
    "title": "...",
    "parameters": []
  },
  "render_blocks": [
    { "type": "answer_card" },
    { "type": "formula_card" },
    { "type": "theory_card" }
  ],
  "references": [
    { "id": "TH_PHY11_C01_L01_001", "title": "...", "source": "..." }
  ]
}
```

`references` là evidence lấy thật từ bảng `theory_chunks`. Không xem `confidence` là điểm chính xác học thuật; đó chỉ là heuristic routing hiện tại.

### 13.4. Chat API

Input:

```http
POST /ai/chat
Content-Type: application/json

{
  "message": "Bước sóng là gì?",
  "subject": "physics",
  "grade": 11,
  "context": [
    { "role": "user", "content": "Tôi đang học bài Sóng." }
  ]
}
```

Output `data` gồm `intent`, `topic`, `answer`, `used_llm`, `simulation` (nếu có) và `references`.

- `used_llm: true`: LLM provider đã được gọi thành công.
- `used_llm: false`: backend dùng fallback từ retrieved chunks/pattern. Đây là trạng thái hợp lệ, không phải server error.

### 13.5. Test bằng curl

```bash
curl -X POST http://localhost:3000/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"message":"định luật Coulomb là gì?","subject":"physics","grade":11}'

curl "http://localhost:3000/learning/theory-chunks/rag/search?q=định%20luật%20Coulomb"
```

## 14. Cách AI được triển khai hiện tại và cách mở rộng

### 14.1. Pipeline hiện tại

`AiService.analyze()` thực hiện theo trình tự:

1. validate DTO và chuẩn hóa `message`;
2. detect intent bằng rule-based (`solve`, `explain`, `simulate`...);
3. detect topic bằng keyword;
4. trích dữ kiện cơ bản, hiện có parser cho một số phương trình dao động;
5. tìm `ProblemPattern` theo topic, rồi theo keyword nếu topic không rõ;
6. lấy `SimulationTemplate` theo `simulationId`;
7. lấy `TheoryChunk` thật từ DB bằng `searchForRag`;
8. tạo câu trả lời rule-based hoặc đưa evidence + câu hỏi vào LLM;
9. trả answer, simulation và references cho frontend.

`AiService.chat()` dùng chung retrieval/pattern selection, nhưng thiên về trả lời hội thoại và giữ tối đa sáu message context gần nhất cho LLM.

### 14.2. Quy tắc triển khai AI tiếp theo

Khi thêm một tính năng AI, luôn giữ thứ tự ưu tiên:

```text
validated input
  -> deterministic solver/rule nếu có
  -> keyword retrieval từ DB
  -> LLM với evidence giới hạn
  -> fallback minh bạch nếu thiếu evidence hoặc LLM lỗi
```

Không để LLM tự tạo `patternId`, `simulationId`, số liệu kết quả, hoặc citation. Các ID phải lấy từ database; phép tính có thể kiểm chứng phải do solver code xử lý.

### 14.3. Các bước để mở rộng sang topic mới

1. Bổ sung `TheoryChunk`/`ProblemPattern`/`LearningItem` đã validate.
2. Thêm keyword/topic mapping vào `AiService.detectTopic()` nếu cần routing chính xác.
3. Thêm solver riêng nếu pattern cần tính toán.
4. Thêm/đăng ký `SimulationTemplate` nếu UI có mô phỏng tương ứng.
5. Thêm `AiTestCase` với status `draft`, sau đó nâng thành `human_verified` hoặc `gold` sau review.
6. Chạy validate, seed và smoke test.

### 14.4. Khi nào dùng embedding/pgvector

Chỉ thêm khi keyword search không đủ bao phủ synonym/câu hỏi dài. Khi thêm:

- giữ keyword exact phrase làm tier đầu tiên;
- thêm cột embedding và index vector bằng migration riêng;
- ghi version model embedding và thời điểm tạo embedding;
- retrieval hybrid: exact keyword > full-text > vector > rerank;
- không đưa toàn bộ database vào prompt; giới hạn top-k và trả references.

## 15. Deployment runbook

### Development local

```powershell
cd C2-App-107/src/backend
npm install
npm run validate:learning-data
docker compose up -d postgres
npm run seed:learning-data
npm run test:learning-data
npm run start:dev
```

### Production/CI

1. Cài dependency lockfile chính xác.
2. Đặt secret DB và LLM qua secret manager/environment, không dùng `.env` commit.
3. Chạy TypeScript/build/test.
4. Chạy migration có kiểm soát; tắt `synchronize: true`.
5. Validate dataset trong CI.
6. Seed bằng job một lần hoặc admin-only endpoint, không seed mỗi lúc app start.
7. Chạy smoke test sau seed/deploy.
8. Chỉ sau đó expose API cho frontend.

`POST /learning/seed` hiện hữu ích cho development. Trước production phải bảo vệ endpoint bằng authentication/role admin hoặc tắt route này, vì seed là thao tác ghi database.

### Observability tối thiểu

Log và đo các giá trị sau, tuyệt đối không log API key hoặc toàn bộ dữ liệu nhạy cảm của người dùng:

- request ID, route, latency, status code;
- số chunk retrieval được và ID chunk được chọn;
- `used_llm`, model, token/cost nếu provider cung cấp;
- validation failure count;
- seed counts và thời điểm seed;
- lỗi DB/LLM đã được sanitize.

## 16. Hiệu năng, index và bảo mật

Khi dữ liệu tăng, có thể thêm index PostgreSQL qua migration:

```sql
CREATE INDEX IF NOT EXISTS idx_theory_chunks_active_topic
  ON theory_chunks (is_active, topic);

CREATE INDEX IF NOT EXISTS idx_theory_chunks_lesson_id
  ON theory_chunks (lesson_id);
```

Với search text lớn, dùng full-text search PostgreSQL thay vì `%ILIKE%` thuần; vẫn phải xử lý tiếng Việt và benchmark trước khi thay đổi contract API.

Nguyên tắc bảo mật:

- không public endpoint seed ở production;
- giới hạn CORS theo domain frontend thật;
- rate-limit `/ai/analyze` và `/ai/chat`;
- đặt timeout/retry có giới hạn cho LLM;
- không gửi `source_data` nguyên khối cho frontend nếu không cần;
- xác thực role trước khi cho upload/replace dataset;
- backup DB trước migration destructively (tránh migration destructive nếu có thể).

## 17. Quy trình làm việc bắt buộc cho AI/maintainer

Trước khi sửa:

1. đọc schema, seed service và API contract ở tài liệu này;
2. xác nhận dataset path đang được dùng bằng `LEARNING_DATASET_PATH`;
3. không giả định database đã seed.

Sau khi sửa code/dataset:

1. `node node_modules/typescript/bin/tsc --noEmit`;
2. `npm run validate:learning-data`;
3. chạy migration nếu schema thay đổi;
4. `npm run seed:learning-data`;
5. `npm run test:learning-data`;
6. gọi thủ công `/ai/analyze` cho ít nhất ba query: `dao động điều hòa`, `bước sóng`, `định luật Coulomb`;
7. kiểm tra references trả về đến từ database và không bịa ID.

Nếu một bước fail, báo rõ output và không tuyên bố deploy/seed thành công.
- Thêm solver chuyên biệt cho các problem pattern có công thức, không để LLM tự tính toán khi có thể kiểm chứng bằng code.
