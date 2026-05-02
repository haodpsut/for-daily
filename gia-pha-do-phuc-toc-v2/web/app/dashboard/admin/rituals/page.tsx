import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { rituals } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = {
  gio_to: "Giỗ Tổ", gio_thuong: "Giỗ thường", le_tet: "Lễ Tết",
  le_thanh_minh: "Thanh Minh", le_chap_tu: "Chạp Tổ", khac: "Khác",
};

export default async function RitualsAdminList() {
  const all = await db.select().from(rituals).orderBy(asc(rituals.fixedLunarMonth), asc(rituals.fixedLunarDay));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin" className="text-stone-500 hover:text-stone-900">Quản trị</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Nghi lễ</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="serif text-3xl font-bold text-stone-900">Quản lý Nghi lễ</h1>
          <p className="mt-1 text-sm text-stone-600">{all.length} nghi lễ — template để tổ chức hàng năm.</p>
        </div>
        <Link href="/dashboard/admin/rituals/new" className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700">
          + Thêm nghi lễ
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Loại</th>
              <th className="px-4 py-3 font-medium">Lịch âm cố định</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {all.map((r) => (
              <tr key={r.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{r.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
                    {KIND_LABELS[r.kind] ?? r.kind}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {r.fixedLunarDay && r.fixedLunarMonth ? `${r.fixedLunarDay}/${r.fixedLunarMonth} ÂL` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/admin/rituals/${r.id}`} className="text-xs text-amber-700 hover:underline">Sửa</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
