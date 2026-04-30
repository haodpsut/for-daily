import { db } from "@/lib/db/client";
import { graves, persons, graveVisits } from "@/lib/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  kien_co: "Kiên cố",
  dat: "Mộ đất",
  cai_tang_xong: "Đã cải táng",
  that_lac: "Thất lạc",
  khac: "Khác",
};

const STATUS_COLORS: Record<string, string> = {
  kien_co: "bg-emerald-100 text-emerald-800",
  dat: "bg-amber-100 text-amber-800",
  cai_tang_xong: "bg-stone-200 text-stone-700",
  that_lac: "bg-rose-100 text-rose-800",
  khac: "bg-stone-100 text-stone-700",
};

export default async function MoMaPage() {
  const [graveList, visits] = await Promise.all([
    db
      .select({
        id: graves.id,
        cemeteryName: graves.cemeteryName,
        addressText: graves.addressText,
        geoLat: graves.geoLat,
        geoLng: graves.geoLng,
        locationDescription: graves.locationDescription,
        status: graves.status,
        builtOn: graves.builtOn,
        lastReinterredOn: graves.lastReinterredOn,
        inscription: graves.inscription,
        personName: persons.fullName,
        personGen: persons.generation,
        birthYear: persons.birthYear,
        deathYear: persons.deathYear,
      })
      .from(graves)
      .leftJoin(persons, eq(persons.id, graves.personId))
      .orderBy(asc(persons.generation), asc(persons.birthOrder)),
    db
      .select()
      .from(graveVisits)
      .orderBy(desc(graveVisits.visitedOn))
      .limit(10),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="serif text-3xl font-bold text-stone-900">Mồ mả</h1>
      <p className="mt-1 text-sm text-stone-600">
        {graveList.length} mộ · Bản đồ Leaflet sẽ thêm ở Sprint 6.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {graveList.map((g) => (
          <article key={g.id} className="rounded-lg border border-stone-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="serif text-lg font-semibold text-stone-900">{g.personName}</h2>
                <p className="text-xs text-stone-500">
                  Đời {g.personGen} · {g.birthYear ?? "?"}–{g.deathYear ?? "?"}
                </p>
              </div>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${STATUS_COLORS[g.status] ?? "bg-stone-100 text-stone-700"}`}
              >
                {STATUS_LABELS[g.status] ?? g.status}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-sm text-stone-700">
              {g.cemeteryName && <p>{g.cemeteryName}</p>}
              {g.addressText && <p className="text-xs text-stone-500">{g.addressText}</p>}
              {g.locationDescription && (
                <p className="text-xs text-stone-600">📍 {g.locationDescription}</p>
              )}
            </div>

            {(g.geoLat && g.geoLng) && (
              <p className="mt-2 text-xs text-stone-400">
                {g.geoLat.toFixed(6)}, {g.geoLng.toFixed(6)}
              </p>
            )}

            {g.inscription && (
              <p className="mt-3 italic text-sm text-stone-600 border-l-2 border-stone-300 pl-3">
                &ldquo;{g.inscription}&rdquo;
              </p>
            )}

            {(g.builtOn || g.lastReinterredOn) && (
              <p className="mt-2 text-xs text-stone-500">
                {g.builtOn && `Xây: ${g.builtOn}`}
                {g.builtOn && g.lastReinterredOn && " · "}
                {g.lastReinterredOn && `Cải táng gần nhất: ${g.lastReinterredOn}`}
              </p>
            )}
          </article>
        ))}
      </section>

      {visits.length > 0 && (
        <section className="mt-10">
          <h2 className="serif text-xl font-semibold text-stone-900">Lịch sử tảo mộ ({visits.length})</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-stone-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Ngày</th>
                  <th className="px-4 py-3 font-medium">Mục đích</th>
                  <th className="px-4 py-3 font-medium">Người đi</th>
                  <th className="px-4 py-3 font-medium">Việc đã làm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 font-medium">{v.visitedOn}</td>
                    <td className="px-4 py-3 text-stone-700">{v.purpose}</td>
                    <td className="px-4 py-3 text-stone-600">{v.visitorNames}</td>
                    <td className="px-4 py-3 text-xs text-stone-500">{v.workDone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
