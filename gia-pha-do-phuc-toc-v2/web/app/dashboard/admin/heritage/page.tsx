import Link from "next/link";
import { db } from "@/lib/db/client";
import { heritageItems } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  di_huan: "Di huấn", gia_phong: "Gia phong", cau_doi: "Câu đối",
  hoanh_phi: "Hoành phi", van_ban_co: "Văn bản cổ", tho_van: "Thơ văn",
};

export default async function HeritageAdminList() {
  const all = await db.select().from(heritageItems).orderBy(asc(heritageItems.displayOrder));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin" className="text-stone-500 hover:text-stone-900">Quản trị</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Di sản</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="serif text-3xl font-bold text-stone-900">Quản lý Di sản</h1>
          <p className="mt-1 text-sm text-stone-600">{all.length} mục — di huấn, câu đối, hoành phi…</p>
        </div>
        <Link
          href="/dashboard/admin/heritage/new"
          className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
        >
          + Thêm mục
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Thứ tự</th>
              <th className="px-4 py-3 font-medium">Loại</th>
              <th className="px-4 py-3 font-medium">Tiêu đề</th>
              <th className="px-4 py-3 font-medium">Năm</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {all.map((h) => (
              <tr key={h.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-600">{h.displayOrder}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
                    {TYPE_LABELS[h.type] ?? h.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-stone-900">{h.title}</td>
                <td className="px-4 py-3 text-stone-600">{h.yearComposed ?? "?"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/admin/heritage/${h.id}`} className="text-xs text-amber-700 hover:underline">
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
