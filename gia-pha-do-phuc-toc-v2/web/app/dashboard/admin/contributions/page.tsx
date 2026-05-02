import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contributions, persons, annualReports } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function ContribAdminList() {
  const all = await db
    .select({
      id: contributions.id,
      receivedOn: contributions.receivedOn,
      amountVnd: contributions.amountVnd,
      inKind: contributions.inKind,
      contributorName: contributions.contributorName,
      personName: persons.fullName,
      reportYear: annualReports.year,
    })
    .from(contributions)
    .leftJoin(persons, eq(persons.id, contributions.contributorPersonId))
    .leftJoin(annualReports, eq(annualReports.id, contributions.reportId))
    .orderBy(desc(contributions.receivedOn));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin" className="text-stone-500 hover:text-stone-900">Quản trị</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Công đức</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="serif text-3xl font-bold text-stone-900">Công đức</h1>
          <p className="mt-1 text-sm text-stone-600">{all.length} khoản đóng góp.</p>
        </div>
        <Link href="/dashboard/admin/contributions/new" className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700">
          + Thêm khoản
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ngày</th>
              <th className="px-4 py-3 font-medium">Người đóng góp</th>
              <th className="px-4 py-3 font-medium">Tiền (VND)</th>
              <th className="px-4 py-3 font-medium">Hiện vật</th>
              <th className="px-4 py-3 font-medium">Báo cáo</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {all.map((c) => (
              <tr key={c.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{c.receivedOn}</td>
                <td className="px-4 py-3">{c.personName ?? c.contributorName ?? "—"}</td>
                <td className="px-4 py-3 text-amber-700">
                  {c.amountVnd ? c.amountVnd.toLocaleString("vi-VN") : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-stone-500 max-w-xs truncate">{c.inKind ?? ""}</td>
                <td className="px-4 py-3 text-xs text-stone-500">{c.reportYear ?? ""}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/admin/contributions/${c.id}`} className="text-xs text-amber-700 hover:underline">Sửa</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
