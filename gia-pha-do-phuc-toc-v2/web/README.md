# Gia Phả Đỗ Phúc Tộc v2 — Web App

Next.js 16 + Drizzle ORM + Postgres. Self-hosted DB, owned data, deploy bất kỳ nền tảng nào hỗ trợ Node.js.

---

## Yêu cầu

- **Node.js ≥ 20** (khuyến nghị 22 LTS)
- **Postgres 14+** — chọn 1 trong 3:
  - Local: Docker Desktop (dùng `docker-compose.yml` ở thư mục cha)
  - Cloud miễn phí: [Neon](https://neon.tech) (0.5GB free, full Postgres, owned data)
  - VPS: cài trực tiếp `apt install postgresql-16`

---

## Chạy local lần đầu (5 bước)

### Bước 1 — Cài deps

```bash
npm install
```

### Bước 2 — Khởi tạo Postgres

**Option A (Docker — dễ nhất):**

```bash
cd ..                           # ra thư mục cha (chứa docker-compose.yml)
docker compose up -d
cd web
```

→ Postgres chạy ở `localhost:5432`, Adminer GUI ở `http://localhost:8080`.

**Option B (Neon cloud — không cần Docker):**

1. Đăng ký free tại https://neon.tech
2. Tạo project → copy connection string (dạng `postgres://USER:PASS@ep-xxx.neon.tech/neondb?sslmode=require`)

### Bước 3 — Cấu hình env

```bash
cp .env.example .env.local
```

Sửa `.env.local`:
- **Docker:** giữ nguyên `DATABASE_URL=postgres://postgres:postgres@localhost:5432/giapha`
- **Neon:** dán connection string vào `DATABASE_URL`

### Bước 4 — Tạo schema + seed dữ liệu mẫu

```bash
npm run db:push     # Tạo tất cả tables theo schema (Drizzle push)
npm run seed        # Insert ~12 người, 5 giỗ, 3 nghi lễ, 4 mộ... (xem data/seed/README.md)
```

### Bước 5 — Chạy dev server

```bash
npm run dev
```

→ http://localhost:3000

---

## CLI Commands

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Dev server (webpack, ổn định) |
| `npm run build` | Build production |
| `npm run start` | Run production build |
| `npm run db:push` | Sync schema → DB (dev) |
| `npm run db:generate` | Tạo migration từ schema diff |
| `npm run db:migrate` | Chạy migrations (production) |
| `npm run db:studio` | Drizzle Studio — DB GUI ở localhost:4983 |
| `npm run seed` | **WIPE** + insert dữ liệu mẫu từ `data/seed/` |
| `npm run export [out]` | Dump DB → bundle JSON. Mặc định `./data/backups/<timestamp>` |
| `npm run import <bundle>` | **WIPE** + restore từ bundle |

---

## Backup dữ liệu thật

Trước mọi thao tác có thể mất dữ liệu (`db:push` với schema changes lớn, `seed`, `import`):

```bash
npm run export ./data/backups/before-<lý-do>
```

Bundle xuất ra là 1 thư mục JSON đọc được bằng tay — không khoá format, không phụ thuộc tool. Anh có thể:
- Copy sang USB / Google Drive / NAS
- Commit vào 1 **repo riêng tư** khác (KHÔNG commit vào repo này)
- Restore bằng `npm run import ./path/to/bundle/`

---

## Deploy lên Vercel

Xem [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) — hướng dẫn chi tiết kèm các lỗi thường gặp.

---

## Cấu trúc thư mục

```
web/
├── app/                    Next.js routes
│   ├── layout.tsx
│   ├── page.tsx           Landing
│   └── globals.css
├── lib/
│   └── db/
│       ├── schema.ts      ⭐ Single source of truth — toàn bộ tables
│       └── client.ts      postgres-js + Drizzle
├── data/seed/              Dữ liệu mẫu (12 files JSON)
├── scripts/
│   ├── seed.ts
│   ├── export.ts
│   └── import.ts
├── drizzle.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Roadmap

| Sprint | Module | Trạng thái |
|---|---|---|
| **S1** | **Foundation** — Schema + seed + import/export CLI | ✅ **Done** |
| S2 | Auth (Auth.js v5) + Module Phả hệ (port từ v1) | Sắp |
| S3 | Module Từ đường — lịch giỗ + nghi lễ + văn cúng | |
| S4 | Báo cáo Từ đường năm + công đức | |
| S5 | Module Di sản — di huấn / câu đối / tư liệu | |
| S6 | Module Mồ mả — Leaflet map + chi tiết | |
| S7 | Thư viện ảnh + Cloudflare R2 storage | |
| S8 | UX polish, mobile, in PDF báo cáo | |

---

## License

Mã nguồn: MIT. Dữ liệu gia phả thật: riêng tư của dòng họ.
