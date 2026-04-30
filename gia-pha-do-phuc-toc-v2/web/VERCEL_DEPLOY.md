# Hướng dẫn deploy lên Vercel

Repo này là 1 sub-folder của repo `for-daily` trên GitHub. Vercel sẽ deploy folder `gia-pha-do-phuc-toc-v2/web` (không phải toàn bộ for-daily).

---

## Bước 1 — Chuẩn bị Postgres production

Vercel **không host Postgres** — anh cần 1 nơi khác. Khuyến nghị mạnh: **Neon free tier**.

1. Vào https://neon.tech → đăng ký bằng GitHub.
2. Tạo project mới (ví dụ: `giapha-do-phuc-toc-v2`).
3. Region: **Singapore** (gần Việt Nam nhất, latency thấp).
4. Sau khi tạo, vào **Connection Details** → copy *connection string* dạng:
   ```
   postgres://USER:PASSWORD@ep-xxxxxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
   Dùng **pooler** URL (có chữ `-pooler`), tránh dùng direct URL — pooler tối ưu cho serverless.

5. **Backup quyền sở hữu:** dù dùng Neon, dữ liệu vẫn là Postgres chuẩn — anh có thể `pg_dump` bất cứ lúc nào và migrate sang VPS riêng. KHÔNG vendor lock-in.

---

## Bước 2 — Push code lên GitHub

Repo `for-daily` đã connect sẵn (từ v1). Nếu chưa commit v2:

```bash
cd <repo-root>
git add gia-pha-do-phuc-toc-v2/
git commit -m "feat(giapha-v2): initial foundation"
git push origin main
```

---

## Bước 3 — Tạo Vercel project

1. Vào https://vercel.com/new
2. **Import Git Repository** → chọn `haodpsut/for-daily`
3. **Quan trọng — Framework Preset:** Next.js (auto-detect)
4. **Quan trọng — Root Directory:** click **Edit** → nhập:
   ```
   gia-pha-do-phuc-toc-v2/web
   ```
   ⚠️ Đây là bước hay quên gây lỗi build "no package.json found".

5. **Build Command:** để mặc định (`next build`)
6. **Install Command:** để mặc định (`npm install`)
7. **Output Directory:** để mặc định

---

## Bước 4 — Set environment variables

Tại trang import (hoặc Settings → Environment Variables sau khi tạo):

| Name | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgres://...neon.tech/...?sslmode=require` | Từ Neon, dùng **pooler** URL |
| `SITE_NAME` | `Đỗ Phúc Tộc` | Hoặc tên anh muốn |
| `SITE_URL` | `https://giapha-do-phuc-toc-v2.vercel.app` | URL Vercel sẽ cấp (cập nhật sau) |
| `AUTH_SECRET` | (chạy `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) | Chưa dùng ở S1, set sẵn cho S2 |

Apply cho cả 3 environments: **Production**, **Preview**, **Development**.

---

## Bước 5 — Deploy + tạo schema lần đầu

1. Click **Deploy** → đợi build (~2-3 phút lần đầu).
2. Sau khi deploy xong, **chạy migration trên Neon từ máy local**:

```bash
# Trong máy local, đảm bảo .env.local có DATABASE_URL trỏ về Neon production
cd web
DATABASE_URL="<neon-url>" npm run db:push
```

⚠️ **CẨN THẬN:** lệnh này chạy trên DB production. Đảm bảo `DATABASE_URL` đúng.

3. (Tuỳ chọn) Insert dữ liệu mẫu lên production để test:

```bash
DATABASE_URL="<neon-url>" npm run seed
```

→ Sau này khi có dữ liệu thật, **TUYỆT ĐỐI KHÔNG** chạy `seed` trên production (sẽ wipe data).

---

## Bước 6 — Verify

Mở https://giapha-do-phuc-toc-v2.vercel.app → thấy landing page = OK.

---

## Khắc phục các lỗi hay gặp

### ❌ "No package.json found"
→ Quên set Root Directory = `gia-pha-do-phuc-toc-v2/web`. Vào Settings → General → Root Directory → sửa → Redeploy.

### ❌ "DATABASE_URL is required"
→ Quên set env var. Settings → Environment Variables → thêm `DATABASE_URL` → Redeploy (env mới chỉ apply sau redeploy).

### ❌ "self signed certificate in certificate chain" (Postgres SSL)
→ Connection string thiếu `?sslmode=require`. Thêm vào cuối URL.

### ❌ Build OK nhưng runtime crash "Cannot find module 'postgres'"
→ Drizzle dependency conflict. Xoá `node_modules` + `package-lock.json` local, chạy lại `npm install`, commit lockfile mới, push.

### ❌ "Connection limit exceeded" (Neon free tier ~100 connections)
→ Đảm bảo `DATABASE_URL` dùng `-pooler` URL của Neon (KHÔNG dùng direct).

### ❌ Vercel build fail vì `tsx` hoặc `drizzle-kit`
→ Bình thường — `tsx`/`drizzle-kit` là devDependencies, không cần ở runtime. Vercel cài cả dev+prod nên OK. Nếu bị lỗi khác, kiểm tra Build Logs.

### ❌ Migration tạo tables trên Neon nhưng app vẫn lỗi "relation does not exist"
→ Xảy ra khi `db:push` chạy với DATABASE_URL khác (ví dụ chạy với localhost mà nghĩ là chạy với Neon). In ra DATABASE_URL trước khi chạy:
```bash
echo $DATABASE_URL    # confirm trước khi chạy db:push
```

---

## Khi nào nên dùng Vercel + khi nào không

✅ **Vercel phù hợp** cho gia phả họ tộc:
- Free tier đủ dùng (100GB bandwidth/tháng, không giới hạn build)
- HTTPS auto + CDN toàn cầu
- Auto-deploy khi push GitHub

⚠️ **Cân nhắc tự host nếu:**
- Anh muốn **mọi thứ** trong nhà (bao gồm web layer, không chỉ DB)
- Có ngân sách VPS ~5$/tháng
- Phương án: Hetzner / Vultr / DigitalOcean droplet $5 + Docker compose chạy cả web + Postgres

Migrate từ Vercel → VPS sau này đơn giản: code không thay đổi, chỉ đổi cách deploy (`docker build` thay vì `vercel deploy`).
