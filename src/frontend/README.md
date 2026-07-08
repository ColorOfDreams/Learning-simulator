# AI Study Simulator — Frontend

Giao diện web của **AI Study Simulator**, xây trên [UmiJS `@umijs/max`](https://umijs.org/) (React 19) + [Ant Design v5](https://ant.design/). Frontend gọi trực tiếp API NestJS ở `src/backend` (xem [README tổng](../../README.md)).

> Base code kế thừa từ một web-base nội bộ và đã được tinh giản cho dự án này (chỉ còn 1 định danh `EModuleKey.BASE`, bỏ cấu trúc đa phân hệ).

## 🧩 Công nghệ chính

- **UmiJS `@umijs/max` v4** — routing, `@umijs/plugin-model` (state), request/axios.
- **React 19.2 + TypeScript**, **Ant Design v5 + Less**.
- **Three.js 0.184** + `@react-three/fiber` / `drei` / `rapier` — mô phỏng 3D.
- **KaTeX** (công thức), **ApexCharts** (đồ thị), **TinyMCE** (soạn thảo), **OneSignal** (push).

## 📦 Yêu cầu

- Node.js ≥ 18, **Yarn** (bắt buộc dùng yarn).

## 🛠️ Cài đặt & chạy

```bash
yarn install
yarn start      # alias của "max dev" — dev server có hot-reload
yarn build      # build tĩnh để deploy
```

Cấu hình API base backend qua biến `APP_CONFIG_IP_ROOT` trong `.env` (mặc định `http://localhost:3000`).

> Lưu ý deploy: production dùng `Dockerfile.frontend.railway` ở gốc repo (Railway). Các script `push-rsync*`/`deploy*` trong `package.json` là tàn dư của base-code cũ — **không dùng cho dự án này**.

## 🔑 Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@gmail.com` | `abc123` |
| Giáo viên | `giaovien@gmail.com` | `abc123` |

Học sinh: đăng ký Email/Mật khẩu hoặc đăng nhập Google.

## 🗂️ Cấu trúc

```text
src/frontend/
├── config/                  # config.ts, routes.ts, proxy.ts (UmiJS)
├── src/
│   ├── pages/
│   │   ├── HocSinh/          # Học sinh: Home, Workspace (chat AI), MyLabs,
│   │   │                     #   Progress, Profile, Leaderboard, Classes
│   │   ├── GiaoVien/         # Giáo viên: Dashboard, Classes, Exams, QuestionBank
│   │   ├── Admin/            # Quản trị
│   │   ├── TaoThiNghiem/ · QuanLyThiNghiem/ · ThiNghiem/   # Tạo & quản lý thí nghiệm
│   │   └── ...               # BaiHoc, DanhMuc, ThongBao, TienIch, TrangChu, user
│   ├── components/           # UI dùng chung (Header, Layout, OneSignal...)
│   ├── models/               # State (Umi models)
│   ├── services/             # API client, types, constants
│   ├── hooks/                # useInitModel (CRUD chuẩn với BaseController), ...
│   └── utils/                # axios, ip, helpers
└── src/simulations → ../../simulations   # Thư viện mô phỏng dùng chung
```

## 🔗 Liên kết Backend

Frontend đồng bộ với `BaseController`/`BaseService` của NestJS: qua hook `useInitModel`, các endpoint CRUD chuẩn (`/…/page`, `/…/all`, import/export Excel) tương thích sẵn. Chi tiết API và AI/RAG: [README tổng](../../README.md) và [Backend-Ai.md](../../Backend-Ai.md).
