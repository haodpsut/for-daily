import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { ritualOccurrences, rituals, deathAnniversaries, persons } from "@/lib/db/schema";
import OccurrenceForm from "@/components/OccurrenceForm";
import {
  updateOccurrenceAction, deleteOccurrenceAction, type OccurrenceFormState,
} from "@/lib/actions/occurrences";

export const dynamic = "force-dynamic";

export default async function EditOccurrencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.select().from(ritualOccurrences).where(eq(ritualOccurrences.id, id)).then((r) => r[0]);
  if (!item) notFound();

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

  const update = async (prev: OccurrenceFormState, fd: FormData) => {
    "use server";
    return updateOccurrenceAction(id, prev, fd);
  };
  const del = async () => {
    "use server";
    await deleteOccurrenceAction(id);
    redirect("/dashboard/admin/occurrences");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/occurrences" className="text-stone-500 hover:text-stone-900">Lần thực hiện lễ</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">{item.occurredOn}</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Sửa lần thực hiện</h1>
      <div className="mt-8">
        <OccurrenceForm
          initial={item}
          action={update}
          submitLabel="Lưu thay đổi"
          onDelete={del}
          rituals={ritualList}
          anniversaries={annivList}
          persons={personList}
        />
      </div>
    </main>
  );
}
