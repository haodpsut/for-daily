import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { graveVisits, graves, persons } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function VisitsAdminList() {
  const all = await db
    .select({
      id: graveVisits.id,
      visitedOn: graveVisits.visitedOn,
      visitorNames: graveVisits.visitorNames,
      purpose: graveVisits.purpose,
      personName: persons.fullName,
      cemeteryName: graves.cemeteryName,
    })
    .from(graveVisits)
    .leftJoin(graves, eq(graves.id, graveVisits.graveId))
    .leftJoin(persons, eq(persons.id, graves.personId))
    .orderBy(desc(graveVisits.visitedOn));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin" className="text-stone-500 hover:text-stone-900">Quản trị</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Tảo mộ</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="serif text-3xl font-bold text-stone-900">Lịch sử tảo mộ</h1>
          <p className="mt-1 text-sm text-stone-600">{all.length} lần tảo mộ.</p>
        </div>
        <Link href="/dashboard/admin/grave-visits/new" className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700">
          + Thêm tảo mộ
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ngày</th>
              <th className="px-4 py-3 font-medium">Mộ</th>
              <th className="px-4 py-3 font-medium">Mục đích</th>
              <th className="px-4 py-3 font-medium">Người đi</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {all.map((v) => (
              <tr key={v.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{v.visitedOn}</td>
                <td className="px-4 py-3">{v.personName ?? v.cemeteryName ?? "—"}</td>
                <td className="px-4 py-3 text-stone-600">{v.purpose ?? ""}</td>
                <td className="px-4 py-3 text-xs text-stone-500 max-w-md truncate">{v.visitorNames ?? ""}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/admin/grave-visits/${v.id}`} className="text-xs text-amber-700 hover:underline">Sửa</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
