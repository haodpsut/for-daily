import { db } from "@/lib/db/client";
import { deathAnniversaries, persons, rituals, annualReports } from "@/lib/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function TuDuongPage() {
  const [anniversaries, ritualList, reports] = await Promise.all([
    db
      .select({
        id: deathAnniversaries.id,
        lunarMonth: deathAnniversaries.lunarMonth,
        lunarDay: deathAnniversaries.lunarDay,
        importance: deathAnniversaries.importance,
        note: deathAnniversaries.note,
        personName: persons.fullName,
        personGen: persons.generation,
        deathYear: persons.deathYear,
      })
      .from(deathAnniversaries)
      .leftJoin(persons, eq(persons.id, deathAnniversaries.personId))
      .orderBy(asc(deathAnniversaries.lunarMonth), asc(deathAnniversaries.lunarDay)),
    db.select().from(rituals).orderBy(asc(rituals.fixedLunarMonth)),
    db.select().from(annualReports).orderBy(desc(annualReports.year)),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="serif text-3xl font-bold text-stone-900">Từ đường</h1>
      <p className="mt-1 text-sm text-stone-600">Lịch giỗ kỵ, nghi lễ, báo cáo năm.</p>

      {/* Giỗ kỵ */}
      <section className="mt-8">
        <h2 className="serif text-xl font-semibold text-stone-900">Lịch giỗ kỵ ({anniversaries.length})</h2>
        <p className="mt-1 text-xs text-stone-500">Sắp xếp theo âm lịch.</p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Ngày âm</th>
                <th className="px-4 py-3 font-medium">Cụ/Ông/Bà</th>
                <th className="px-4 py-3 font-medium">Đời</th>
                <th className="px-4 py-3 font-medium">Năm mất</th>
                <th className="px-4 py-3 font-medium">Trọng đại</th>
                <th className="px-4 py-3 font-medium">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {anniversaries.map((a) => (
                <tr key={a.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-900">
                    {a.lunarDay}/{a.lunarMonth} ÂL
                  </td>
                  <td className="px-4 py-3">{a.personName}</td>
                  <td className="px-4 py-3 text-stone-600">Đời {a.personGen}</td>
                  <td className="px-4 py-3 text-stone-600">{a.deathYear ?? "?"}</td>
                  <td className="px-4 py-3">
                    {Array.from({ length: a.importance }).map((_, i) => (
                      <span key={i} className="text-amber-600">★</span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-500">{a.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Nghi lễ */}
      <section className="mt-10">
        <h2 className="serif text-xl font-semibold text-stone-900">Nghi lễ ({ritualList.length})</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ritualList.map((r) => (
            <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-5">
              <h3 className="serif font-semibold text-stone-900">{r.name}</h3>
              {r.fixedLunarMonth && r.fixedLunarDay && (
                <p className="mt-1 text-xs text-stone-500">
                  Cố định {r.fixedLunarDay}/{r.fixedLunarMonth} ÂL
                </p>
              )}
              {r.purpose && <p className="mt-2 text-sm text-stone-700">{r.purpose}</p>}
              {Array.isArray(r.offeringList) && r.offeringList.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-stone-600 hover:text-stone-900">
                    Vật phẩm ({r.offeringList.length})
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs text-stone-600">
                    {(r.offeringList as Array<{ name: string; qty?: number; note?: string }>).map((o, i) => (
                      <li key={i}>
                        • {o.name} {o.qty ? `× ${o.qty}` : ""} {o.note ? `(${o.note})` : ""}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Báo cáo năm */}
      <section className="mt-10">
        <h2 className="serif text-xl font-semibold text-stone-900">Báo cáo năm ({reports.length})</h2>
        <div className="mt-3 space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-5">
              <div className="flex items-baseline justify-between">
                <h3 className="serif text-lg font-semibold text-stone-900">Năm {r.year}</h3>
                <span className="text-sm text-amber-700">
                  {r.totalContributions ? `${(r.totalContributions / 1_000_000).toFixed(1)} triệu công đức` : ""}
                </span>
              </div>
              {r.summary && (
                <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-stone-700">{r.summary}</pre>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
