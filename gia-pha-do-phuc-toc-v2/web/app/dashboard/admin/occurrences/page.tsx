import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { ritualOccurrences, rituals, deathAnniversaries, persons } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function OccurrencesAdminList() {
  // Build a flat view by joining each occurrence with its ritual or anniversary
  const all = await db
    .select({
      id: ritualOccurrences.id,
      occurredOn: ritualOccurrences.occurredOn,
      attendeeCount: ritualOccurrences.attendeeCount,
      ritualName: rituals.name,
      annivPersonName: persons.fullName,
      annivLunarMonth: deathAnniversaries.lunarMonth,
      annivLunarDay: deathAnniversaries.lunarDay,
      summary: ritualOccurrences.summary,
    })
    .from(ritualOccurrences)
    .leftJoin(rituals, eq(rituals.id, ritualOccurrences.ritualId))
    .leftJoin(deathAnniversaries, eq(deathAnniversaries.id, ritualOccurrences.deathAnniversaryId))
    .leftJoin(persons, eq(persons.id, deathAnniversaries.personId))
    .orderBy(desc(ritualOccurrences.occurredOn));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin" className="text-stone-500 hover:text-stone-900">Quản trị</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Lần thực hiện lễ</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="serif text-3xl font-bold text-stone-900">Lần thực hiện lễ</h1>
          <p className="mt-1 text-sm text-stone-600">{all.length} lần — sắp theo ngày gần nhất.</p>
        </div>
        <Link href="/dashboard/admin/occurrences/new" className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700">
          + Thêm lần
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ngày DL</th>
              <th className="px-4 py-3 font-medium">Loại lễ</th>
              <th className="px-4 py-3 font-medium">Số dự</th>
              <th className="px-4 py-3 font-medium">Tóm tắt</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {all.map((o) => (
              <tr key={o.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{o.occurredOn}</td>
                <td className="px-4 py-3">
                  {o.ritualName ?? (o.annivPersonName
                    ? `Giỗ ${o.annivPersonName} (${o.annivLunarDay}/${o.annivLunarMonth} ÂL)`
                    : "—")}
                </td>
                <td className="px-4 py-3 text-stone-600">{o.attendeeCount ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-stone-500 max-w-md truncate">{o.summary ?? ""}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/admin/occurrences/${o.id}`} className="text-xs text-amber-700 hover:underline">Sửa</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
