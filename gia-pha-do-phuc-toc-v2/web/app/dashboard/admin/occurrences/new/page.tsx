import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { rituals, deathAnniversaries, persons } from "@/lib/db/schema";
import OccurrenceForm from "@/components/OccurrenceForm";
import { createOccurrenceAction } from "@/lib/actions/occurrences";

export const dynamic = "force-dynamic";

export default async function NewOccurrencePage() {
  const [ritualList, annivList, personList] = await Promise.all([
    db.select({ id: rituals.id, name: rituals.name }).from(rituals).orderBy(asc(rituals.name)),
    db
      .select({
        id: deathAnniversaries.id,
        personName: persons.fullName,
        lunarMonth: deathAnniversaries.lunarMonth,
        lunarDay: deathAnniversaries.lunarDay,
      })
      .from(deathAnniversaries)
      .leftJoin(persons, eq(persons.id, deathAnniversaries.personId))
      .orderBy(asc(deathAnniversaries.lunarMonth), asc(deathAnniversaries.lunarDay)),
    db
      .select({ id: persons.id, fullName: persons.fullName, generation: persons.generation })
      .from(persons)
      .orderBy(asc(persons.generation), asc(persons.fullName)),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/occurrences" className="text-stone-500 hover:text-stone-900">Lần thực hiện lễ</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Thêm mới</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Thêm lần thực hiện lễ</h1>
      <div className="mt-8">
        <OccurrenceForm
          action={createOccurrenceAction}
          submitLabel="Tạo"
          rituals={ritualList}
          anniversaries={annivList}
          persons={personList}
        />
      </div>
    </main>
  );
}
