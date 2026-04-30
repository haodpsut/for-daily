import Link from "next/link";
import { db } from "@/lib/db/client";
import { persons, deathAnniversaries, heritageItems, graves, ancestralHallInfo } from "@/lib/db/schema";
import { sql, max, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [stats, hall] = await Promise.all([
    db
      .select({
        personCount: sql<number>`count(*)::int`,
        generations: max(persons.generation),
      })
      .from(persons)
      .then((r) => r[0]),
    db.select().from(ancestralHallInfo).where(eq(ancestralHallInfo.id, 1)).then((r) => r[0]),
  ]);

  const [annivCount, heritageCount, graveCount] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(deathAnniversaries).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(heritageItems).then((r) => r[0]?.c ?? 0),
    db.select({ c: sql<number>`count(*)::int` }).from(graves).then((r) => r[0]?.c ?? 0),
  ]);

  const cards = [
    { href: "/dashboard/phahe",    title: "Phả hệ",   count: `${stats.personCount} người · ${stats.generations} đời`, desc: "Cây phả hệ + hồ sơ cá nhân (sơ đồ trực quan ở S2)" },
    { href: "/dashboard/tu-duong", title: "Từ đường", count: `${annivCount} giỗ kỵ`,    desc: "Lịch âm + văn cúng + báo cáo công đức năm" },
    { href: "/dashboard/di-san",   title: "Di sản",   count: `${heritageCount} mục`,    desc: "Di huấn, gia phong, câu đối, hoành phi" },
    { href: "/dashboard/mo-ma",    title: "Mồ mả",    count: `${graveCount} mộ`,        desc: "Vị trí, tình trạng, lịch tảo mộ" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {hall && (
        <section className="rounded-lg border border-stone-200 bg-white p-6">
          <p className="serif text-sm uppercase tracking-wider text-stone-500">Từ đường</p>
          <h1 className="serif mt-2 text-3xl font-bold text-stone-900">{hall.name}</h1>
          {hall.address && <p className="mt-2 text-sm text-stone-600">{hall.address}</p>}
          {hall.contactInfo && typeof hall.contactInfo === "object" && (
            <div className="mt-4 grid gap-2 text-sm text-stone-700 md:grid-cols-3">
              {Object.entries(hall.contactInfo as Record<string, unknown>).map(([k, v]) => (
                <div key={k}><span className="text-stone-500">{k}:</span> {String(v)}</div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-lg border border-stone-200 bg-white p-6 transition hover:border-stone-400 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <h2 className="serif text-xl font-semibold text-stone-900">{c.title}</h2>
              <span className="text-sm font-medium text-amber-700">{c.count}</span>
            </div>
            <p className="mt-2 text-sm text-stone-600">{c.desc}</p>
            <span className="mt-3 inline-block text-sm text-stone-500 group-hover:text-stone-900">
              Xem chi tiết →
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
