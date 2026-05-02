import Link from "next/link";
import { db } from "@/lib/db/client";
import {
  persons, users, deathAnniversaries, heritageItems, graves, graveVisits,
  rituals, ritualOccurrences, annualReports, contributions,
} from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TILES = [
  { href: "/dashboard/admin/hall",           title: "Từ đường",        key: "hall",     desc: "Tên, địa chỉ, lịch sử, liên hệ trưởng tộc" },
  { href: "/dashboard/admin/persons",        title: "Người",           key: "persons",  desc: "Người trong dòng tộc + quan hệ cha/mẹ/vợ/chồng" },
  { href: "/dashboard/admin/anniversaries",  title: "Giỗ kỵ",          key: "anniv",    desc: "Lịch giỗ âm + văn cúng riêng" },
  { href: "/dashboard/admin/heritage",       title: "Di sản",          key: "heritage", desc: "Di huấn, gia phong, câu đối, hoành phi" },
  { href: "/dashboard/admin/graves",         title: "Mồ mả",           key: "graves",   desc: "Vị trí, tình trạng, mộ chí" },
  { href: "/dashboard/admin/grave-visits",   title: "Tảo mộ",          key: "visits",   desc: "Lịch sử tảo mộ Thanh Minh / Chạp tổ" },
  { href: "/dashboard/admin/rituals",        title: "Nghi lễ",         key: "rituals",  desc: "Template nghi lễ + văn cúng + vật phẩm" },
  { href: "/dashboard/admin/occurrences",    title: "Lần thực hiện",   key: "occ",      desc: "Mỗi lần tổ chức nghi lễ / giỗ thực tế" },
  { href: "/dashboard/admin/contributions",  title: "Công đức",        key: "contrib",  desc: "Đóng góp tiền + hiện vật" },
  { href: "/dashboard/admin/reports",        title: "Báo cáo năm",     key: "report",   desc: "Tổng kết & công bố hàng năm" },
  { href: "/dashboard/admin/users",          title: "Tài khoản",       key: "users",    desc: "Quản lý user — đổi role, khoá, xoá" },
];

export default async function AdminIndex() {
  const counts = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(persons).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(users).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(deathAnniversaries).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(heritageItems).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(graves).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(graveVisits).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(rituals).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(ritualOccurrences).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(contributions).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(annualReports).then((r) => r[0]?.c ?? 0),
  ]);
  const [personCount, userCount, annivCount, heritageCount, graveCount, visitCount, ritualCount, occCount, contribCount, reportCount] = counts;
  const countMap: Record<string, number> = {
    persons: personCount, users: userCount, anniv: annivCount, heritage: heritageCount,
    graves: graveCount, visits: visitCount, rituals: ritualCount, occ: occCount,
    contrib: contribCount, report: reportCount, hall: 1,
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
            <span className="mt-3 inline-block text-xs text-stone-500 group-hover:text-stone-900">Mở →</span>
          </Link>
        ))}

      </div>

      <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-600">
        <h3 className="serif text-base font-semibold text-stone-900">Sắp tới</h3>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Thư viện ảnh + upload (storage R2 hoặc local FS)</li>
          <li>Approval flow + invite-only registration</li>
          <li>Audit log — xem ai sửa gì khi nào</li>
          <li>Calendar view giỗ kỵ (lịch âm 12 tháng)</li>
        </ul>
      </div>
    </main>
  );
}
