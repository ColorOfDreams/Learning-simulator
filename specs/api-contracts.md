# API Contracts — AI Study Simulator
> Single Source of Truth cho FE ↔ BE giao tiếp. Mọi thay đổi phải tạo PR riêng, tag Tech Lead review.

**Base URL:** `/api/v1`
**Auth header:** `Authorization: Bearer <jwt_token>` (trừ endpoint Guest-allowed)

---

## POST /analyze
**Mô tả:** Phân tích bài tập, trả simulation config.
**Auth:** Optional (Guest allowed)

**Request:**
```json
{
  "text": "Một vật chuyển động thẳng đều với v = 5 m/s. Quãng đường sau 10s?"
}
```
  
**Response 200:**
```json
{
  "subject": "physics",
  "topic": "uniform_motion",
  "simulation_id": "SIM-01",
  "parameters": [
    { "key": "v", "value": 5, "unit": "m/s", "label": "Vận tốc" },
    { "key": "t", "value": 10, "unit": "s", "label": "Thời gian" }
  ],
  "confidence": 0.92,
  "session_id": "sess_abc123"
}
```

**Response 200 (out of scope):**
```json
{
  "confidence": 0.45,
  "message": "Bài này ngoài phạm vi hỗ trợ hiện tại.",
  "session_id": null
}
```

**Response 429:** Rate limit (Guest > 3 session/ngày)
```json
{ "error": "RATE_LIMIT_EXCEEDED", "message": "Bạn đã dùng hết 3 lượt miễn phí hôm nay. Đăng ký để dùng không giới hạn." }
```

---

## POST /explain
**Mô tả:** SSE stream AI explanation theo 4 lớp.
**Auth:** Optional (Guest allowed)
**Content-Type response:** `text/event-stream`

**Request:**
```json
{
  "session_id": "sess_abc123",
  "message": "Giải thích tại sao vật lại đạt vận tốc đó?",
  "context": []
}
```

**SSE Events:**
```
event: layer
data: {"layer": "phenomenon", "text": "Vật đang..."}

event: layer
data: {"layer": "formula", "text": "Áp dụng công thức $v = \\frac{s}{t}$..."}

event: layer
data: {"layer": "application", "text": "Với v = 5 m/s và t = 10s..."}

event: layer
data: {"layer": "experiment", "text": "Thử tăng v lên 10 m/s, bạn thấy gì?"}

event: done
data: {"message_id": "msg_xyz"}
```

**Error event:**
```
event: error
data: {"code": "LLM_TIMEOUT", "message": "AI đang bận, vui lòng thử lại."}
```

---

## POST /quiz/generate
**Auth:** Optional (Guest allowed)

**Request:**
```json
{ "session_id": "sess_abc123" }
```

**Response 200:**
```json
{
  "quiz_id": "quiz_001",
  "questions": [
    {
      "id": "q1",
      "text": "Quãng đường vật đi được là bao nhiêu?",
      "options": ["40 m", "50 m", "60 m", "70 m"],
      "correct_index": 1,
      "difficulty": 1,
      "explanation": "Áp dụng s = v × t = 5 × 10 = 50 m"
    }
  ]
}
```

---

## POST /quiz/answer
**Auth:** Required

**Request:**
```json
{
  "quiz_id": "quiz_001",
  "answers": [{ "question_id": "q1", "selected_index": 1 }]
}
```

**Response 200:**
```json
{
  "score": 1,
  "total": 1,
  "results": [{ "question_id": "q1", "correct": true }]
}
```

---

## GET /library
**Auth:** Optional
**Query:** `?subject=physics&topic=motion&q=chuyển+động`

**Response 200:**
```json
{
  "items": [
    {
      "id": "lib_001",
      "subject": "physics",
      "topic": "uniform_motion",
      "title": "Chuyển động thẳng đều cơ bản",
      "text": "...",
      "simulation_id": "SIM-01",
      "thumbnail_url": "/thumbnails/sim-01.png",
      "parameters": []
    }
  ],
  "total": 30
}
```

---

## GET /history
**Auth:** Required

**Response 200:**
```json
{
  "sessions": [
    {
      "session_id": "sess_abc123",
      "subject": "physics",
      "topic": "uniform_motion",
      "simulation_id": "SIM-01",
      "thumbnail_url": "/thumbnails/sim-01.png",
      "created_at": "2026-06-08T10:00:00+07:00",
      "message_count": 5
    }
  ]
}
```

---

## POST /sessions/:id/share
**Auth:** Required (Teacher only — role check)

**Response 200:**
```json
{
  "share_url": "https://app.example.com/share/abc123",
  "qr_code_url": "data:image/png;base64,..."
}
```

---

## POST /auth/register
**Request:**
```json
{ "email": "student@example.com", "password": "SecurePass123!" }
```
**Response 201:**
```json
{ "access_token": "...", "refresh_token": "...", "user": { "id": "u1", "email": "...", "role": "student" } }
```

---

## POST /auth/login
**Request:**
```json
{ "email": "student@example.com", "password": "SecurePass123!" }
```
**Response 200:** same as register

---

## POST /auth/google
**Request:**
```json
{ "code": "<google_oauth_code>" }
```
**Response 200:** same as register

---

## POST /auth/refresh
**Request:**
```json
{ "refresh_token": "..." }
```
**Response 200:**
```json
{ "access_token": "...", "refresh_token": "..." }
```

---

## GET /healthcheck
**Response 200:**
```json
{ "status": "ok", "db": "connected", "redis": "connected", "timestamp": "2026-06-08T10:00:00Z" }
```

---

## Error Format (chuẩn chung)
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message in Vietnamese",
  "details": {}
}
```

**HTTP Status codes:**
- 400 Bad Request — validation error
- 401 Unauthorized — missing/invalid token
- 403 Forbidden — insufficient role
- 429 Too Many Requests — rate limit
- 500 Internal Server Error
