import Link from "next/link";
import { db } from "@/lib/db/client";
import { persons } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function PersonsAdminList() {
  const all = await db
    .select()
    .from(persons)
    .orderBy(asc(persons.generation), asc(persons.birthOrder), asc(persons.fullName));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="serif text-3xl font-bold text-stone-900">Quản lý Người</h1>
          <p className="mt-1 text-sm text-stone-600">{all.length} người · sắp xếp theo đời + thứ con.</p>
        </div>
        <Link
          href="/dashboard/admin/persons/new"
          className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
        >
          + Thêm người
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Đời</th>
              <th className="px-4 py-3 font-medium">Họ tên</th>
              <th className="px-4 py-3 font-medium">Giới</th>
              <th className="px-4 py-3 font-medium">Năm sinh – mất</th>
              <th className="px-4 py-3 font-medium">Vai trò</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {all.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-600">{p.generation ?? "?"}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/phahe/${p.id}`} className="font-medium text-stone-900 hover:underline">
                    {p.fullName}
                  </Link>
                  {p.otherNames && <span className="ml-2 text-xs text-stone-500">({p.otherNames})</span>}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Khác"}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {p.birthYear ?? "?"}
                  {p.isDeceased ? ` – ${p.deathYear ?? "?"}` : ""}
                </td>
                <td className="px-4 py-3">
                  {p.isInLaw ? (
                    <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Dâu/Rể
                    </span>
                  ) : (
                    <span className="text-xs text-stone-500">Huyết thống</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/admin/persons/${p.id}`}
                    className="text-xs text-amber-700 hover:underline"
                  >
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
