# Gia Phả Đỗ Phúc Tộc

Trang gia phả dòng họ **Đỗ Phúc Tộc** — quản lý thành viên, sơ đồ phả hệ, tra cứu danh xưng và sự kiện dòng tộc.

> Forked từ [homielab/giapha-os](https://github.com/homielab/giapha-os) (MIT License). Mọi credit nền tảng thuộc về HomieLab.

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Supabase** (Postgres + Auth + Storage + RLS)
- **TailwindCSS 4** + **Framer Motion** + **lucide-react**
- Self-hosted: dữ liệu gia phả 100% trong Supabase project của dòng họ

## Tính năng (kế thừa từ giapha-os)

- Sơ đồ phả hệ kép: **Tree** (cây dọc) + **Mindmap** (sơ đồ tư duy)
- Tra cứu **danh xưng tự động** (Bác/Chú/Cô/Dì/Cụ/Kỵ/Sơ…) tới 8-9 đời
- Lịch âm dương + ngày giỗ tự động
- Phân quyền: Admin / Editor / Member (Member chờ Admin duyệt)
- Import/Export: JSON, CSV, **GEDCOM 7.0**
- Tách dữ liệu nhạy cảm (SĐT, nghề nghiệp, nơi ở) — chỉ Admin xem được

---

## Chạy local

Yêu cầu: Node.js ≥ 20.

```bash
cp .env.example .env.local
# (tuỳ chọn: điền NEXT_PUBLIC_SUPABASE_URL + KEY của Supabase project)

npm install
npm run dev   # webpack (default — ổn định trong cấu trúc nested repo)
# npm run dev:turbo   # tuỳ chọn: Turbopack (nhanh hơn, nhưng có thể conflict resolver khi web/ nằm trong monorepo)
```

Mở http://localhost:3000

> Khi chưa có Supabase env: landing page (`/`) và `/about` vẫn hiển thị. Các route cần DB (`/login`, `/dashboard`) sẽ redirect sang `/missing-db-config`.

---

## Setup Supabase (~10 phút)

1. Tạo project mới tại https://supabase.com (đề xuất tên `giapha-do-phuc-toc`).
2. Vào **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
3. Vào **SQL Editor**, dán toàn bộ nội dung [`docs/schema.sql`](docs/schema.sql) và chạy 1 lần.
4. Vào **Authentication → URL Configuration**:
   - **Site URL**: `https://giapha-do-phuc-toc.vercel.app` (hoặc URL thật của bạn)
   - **Redirect URLs**: thêm cả URL Vercel + `http://localhost:3000/**`
5. Người đăng ký đầu tiên sẽ tự động là **Admin**. Tạo tài khoản này cho trưởng tộc / người soạn gia phả.

---

## Deploy Vercel

1. Push repo này lên GitHub.
2. Tại https://vercel.com → **Import Git Repository** → chọn repo.
3. Điền 3 biến môi trường:
   - `SITE_NAME` = `Đỗ Phúc Tộc`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
4. **Deploy** → có URL `*.vercel.app` chạy ngay.

---

## Cấu trúc

```
app/                      Next.js routes (landing, login, dashboard/*, setup)
components/               37 React components (FamilyTree, Mindmap, Kinship…)
utils/                    treeHelpers, kinshipHelpers, eventHelpers, gedcom, supabase/
types/index.ts            Person, Relationship, Profile…
docs/schema.sql           Schema Supabase đầy đủ (tables + RLS + triggers + RPC)
docs/seed.sql             Dữ liệu mẫu (KHÔNG dùng cho production của dòng họ)
```

---

## License

Mã nguồn: MIT (kế thừa từ giapha-os của HomieLab).
Dữ liệu gia phả dòng họ Đỗ Phúc Tộc: **riêng tư của dòng họ**, không chia sẻ công khai.
