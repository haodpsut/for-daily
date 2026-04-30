# Gia Phả Đỗ Phúc Tộc — v2

> Hệ thống số hoá Từ đường: phả hệ + lễ nghi + di sản + mồ mả + thư viện ảnh.
> Self-hosted Postgres, không phụ thuộc Supabase. Web deploy tuỳ ý (Vercel khuyến nghị).

## Cấu trúc repo

```
.
├── docker-compose.yml      ← Postgres + Adminer cho local dev (tuỳ chọn)
└── web/                    ← Next.js 16 app (đây là Vercel Root Directory)
    ├── app/                Routes
    ├── lib/db/             Drizzle ORM schema + client
    ├── data/seed/          Dữ liệu mẫu (commit vào git)
    ├── scripts/            CLI: seed / export / import
    ├── README.md           ← **Đọc file này để chạy app**
    └── VERCEL_DEPLOY.md    ← Hướng dẫn deploy Vercel
```

## Chạy nhanh

### Trên VPS (1 lệnh duy nhất, conda-only, không cần root)

```bash
curl -fsSL https://raw.githubusercontent.com/haodpsut/for-daily/main/gia-pha-do-phuc-toc-v2/deploy/install.sh | bash
```

→ Tự cài conda env + Postgres + npm deps + schema + seed + pm2 trong ~5-10 phút.
Xem chi tiết + tuỳ chỉnh: [`deploy/README.md`](deploy/README.md).

### Trên local Windows (dev)

Vào [`web/`](web/) và làm theo [`web/README.md`](web/README.md).

## License

Mã nguồn: MIT. Dữ liệu gia phả thật của họ Đỗ Phúc Tộc: **riêng tư**, không commit.
