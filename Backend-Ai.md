# AI/RAG Backend — handoff cho Backend và Frontend

> Backend: `src/backend` · Stack: NestJS, TypeScript, TypeORM, PostgreSQL, pgvector.
>
> Source AI chính: `src/backend/src/modules/ai`. API chạy tại `http://localhost:3000`; Swagger ở `/api` chỉ là trang tài liệu, **không phải** API prefix.

## 1. Trạng thái và phạm vi hiện tại

Hai API ổn định để UI dùng là:

- `POST /ai/analyze`: nhận diện dạng bài, tính/rule-based khi có thể, chọn simulation và trả references.
- `POST /ai/chat`: chat dựa trên Hybrid RAG (vector + keyword), LLM nếu được cấu hình, hoặc fallback khi LLM/vector không khả dụng.

### Trạng thái bàn giao RAG cơ bản

Nền RAG đã hoàn thành để người khác có thể tiếp tục chủ yếu bằng cách chỉnh prompt hoặc mở rộng học liệu, không cần dựng lại hạ tầng:

- Docker chạy NestJS cùng PostgreSQL có `pgvector`; migration vector đã có.
- Dataset đã seed và embedding được cache trong `theory_chunks` qua `content_hash`, `embedding_model`, `embedding_version`, `embedded_at`. Script chỉ embed lại chunk có text thay đổi.
- `/ai/chat` kết hợp vector retrieval với keyword fallback. Nếu topic filter không có vector phù hợp, vector branch tự thử lại không khóa topic để tránh bỏ lỡ corpus do taxonomy lệch nhau.
- LLM có fallback dựa trên reference; thiếu key, lỗi LLM hoặc lỗi vector không làm API trả answer rỗng.
- UI test tĩnh tại `../simple-ai-test-frontend` dùng trực tiếp hai API thật, giữ session/context, hiển thị references và raw response.

Đã xác minh end-to-end trên Docker với câu hỏi tiếng Việt UTF-8 về con lắc đơn: `intent=explain`, `topic=simple_pendulum`, `used_llm=true`, answer không rỗng và vector retrieval trả references.

### Handoff nhanh cho AI/developer khác

Muốn đổi cách AI trả lời, đọc file này trước rồi ưu tiên sửa system/user prompt trong `AiService.generateLlmResponse()`; giữ nguyên contract `/ai/chat` và `/ai/analyze`. Có thể thay model/key qua `.env` (`LLM_*`, `EMBEDDING_*`). Khi thêm hoặc sửa theory chunks, chạy lại `npm run embed:theory` hoặc `docker compose exec backend npm run embed:theory`; các chunk không đổi sẽ tự skip.

Các route này không có `/api/v1`. Mọi HTTP response đều được `ResponseInterceptor` bọc theo dạng:

```json
{
  "data": {},
  "message": "Thành công",
  "statusCode": 200
}
```

Ngoài phạm vi hiện tại: evaluation/benchmark tự động, `/ai/explain` SSE, `/quiz/generate`, và lưu hội thoại vào database. `session_id` hiện chỉ được nhận và trả lại cho UI, không được persistence.

## 2. Kiến trúc runtime

### Bộ điều phối khóa LLM cho demo (18/11/2026)

`LlmService` nhận khóa hiện hành từ `LLM_API_KEY` và các khóa bổ sung từ
`LLM_API_KEYS` (mảng JSON, chỉ cấu hình ở backend). Khóa được loại trùng và phân
phối theo số lượt đang xử lý, luân phiên khi bằng nhau. Không gửi khóa ra frontend.

Giới hạn mặc định mỗi tiến trình: `LLM_MAX_CONCURRENT=8`,
`LLM_KEY_MAX_CONCURRENT=2`, `LLM_MAX_QUEUE=32`, `LLM_QUEUE_TIMEOUT_MS=3000`,
`LLM_MAX_REQUESTS_PER_MINUTE=30`. Thời hạn gọi bao gồm thời gian chờ admission.
401/403 loại khóa khỏi pool đến khi restart; tối đa một lần đổi khóa trong cùng
thời hạn. 429 làm toàn pool nghỉ theo Retry-After; không đổi khóa để vượt quota
chung. Lỗi mạng/5xx/timeout không tự gửi lại generation. Chưa có Redis dùng chung:
phải thêm điều phối phân tán trước khi chạy nhiều API replica với giới hạn tổng.
Chi tiết quyết định: `adrs/0006-llm-key-pool.md`.

```text
Frontend
  → POST /ai/analyze hoặc POST /ai/chat
  → AiService: intent/topic/pattern/simulation context
  → RagRetrievalService
      → vector search pgvector (nếu embedding sẵn sàng)
      → keyword search (luôn là fallback)
      → merge + rerank top 5
  → LlmService (nếu có LLM_API_KEY)
  → answer + simulation + references
  → Frontend render chat, theory cards và simulation controls
```

`/ai/analyze` giữ keyword/text retrieval để phần solver rule-based ổn định. `/ai/chat` dùng Hybrid RAG; vector lỗi, thiếu pgvector, thiếu embedding API key hoặc corpus chưa embed đều không làm request fail—hệ thống trả keyword results nếu có.

## 3. Chuẩn bị dữ liệu RAG

### 3.1 PostgreSQL và pgvector

RAG vector yêu cầu PostgreSQL có extension `pgvector`. `src/backend/docker-compose.yml` đã dùng image `pgvector/pgvector:pg15`, nên container PostgreSQL có sẵn extension cần thiết. Backend đợi database healthy trước khi khởi động.

Chạy migration thủ công từ `src/backend`:

```powershell
psql -h $env:DB_HOST -U $env:DB_USER -d $env:DB_NAME `
  -f src/database/migrations/001-add-pgvector-theory-chunks.sql
```

Khi chạy bằng Docker, migration đã được mount tại `/migrations` trong container PostgreSQL. Chạy một lần sau khi `docker compose up -d`:

```powershell
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /migrations/001-add-pgvector-theory-chunks.sql'
```

Migration thêm `embedding vector(1536)` cùng metadata model, version, hash và thời điểm tạo embedding cho `theory_chunks`.

### 3.2 Biến môi trường

```dotenv
# PostgreSQL
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=change-me
DB_NAME=ai_mo_phong

# LLM — OpenAI Chat Completions-compatible
LLM_API_KEY=
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.45
LLM_MAX_TOKENS=900

# Embedding — OpenAI Embeddings-compatible
EMBEDDING_API_KEY=
EMBEDDING_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# Trả thêm data.debug cho /ai/chat trong production khi cần chẩn đoán
AI_DEBUG=false
```

Không đưa `LLM_API_KEY` hoặc `EMBEDDING_API_KEY` ra frontend hay commit file `.env` thật.

### 3.3 Thứ tự lần đầu chạy bằng Docker

Từ `src/backend`:

```powershell
docker compose up -d --build
docker compose ps
```

Sau khi PostgreSQL healthy, chạy migration và seed ngay trong container:

```powershell
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /migrations/001-add-pgvector-theory-chunks.sql'
docker compose exec backend npm run seed:learning-data
docker compose exec backend npm run test:learning-data
```

Khi cần chạy backend trực tiếp ngoài Docker, có thể dùng các lệnh tương đương bên dưới.

Từ `src/backend`:

```powershell
npm run validate:learning-data
npm run seed:learning-data
npm run test:learning-data
```

Sau khi migration pgvector và `EMBEDDING_*` đã sẵn sàng:

```powershell
npm run embed:theory
```

Với Docker, chạy lệnh tương đương:

```powershell
docker compose exec backend npm run embed:theory
```

`embed:theory` chỉ tạo lại vector cho chunk mới hoặc có text thay đổi (dựa trên SHA-256 hash), nên an toàn để chạy lại. Lệnh này gọi API embedding và ghi DB; có thể phát sinh chi phí API.

## 4. Contract API cho frontend

### 4.1 `POST /ai/analyze`

Request:

```json
{
  "message": "Một vật dao động điều hòa có x = 5*cos(10*pi*t + pi/3) cm. Tính chu kì.",
  "subject": "physics",
  "grade": 11
}
```

`data` chứa `intent`, `subject`, `topic`, `confidence`, `analysis`, `answer`, `simulation` (nếu tìm thấy), `render_blocks` và `references`. `answer` có dạng `{ "short_answer": "...", "steps": [] }`.

UI nên dùng endpoint này cho ô “phân tích bài toán”, kết quả solver và mở simulation theo `simulation.simulation_id`.

### 4.2 `POST /ai/chat`

Request:

```json
{
  "session_id": "sess_abc123",
  "message": "Tại sao chu kì con lắc đơn không phụ thuộc khối lượng?",
  "subject": "physics",
  "grade": 11,
  "simulationId": "SIM_PHY11_PENDULUM_BASIC_3D",
  "context": [
    { "role": "user", "content": "Công thức chu kì là gì?" },
    { "role": "assistant", "content": "..." }
  ]
}
```

Quy tắc UI:

- `message` là câu hỏi mới; `context` chỉ gồm lịch sử trước đó. Backend chỉ dùng 6 messages gần nhất.
- `role` chỉ là `user` hoặc `assistant`.
- Gửi `simulationId` khi người dùng đang xem một mô phỏng để LLM có thể gợi ý thao tác đúng ngữ cảnh.
- `session_id` do frontend tạo/lưu để nối UI state; backend chưa lưu lịch sử theo id này.

Response `data`:

```json
{
  "intent": "explain",
  "subject": "physics",
  "grade": 11,
  "topic": "simple_pendulum",
  "session_id": "sess_abc123",
  "answer": "...",
  "used_llm": true,
  "simulation": {
    "simulation_id": "SIM_PHY11_PENDULUM_BASIC_3D",
    "title": "...",
    "parameters": []
  },
  "references": [
    {
      "id": "TC_PHY11_...",
      "title": "...",
      "text": "Nội dung theory chunk đầy đủ",
      "topic": "simple_pendulum",
      "source": "...",
      "metadata": {},
      "score": 0.82,
      "vectorScore": 0.89,
      "keywordScore": 0.61,
      "retrievalType": "hybrid"
    }
  ],
  "debug": {
    "retrievalTopK": 5,
    "referenceCount": 5,
    "hasVectorResults": true,
    "hasKeywordResults": true
  }
}
```

`debug` là optional: có ở non-production, hoặc production khi `AI_DEBUG=true`. UI không được phụ thuộc vào field này.

`references` luôn giữ `text` để UI dựng theory/source cards. `score`, `vectorScore`, `keywordScore` và `retrievalType` có thể không xuất hiện ở reference cũ hoặc kết quả không dùng nhánh tương ứng; UI cần render defensive.

## 5. Prompt và fallback của `/ai/chat`

Backend tự build prompt có cấu trúc rõ ràng: `SUBJECT`, `GRADE`, `TOPIC`, `SIMULATION_ID`, `REFERENCES`, `CONTEXT`, `QUESTION`. System prompt yêu cầu:

- trợ lý phòng thí nghiệm mô phỏng khoa học THPT;
- trả lời tiếng Việt ngắn gọn, dễ hiểu, khoảng 4–6 câu;
- ưu tiên theory chunks đã retrieve, không bịa nguồn hay chi tiết không có căn cứ;
- không dùng LaTeX (`$$...$$`, `\\[...\\]`, `\\(...\\)`); dùng plain text/Unicode như `T = 2*pi/ω`;
- khi có `simulationId`, liên hệ với mô phỏng và gợi ý thao tác phù hợp.

Fallback là behavior bình thường, không phải HTTP error:

| Tình huống | `used_llm` | `answer` |
| --- | --- | --- |
| LLM trả lời thành công | `true` | Nội dung từ LLM, đã được làm sạch LaTeX. |
| Thiếu `LLM_API_KEY` hoặc LLM lỗi, có references | `false` | Tóm tắt dựa trên theory chunk top-1. |
| Thiếu LLM và không có reference | `false` | Nói rõ chưa đủ dữ liệu trong tài liệu hiện tại và mời cung cấp câu hỏi/dữ kiện cụ thể hơn. |
| Vector/embedding lỗi | phụ thuộc LLM | Keyword retrieval vẫn được dùng; request không fail chỉ vì vector. |

## 6. Hướng dẫn dựng UI

1. Tạo một `session_id` ổn định cho mỗi phiên chat trong state/local storage.
2. Khi gửi, disable nút submit; gọi `/ai/chat`; unwrap `response.data` trước khi render.
3. Append message của người dùng và `data.answer` vào lịch sử UI. Lần gọi tiếp theo chỉ gửi tối đa 6 messages gần nhất làm `context`.
4. Hiển thị `used_llm=false` bằng UI trung tính như “Đang trả lời từ tài liệu học liệu”, không coi là lỗi.
5. Dựng `references` thành các theory cards có title, text, topic/source; ưu tiên `retrievalType`/score cho developer mode, không cần hiển thị cho học sinh.
6. Nếu có `simulation`, mở/chọn đúng simulation theo `simulation_id`, bind `parameters` với controls hiện có.
7. Không hiển thị `debug` cho học sinh và không hard-code `localhost` khi deploy; dùng biến môi trường `API_BASE_URL` ở frontend.

Ví dụ client tối giản:

```ts
const response = await fetch(`${API_BASE_URL}/ai/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: sessionId,
    message,
    subject: 'physics',
    grade: 11,
    simulationId: activeSimulationId,
    context: history.slice(-6),
  }),
});

const envelope = await response.json();
if (!response.ok) throw new Error(envelope.message ?? 'AI request failed');
const result = envelope.data;
```

### UI test độc lập

`../simple-ai-test-frontend` là trang HTML/CSS/JS không cần build, dùng để test trực tiếp cả `/ai/chat` lẫn `/ai/analyze`. Nó giữ `session_id` ở local storage, gửi tối đa 6 context messages, và render answer, references, retrieval score/debug cùng simulation context.

Chạy từ workspace root:

```powershell
python -m http.server 5173 --bind 127.0.0.1 --directory simple-ai-test-frontend
```

Mở `http://127.0.0.1:5173`, rồi bấm **Kiểm tra kết nối**. Backend Docker phải đang chạy ở `http://localhost:3000`.

## 7. Kiểm tra thủ công và type-check

Danh sách 10 test phủ Dao động, Sóng, Điện trường, Mạch điện và câu hỏi ngoài corpus nằm ở:

```text
src/backend/reports/manual-rag-smoke-tests.md
```

Smoke request chính:

```powershell
curl.exe -X POST "http://localhost:3000/ai/chat" `
  -H "Content-Type: application/json" `
  -d '{"session_id":"sess_smoke_001","message":"Tại sao chu kì con lắc đơn không phụ thuộc khối lượng?","subject":"physics","grade":11,"simulationId":"SIM_PHY11_PENDULUM_BASIC_3D","context":[]}'
```

Kỳ vọng: envelope hợp lệ, `data.answer` không rỗng, `references[].text` có mặt; nếu LLM có key thì `used_llm=true`, nếu không thì fallback vẫn trả answer.

Kiểm tra TypeScript:

```powershell
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.build.json
```

## 8. File nên xem khi phát triển tiếp

| Mục đích | File |
| --- | --- |
| API và orchestration | `src/backend/src/modules/ai/ai.service.ts` |
| HTTP client LLM | `src/backend/src/modules/ai/llm.service.ts` |
| Hybrid vector/keyword retrieval | `src/backend/src/modules/ai/rag-retrieval.service.ts` |
| Embedding client | `src/backend/src/modules/ai/embedding.service.ts` |
| Migration pgvector | `src/backend/src/database/migrations/001-add-pgvector-theory-chunks.sql` |
| Scripts seed/embed/validate | `src/backend/scripts/` |
| Manual smoke tests | `src/backend/reports/manual-rag-smoke-tests.md` |
