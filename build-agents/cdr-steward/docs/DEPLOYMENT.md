# Deployment Guide

## Architecture

```
┌─────────────────────┐         ┌────────────────────────┐
│ Vercel              │  HTTPS  │ Render.com             │
│ Frontend (Vite SPA) │ ──────► │ Backend (FastAPI +     │
│ — static, free      │  CORS   │   XeLaTeX in Docker)   │
└─────────────────────┘         └────────────────────────┘
                                          │
                                          ▼
                                 ┌──────────────────┐
                                 │ SQLite /tmp      │
                                 │ (ephemeral demo) │
                                 └──────────────────┘
```

## Tại sao tách 2 host?

| Yêu cầu | Vercel serverless | Render Docker |
|---------|-------------------|---------------|
| Static React build | ✅ 1 click | OK |
| Python FastAPI | ✅ qua /api/ folder | ✅ |
| **XeLaTeX binary (~600MB)** | ❌ không install được | ✅ apt-get |
| Persistent filesystem | ❌ ephemeral /tmp only | ❌ ephemeral (free tier) |
| Cold start | ms | ~50s sau 15 phút sleep |
| Free tier | 100GB bandwidth | 512MB RAM, 750h/tháng |

→ Frontend Vercel (CDN-fast), Backend Render Docker (xelatex chạy được).

## Bước 1 — Push GitHub

### Option A: Repo mới riêng (recommend)
```powershell
cd build-agents\cdr-steward
git init
git add .
git commit -m "Initial commit: CĐR Steward MVP"
git remote add origin https://github.com/<USERNAME>/cdr-steward.git
git branch -M main
git push -u origin main
```

### Option B: Subdir của for-daily (đơn giản hơn)
```powershell
cd D:\Locals\git-working\for-daily
git add build-agents\cdr-steward\
git commit -m "feat: CĐR Steward MVP — full stack"
git push
```

## Bước 2 — Deploy backend lên Render.com

1. Vào https://dashboard.render.com → **New +** → **Blueprint**
2. Connect GitHub → chọn repo
3. Render auto-detect `render.yaml` → click **Apply**
4. Đợi ~10 phút build Docker image (cài texlive lần đầu chậm)
5. Lấy URL: `https://cdr-steward-api.onrender.com`
6. Test: `curl https://cdr-steward-api.onrender.com/health`

**Manual setup (nếu không dùng render.yaml):**
- Service type: **Web Service**
- Environment: **Docker**
- Region: **Singapore**
- Plan: **Free**
- Health Check Path: `/health`
- Env vars:
  - `LATEX_FONT` = `Liberation Serif`
  - `DATABASE_URL` = `sqlite:////tmp/cdr_steward.db`
  - `ALLOWED_ORIGINS` = `https://your-vercel-domain.vercel.app`

## Bước 3 — Deploy frontend lên Vercel

1. https://vercel.com/new → import GitHub repo
2. **Root Directory:** `build-agents/cdr-steward/frontend` (Option B) hoặc `frontend` (Option A)
3. Framework: Vite (auto-detect)
4. Env vars:
   - `VITE_API_URL` = `https://cdr-steward-api.onrender.com/api`
5. Deploy

## Bước 4 — Sync CORS

Sau khi có Vercel domain (vd `cdr-steward-abc.vercel.app`):
1. Render.com dashboard → service → Environment → update `ALLOWED_ORIGINS`
2. Trigger redeploy

## Local Docker (test trước khi push)

```powershell
cd build-agents\cdr-steward
docker build -t cdr-steward .
docker run -p 8000:8000 cdr-steward
# Test: curl http://localhost:8000/health
```

## Demo data flow

- Container start → `seed_demo.py` chạy → SQLite `/tmp/cdr_steward.db` có sẵn 7480201 + 6PO + 9PLO + 25PI + 3 courses
- User upload Excel mới → ghi đè program 7480201
- Render PDF → `/tmp/output/...` (ephemeral, regenerate mỗi lần)
- Container restart (Render free tier sleep) → **data reset về demo seed**

→ Production cần Postgres (Neon, Supabase, Render PG). Schema không đổi, chỉ cần đổi `DATABASE_URL`.

## Chi phí ước tính (production)

| Component | Service | Plan | Cost/tháng |
|-----------|---------|------|------------|
| Frontend | Vercel | Hobby | $0 (đến 100GB bandwidth) |
| Backend | Render | Starter | $7 (luôn online, không sleep) |
| Database | Neon PG | Free tier | $0 (đến 0.5GB) |
| Object storage (PDFs) | Cloudflare R2 | Free tier | $0 (đến 10GB) |
| **Total demo prod** | | | **$7/tháng** |

Free tier (sleep sau 15 phút) đủ cho POC giới thiệu khách hàng.
