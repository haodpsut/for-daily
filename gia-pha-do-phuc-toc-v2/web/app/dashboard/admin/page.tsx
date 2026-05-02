import Link from "next/link";
import { db } from "@/lib/db/client";
import { persons, users, deathAnniversaries, heritageItems, graves } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TILES = [
  { href: "/dashboard/admin/hall",          title: "Từ đường",   key: "hall",     desc: "Tên, địa chỉ, lịch sử, liên hệ trưởng tộc" },
  { href: "/dashboard/admin/persons",       title: "Người",      key: "persons",  desc: "Thêm/sửa người trong dòng tộc, quan hệ" },
  { href: "/dashboard/admin/anniversaries", title: "Giỗ kỵ",     key: "anniv",    desc: "Lịch giỗ âm + văn cúng riêng" },
  { href: "/dashboard/admin/heritage",      title: "Di sản",     key: "heritage", desc: "Di huấn, gia phong, câu đối, hoành phi" },
  { href: "/dashboard/admin/graves",        title: "Mồ mả",      key: "graves",   desc: "Vị trí, tình trạng, mộ chí" },
];

export default async function AdminIndex() {
  const counts = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(persons).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(users).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(deathAnniversaries).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(heritageItems).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(graves).then((r) => r[0]?.c ?? 0),
  ]);
  const [personCount, userCount, annivCount, heritageCount, graveCount] = counts;
  const countMap: Record<string, number> = {
    persons: personCount, users: userCount, anniv: annivCount, heritage: heritageCount, graves: graveCount, hall: 1,
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="serif text-3xl font-bold text-stone-900">Quản trị</h1>
      <p className="mt-1 text-sm text-stone-600">Quản lý dữ liệu gia phả. Chỉ Quản trị truy cập được khu này.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-lg border border-stone-200 bg-white p-5 transition hover:border-stone-400 hover:shadow-sm"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="serif text-xl font-semibold text-stone-900">{t.title}</h2>
              <span className="text-sm font-medium text-amber-700">
                {t.key === "hall" ? "1" : countMap[t.key] ?? 0}
              </span>
            </div>
            <p className="mt-2 text-sm text-stone-600">{t.desc}</p>
            <span className="mt-3 inline-block text-xs text-stone-500 group-hover:text-stone-900">
              Mở →
            </span>
          </Link>
        ))}

        <div className="rounded-lg border border-stone-200 bg-stone-50 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="serif text-xl font-semibold text-stone-900">Tài khoản</h2>
            <span className="text-sm font-medium text-amber-700">{userCount}</span>
          </div>
          <p className="mt-2 text-sm text-stone-600">Quản lý user (admin / editor / member). <em>Sắp ra mắt.</em></p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-600">
        <h3 className="serif text-base font-semibold text-stone-900">Sắp tới (S6+)</h3>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Nghi lễ + lần thực hiện + công đức + báo cáo năm</li>
          <li>Thư viện ảnh + upload</li>
          <li>Phê duyệt member mới + invite-only</li>
          <li>Audit log — xem ai sửa gì khi nào</li>
        </ul>
      </div>
    </main>
  );
}
