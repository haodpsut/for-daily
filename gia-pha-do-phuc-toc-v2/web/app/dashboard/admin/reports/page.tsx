import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { annualReports } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function ReportsAdminList() {
  const all = await db.select().from(annualReports).orderBy(desc(annualReports.year));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin" className="text-stone-500 hover:text-stone-900">Quản trị</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Báo cáo năm</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="serif text-3xl font-bold text-stone-900">Báo cáo năm</h1>
          <p className="mt-1 text-sm text-stone-600">{all.length} báo cáo.</p>
        </div>
        <Link href="/dashboard/admin/reports/new" className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700">
          + Thêm báo cáo
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Năm</th>
              <th className="px-4 py-3 font-medium">Số nghi lễ</th>
              <th className="px-4 py-3 font-medium">Tổng công đức</th>
              <th className="px-4 py-3 font-medium">Ngày phát hành</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {all.map((r) => (
              <tr key={r.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{r.year}</td>
                <td className="px-4 py-3 text-stone-600">{r.ritualCount ?? "—"}</td>
                <td className="px-4 py-3 text-amber-700">
                  {r.totalContributions
                    ? `${(r.totalContributions / 1_000_000).toFixed(1)}M`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-stone-500">
                  {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString("vi-VN") : "Chưa phát hành"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/admin/reports/${r.id}`} className="text-xs text-amber-700 hover:underline">Sửa</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
