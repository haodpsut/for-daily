import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { deathAnniversaries, persons } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AnnivAdminList() {
  const all = await db
    .select({
      id: deathAnniversaries.id,
      lunarMonth: deathAnniversaries.lunarMonth,
      lunarDay: deathAnniversaries.lunarDay,
      importance: deathAnniversaries.importance,
      personName: persons.fullName,
      personGen: persons.generation,
      deathYear: persons.deathYear,
    })
    .from(deathAnniversaries)
    .leftJoin(persons, eq(persons.id, deathAnniversaries.personId))
    .orderBy(asc(deathAnniversaries.lunarMonth), asc(deathAnniversaries.lunarDay));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin" className="text-stone-500 hover:text-stone-900">Quản trị</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Giỗ kỵ</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="serif text-3xl font-bold text-stone-900">Quản lý Giỗ kỵ</h1>
          <p className="mt-1 text-sm text-stone-600">{all.length} ngày giỗ — sắp theo lịch âm.</p>
        </div>
        <Link
          href="/dashboard/admin/anniversaries/new"
          className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
        >
          + Thêm giỗ kỵ
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ngày âm</th>
              <th className="px-4 py-3 font-medium">Người</th>
              <th className="px-4 py-3 font-medium">Đời</th>
              <th className="px-4 py-3 font-medium">Năm mất</th>
              <th className="px-4 py-3 font-medium">Trọng đại</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {all.map((a) => (
              <tr key={a.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{a.lunarDay}/{a.lunarMonth} ÂL</td>
                <td className="px-4 py-3">{a.personName}</td>
                <td className="px-4 py-3 text-stone-600">{a.personGen}</td>
                <td className="px-4 py-3 text-stone-600">{a.deathYear ?? "?"}</td>
                <td className="px-4 py-3">
                  {Array.from({ length: a.importance }).map((_, i) => (
                    <span key={i} className="text-amber-600">★</span>
                  ))}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/admin/anniversaries/${a.id}`} className="text-xs text-amber-700 hover:underline">
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
