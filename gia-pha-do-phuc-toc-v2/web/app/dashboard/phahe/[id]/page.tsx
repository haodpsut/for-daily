import { db } from "@/lib/db/client";
import { persons, relationships, deathAnniversaries, graves } from "@/lib/db/schema";
import { eq, or, asc, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const GEN_LABELS: Record<number, string> = {
  1: "Cụ Tổ", 2: "Cụ Cố", 3: "Cụ", 4: "Ông/Bà", 5: "Cha/Mẹ", 6: "Bản thân", 7: "Con", 8: "Cháu",
};

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const person = await db.select().from(persons).where(eq(persons.id, id)).then((r) => r[0]);
  if (!person) notFound();

  const allRels = await db
    .select()
    .from(relationships)
    .where(or(eq(relationships.personA, id), eq(relationships.personB, id)));

  // Cha mẹ = ai có relationship type='biological_child' đến person này
  const parentIds = allRels
    .filter((r) => (r.type === "biological_child" || r.type === "adopted_child") && r.personB === id)
    .map((r) => r.personA);

  // Vợ/chồng
  const spouseIds = allRels
    .filter((r) => r.type === "marriage")
    .map((r) => (r.personA === id ? r.personB : r.personA));

  // Con cái
  const childIds = allRels
    .filter((r) => (r.type === "biological_child" || r.type === "adopted_child") && r.personA === id)
    .map((r) => r.personB);

  // Anh chị em ruột = con của cùng cha mẹ
  let siblingIds: string[] = [];
  if (parentIds.length > 0) {
    const parentRels = await db
      .select()
      .from(relationships)
      .where(
        inArray(relationships.personA, parentIds),
      );
    const sibSet = new Set<string>();
    for (const r of parentRels) {
      if ((r.type === "biological_child" || r.type === "adopted_child") && r.personB !== id) {
        sibSet.add(r.personB);
      }
    }
    siblingIds = [...sibSet];
  }

  const allRelatedIds = [...new Set([...parentIds, ...spouseIds, ...childIds, ...siblingIds])];
  const related = allRelatedIds.length > 0
    ? await db.select().from(persons).where(inArray(persons.id, allRelatedIds))
    : [];
  const relMap = new Map(related.map((p) => [p.id, p]));

  const [anniv, grave] = await Promise.all([
    db.select().from(deathAnniversaries).where(eq(deathAnniversaries.personId, id)).then((r) => r[0]),
    db.select().from(graves).where(eq(graves.personId, id)).then((r) => r[0]),
  ]);

  const lookup = (ids: string[]) => ids.map((i) => relMap.get(i)).filter((p): p is NonNullable<typeof p> => p != null);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <Link href="/dashboard/phahe" className="text-stone-500 hover:text-stone-900">Phả hệ</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">{person.fullName}</span>
      </div>

      <header className="rounded-lg border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="serif text-3xl font-bold text-stone-900">{person.fullName}</h1>
            {person.otherNames && (
              <p className="mt-1 text-sm italic text-stone-600">({person.otherNames})</p>
            )}
            <p className="mt-2 text-sm text-stone-700">
              Đời {person.generation} {person.generation && GEN_LABELS[person.generation] && `— ${GEN_LABELS[person.generation]}`}
              {" · "}{person.gender === "male" ? "Nam" : person.gender === "female" ? "Nữ" : "Khác"}
              {person.isInLaw && " · Dâu/Rể"}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Sinh: {person.birthYear ?? "?"}
              {person.birthMonth && person.birthDay && ` (${person.birthDay}/${person.birthMonth}${person.birthIsLunar ? " ÂL" : ""})`}
              {person.isDeceased ? (
                <>
                  {" · "}Mất: {person.deathYear ?? "?"}
                  {person.deathMonth && person.deathDay && ` (${person.deathDay}/${person.deathMonth}${person.deathIsLunar ? " ÂL" : ""})`}
                </>
              ) : (
                <span className="ml-2 text-emerald-700">đang sống</span>
              )}
            </p>
          </div>
        </div>

        {person.biography && (
          <div className="mt-4 border-t border-stone-100 pt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tiểu sử</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">{person.biography}</p>
          </div>
        )}

        {person.note && (
          <p className="mt-3 rounded bg-amber-50 p-3 text-xs text-amber-900">{person.note}</p>
        )}
      </header>

      {/* Family relations */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <RelGroup title="Cha/Mẹ" people={lookup(parentIds)} />
        <RelGroup title="Vợ/Chồng" people={lookup(spouseIds)} />
        <RelGroup title="Anh/Chị/Em ruột" people={lookup(siblingIds)} />
        <RelGroup title="Con" people={lookup(childIds)} />
      </section>

      {/* Anniv + Grave */}
      {(anniv || grave) && (
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {anniv && (
            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <h3 className="serif text-lg font-semibold text-stone-900">Giỗ kỵ</h3>
              <p className="mt-2 text-sm text-stone-700">
                Ngày <strong>{anniv.lunarDay}/{anniv.lunarMonth} ÂL</strong> hàng năm
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Trọng đại: {Array.from({ length: anniv.importance }).map(() => "★").join("")}
              </p>
              {anniv.note && <p className="mt-2 text-xs text-stone-600">{anniv.note}</p>}
            </div>
          )}
          {grave && (
            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <h3 className="serif text-lg font-semibold text-stone-900">Mộ phần</h3>
              <p className="mt-2 text-sm text-stone-700">{grave.cemeteryName}</p>
              {grave.locationDescription && (
                <p className="mt-1 text-xs text-stone-600">📍 {grave.locationDescription}</p>
              )}
              {grave.inscription && (
                <p className="mt-2 italic text-xs text-stone-600 border-l-2 border-stone-300 pl-2">
                  &ldquo;{grave.inscription}&rdquo;
                </p>
              )}
            </div>
          )}
        </section>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href={`/dashboard/phahe/xung-ho?a=${person.id}`}
          className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
        >
          Tính xưng hô với người khác →
        </Link>
      </div>
    </main>
  );
}

function RelGroup({ title, people }: { title: string; people: Array<{ id: string; fullName: string; gender: string; isInLaw: boolean; birthYear: number | null; deathYear: number | null }> }) {
  if (people.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</h3>
        <p className="mt-2 text-sm text-stone-400">Không có dữ liệu</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {title} ({people.length})
      </h3>
      <ul className="mt-2 space-y-2">
        {people.map((p) => (
          <li key={p.id}>
            <Link
              href={`/dashboard/phahe/${p.id}`}
              className="block rounded px-2 py-1.5 text-sm hover:bg-stone-50"
            >
              <span className="font-medium text-stone-900">{p.fullName}</span>
              <span className="ml-2 text-xs text-stone-500">
                {p.birthYear ?? "?"}–{p.deathYear ?? (p.isInLaw ? "" : "")}
                {p.isInLaw && " · Dâu/Rể"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
