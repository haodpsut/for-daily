import { db } from "@/lib/db/client";
import { persons } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const GEN_LABELS: Record<number, string> = {
  1: "Đời 1 — Cụ Tổ",
  2: "Đời 2 — Cụ Cố",
  3: "Đời 3 — Cụ",
  4: "Đời 4 — Ông/Bà",
  5: "Đời 5 — Cha/Mẹ",
  6: "Đời 6 — Bản thân",
  7: "Đời 7 — Con",
  8: "Đời 8 — Cháu",
};

export default async function PhaHePage() {
  const all = await db
    .select()
    .from(persons)
    .orderBy(asc(persons.generation), asc(persons.isInLaw), asc(persons.birthOrder), asc(persons.fullName));

  const byGen = new Map<number, typeof all>();
  for (const p of all) {
    const g = p.generation ?? 99;
    if (!byGen.has(g)) byGen.set(g, []);
    byGen.get(g)!.push(p);
  }

  const sortedGens = [...byGen.keys()].sort((a, b) => a - b);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="serif text-3xl font-bold text-stone-900">Phả hệ</h1>
          <p className="mt-1 text-sm text-stone-600">
            {all.length} người · {sortedGens.length} đời.
            Sơ đồ cây + xưng hô tự động sẽ được mở ở Sprint 2.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {sortedGens.map((gen) => {
          const people = byGen.get(gen)!;
          return (
            <section key={gen}>
              <h2 className="serif text-xl font-semibold text-stone-900">
                {GEN_LABELS[gen] ?? `Đời ${gen}`}
                <span className="ml-2 text-sm font-normal text-stone-500">({people.length} người)</span>
              </h2>
              <div className="mt-3 overflow-x-auto rounded-lg border border-stone-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Họ tên</th>
                      <th className="px-4 py-3 font-medium">Giới</th>
                      <th className="px-4 py-3 font-medium">Năm sinh – mất</th>
                      <th className="px-4 py-3 font-medium">Vai trò</th>
                      <th className="px-4 py-3 font-medium">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {people.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-stone-900">{p.fullName}</div>
                          {p.otherNames && (
                            <div className="text-xs text-stone-500">({p.otherNames})</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-stone-600">
                          {p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Khác"}
                        </td>
                        <td className="px-4 py-3 text-stone-600">
                          {p.birthYear ?? "?"} – {p.isDeceased ? p.deathYear ?? "?" : <span className="text-emerald-700">đang sống</span>}
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
                        <td className="px-4 py-3 text-xs text-stone-500">{p.note ?? p.biography ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
