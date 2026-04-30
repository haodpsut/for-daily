import Link from "next/link";
import { db } from "@/lib/db/client";
import { persons, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminIndex() {
  const [personCount, userCount] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(persons).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(users).then((r) => r[0]?.c ?? 0),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="serif text-3xl font-bold text-stone-900">Quản trị</h1>
      <p className="mt-1 text-sm text-stone-600">Quản lý dữ liệu gia phả. Chỉ Quản trị truy cập được khu này.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/admin/persons"
          className="rounded-lg border border-stone-200 bg-white p-6 transition hover:border-stone-400 hover:shadow-sm"
        >
          <div className="flex items-baseline justify-between">
            <h2 className="serif text-xl font-semibold text-stone-900">Người trong gia phả</h2>
            <span className="text-sm font-medium text-amber-700">{personCount}</span>
          </div>
          <p className="mt-2 text-sm text-stone-600">Thêm / sửa / xoá thành viên trong dòng tộc.</p>
        </Link>

        <div className="rounded-lg border border-stone-200 bg-stone-50 p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="serif text-xl font-semibold text-stone-900">Tài khoản người dùng</h2>
            <span className="text-sm font-medium text-amber-700">{userCount}</span>
          </div>
          <p className="mt-2 text-sm text-stone-600">Quản lý user (admin / editor / member). <em>Sắp ra mắt.</em></p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-600">
        <h3 className="serif text-base font-semibold text-stone-900">Sắp tới</h3>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Quản lý quan hệ (cha/mẹ/vợ/chồng) — chọn người + link nhanh</li>
          <li>CRUD giỗ kỵ + nghi lễ + di sản + mộ + ảnh</li>
          <li>Phê duyệt member mới</li>
          <li>Audit log — xem ai sửa gì khi nào</li>
        </ul>
      </div>
    </main>
  );
}
