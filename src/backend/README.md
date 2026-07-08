# AI Study Simulator — Backend (NestJS + PostgreSQL/pgvector)

Backend của **AI Study Simulator**, dùng **NestJS 11** kiến trúc **Monolithic** phân tầng (Controller → Service → Repository), **PostgreSQL + pgvector** qua **TypeORM**, generic CRUD kế thừa `BaseController`/`BaseService`, tài liệu API tự sinh bằng **Swagger**, và module **AI/RAG** (Mistral) cho trợ lý học tập.

> Tương thích với frontend UmiJS ở `src/frontend` qua hook `useInitModel`. Xem [README tổng](../../README.md).

## 📦 Yêu cầu hệ thống
- Node.js >= 18
- **Yarn**
- PostgreSQL có extension **`pgvector`** (image `pgvector/pgvector:pg15` qua Docker Compose)

## 🛠️ Cài đặt & Chạy dự án

### Cách A — Docker Compose (khuyến nghị, có sẵn pgvector)

```bash
docker compose up -d --build
docker compose ps        # đợi postgres healthy

# migration pgvector (một lần)
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /migrations/001-add-pgvector-theory-chunks.sql'

# seed học liệu + (tùy chọn) sinh embedding
docker compose exec backend npm run seed:learning-data
docker compose exec backend npm run embed:theory
```

### Cách B — Chạy trực tiếp

```bash
yarn install
yarn run start:dev       # dev mode hot-reload
```

**Cấu hình `.env`** (các nhóm chính):
```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ai_mo_phong
PORT=3000

# Auth
JWT_SECRET=super_secret_key_change_me_in_production
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# AI/RAG (OpenAI-compatible; đổi provider qua .env).
# Mặc định code nếu trống: https://api.openai.com/v1 + gpt-4o-mini.
# Cấu hình thực tế dùng Mistral cho LLM (ví dụ):
LLM_API_KEY=
LLM_BASE_URL=https://api.mistral.ai/v1
LLM_MODEL=mistral-small-latest
EMBEDDING_API_KEY=
EMBEDDING_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536
```

> [!IMPORTANT]
> TypeORM bật `synchronize: true` (mọi môi trường). Bảng được tự tạo/đồng bộ theo Entity khi khởi động — không cần tạo bảng tay.

## 🤖 Module AI/RAG

Trợ lý AI dùng **Hybrid RAG** (vector pgvector + keyword fallback → rerank top-5) trên bảng `theory_chunks`, rồi gọi **Mistral** sinh câu trả lời tiếng Việt. API chính: `POST /ai/analyze`, `POST /ai/chat`, `POST /ai/quiz/generate`.

📖 Contract, prompt, fallback và cách chuẩn bị dữ liệu RAG: **[Backend-Ai.md](../../Backend-Ai.md)**. File chính: `src/modules/ai/{ai,llm,rag-retrieval,embedding}.service.ts`.

## 📖 Swagger API Docs
Sau khi chạy server, truy cập Swagger UI tại: [http://localhost:3000/api](http://localhost:3000/api)

> Lưu ý: **không có prefix `/api/v1`**; `/api` chỉ là trang Swagger. Mọi response được `ResponseInterceptor` bọc dạng `{ data, message, statusCode }`.

## 🏗 Hướng dẫn tạo module CRUD mới bằng Base Controller/Service
Thay vì viết lại CRUD cho từng thực thể, bạn chỉ cần kế thừa `BaseController` và `BaseService`.

**1. Tạo Entity (`student.entity.ts`):**
```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';

@Entity('students')
export class StudentEntity extends BaseEntity {
  @Column()
  name: string;
}
```

**2. Tạo Service (`student.service.ts`):**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../core/base/base.service';
import { StudentEntity } from './student.entity';

@Injectable()
export class StudentService extends BaseService<StudentEntity> {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repo: Repository<StudentEntity>,
  ) {
    super(repo);
  }
}
```

**3. Tạo Controller (`student.controller.ts`):**
```typescript
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { StudentEntity } from './student.entity';
import { StudentService } from './student.service';

@ApiTags('students')
@Controller('students')
export class StudentController extends BaseController<StudentEntity> {
  constructor(private readonly service: StudentService) {
    super(service);
  }
}
```
Khi chạy dự án, endpoint `/students/page`, `/students/all`, `/students/:id`, v.v. (bao gồm import/export) sẽ tự động có sẵn để Frontend gọi qua `useInitModel`.

## 🔐 Google Login
Tích hợp sẵn qua `@nestjs/passport` và `passport-google-oauth20`.
- **Luồng:** Người dùng truy cập `/auth/google` -> Đăng nhập trên popup Google -> Redirect về `/auth/google/callback` -> Backend xử lý, lưu user vào db và trả về JWT token redirect sang frontend.
