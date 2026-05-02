import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { graves, persons } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  kien_co: "Kiên cố", dat: "Mộ đất", cai_tang_xong: "Cải táng xong", that_lac: "Thất lạc", khac: "Khác",
};

export default async function GravesAdminList() {
  const all = await db
    .select({
      id: graves.id,
      cemeteryName: graves.cemeteryName,
      status: graves.status,
      geoLat: graves.geoLat,
      geoLng: graves.geoLng,
      personName: persons.fullName,
      personGen: persons.generation,
    })
    .from(graves)
    .leftJoin(persons, eq(persons.id, graves.personId))
    .orderBy(asc(persons.generation), asc(persons.birthOrder));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin" className="text-stone-500 hover:text-stone-900">Quản trị</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Mồ mả</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="serif text-3xl font-bold text-stone-900">Quản lý Mồ mả</h1>
          <p className="mt-1 text-sm text-stone-600">{all.length} mộ.</p>
        </div>
        <Link
          href="/dashboard/admin/graves/new"
          className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
        >
          + Thêm mộ
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Người</th>
              <th className="px-4 py-3 font-medium">Đời</th>
              <th className="px-4 py-3 font-medium">Nghĩa trang</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Tọa độ</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {all.map((g) => (
              <tr key={g.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{g.personName ?? "(chưa định danh)"}</td>
                <td className="px-4 py-3 text-stone-600">{g.personGen ?? "?"}</td>
                <td className="px-4 py-3 text-stone-600">{g.cemeteryName ?? ""}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
                    {STATUS_LABELS[g.status] ?? g.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-stone-500">
                  {g.geoLat != null && g.geoLng != null
                    ? `${g.geoLat.toFixed(4)}, ${g.geoLng.toFixed(4)}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/admin/graves/${g.id}`} className="text-xs text-amber-700 hover:underline">
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
