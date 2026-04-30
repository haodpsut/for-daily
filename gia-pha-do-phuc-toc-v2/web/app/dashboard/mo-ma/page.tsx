import { db } from "@/lib/db/client";
import { graves, persons, graveVisits } from "@/lib/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import GravesView from "@/components/GravesView";

export const dynamic = "force-dynamic";

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
        personId: graves.personId,
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
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="serif text-3xl font-bold text-stone-900">Mồ mả</h1>
      <p className="mt-1 text-sm text-stone-600">{graveList.length} mộ — bản đồ + danh sách + lịch tảo mộ.</p>

      <div className="mt-6">
        <GravesView graves={graveList} />
      </div>

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
