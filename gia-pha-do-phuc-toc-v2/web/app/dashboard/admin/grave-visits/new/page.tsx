import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { graves, persons } from "@/lib/db/schema";
import VisitForm from "@/components/VisitForm";
import { createVisitAction } from "@/lib/actions/grave-visits";

export const dynamic = "force-dynamic";

export default async function NewVisitPage() {
  const graveList = await db
    .select({
      id: graves.id,
      cemeteryName: graves.cemeteryName,
      personName: persons.fullName,
    })
    .from(graves)
    .leftJoin(persons, eq(persons.id, graves.personId))
    .orderBy(asc(persons.generation));

  const labeled = graveList.map((g) => ({
    id: g.id,
    label: g.personName ? `${g.personName} (${g.cemeteryName ?? "?"})` : (g.cemeteryName ?? "Mộ chưa định danh"),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/grave-visits" className="text-stone-500 hover:text-stone-900">Tảo mộ</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Thêm mới</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Thêm tảo mộ</h1>
      <div className="mt-8">
        <VisitForm action={createVisitAction} submitLabel="Tạo" graves={labeled} />
      </div>
    </main>
  );
}
