import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { persons, ritualOccurrences, rituals, deathAnniversaries, annualReports } from "@/lib/db/schema";
import ContribForm from "@/components/ContribForm";
import { createContribAction } from "@/lib/actions/contributions";

export const dynamic = "force-dynamic";

export default async function NewContribPage() {
  const [personList, occurrenceList, reportList] = await Promise.all([
    db
      .select({ id: persons.id, fullName: persons.fullName, generation: persons.generation })
      .from(persons)
      .orderBy(asc(persons.generation), asc(persons.fullName)),
    db
      .select({
        id: ritualOccurrences.id,
        occurredOn: ritualOccurrences.occurredOn,
        ritualName: rituals.name,
        annivPersonName: persons.fullName,
        annivLunarMonth: deathAnniversaries.lunarMonth,
        annivLunarDay: deathAnniversaries.lunarDay,
      })
      .from(ritualOccurrences)
      .leftJoin(rituals, eq(rituals.id, ritualOccurrences.ritualId))
      .leftJoin(deathAnniversaries, eq(deathAnniversaries.id, ritualOccurrences.deathAnniversaryId))
      .leftJoin(persons, eq(persons.id, deathAnniversaries.personId))
      .orderBy(desc(ritualOccurrences.occurredOn)),
    db
      .select({ id: annualReports.id, year: annualReports.year })
      .from(annualReports)
      .orderBy(desc(annualReports.year)),
  ]);

  const occurrences = occurrenceList.map((o) => ({
    id: o.id,
    label: `${o.occurredOn} — ${o.ritualName ?? `Giỗ ${o.annivPersonName} (${o.annivLunarDay}/${o.annivLunarMonth} ÂL)`}`,
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/contributions" className="text-stone-500 hover:text-stone-900">Công đức</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Thêm mới</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Thêm khoản công đức</h1>
      <div className="mt-8">
        <ContribForm
          action={createContribAction}
          submitLabel="Tạo"
          persons={personList}
          occurrences={occurrences}
          reports={reportList}
        />
      </div>
    </main>
  );
}
