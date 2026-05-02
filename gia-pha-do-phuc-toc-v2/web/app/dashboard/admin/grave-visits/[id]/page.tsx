import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { graveVisits, graves, persons } from "@/lib/db/schema";
import VisitForm from "@/components/VisitForm";
import {
  updateVisitAction, deleteVisitAction, type VisitFormState,
} from "@/lib/actions/grave-visits";

export const dynamic = "force-dynamic";

export default async function EditVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.select().from(graveVisits).where(eq(graveVisits.id, id)).then((r) => r[0]);
  if (!item) notFound();

  const graveList = await db
    .select({ id: graves.id, cemeteryName: graves.cemeteryName, personName: persons.fullName })
    .from(graves)
    .leftJoin(persons, eq(persons.id, graves.personId))
    .orderBy(asc(persons.generation));

  const labeled = graveList.map((g) => ({
    id: g.id,
    label: g.personName ? `${g.personName} (${g.cemeteryName ?? "?"})` : (g.cemeteryName ?? "Mộ chưa định danh"),
  }));

  const update = async (prev: VisitFormState, fd: FormData) => {
    "use server";
    return updateVisitAction(id, prev, fd);
  };
  const del = async () => {
    "use server";
    await deleteVisitAction(id);
    redirect("/dashboard/admin/grave-visits");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/grave-visits" className="text-stone-500 hover:text-stone-900">Tảo mộ</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">{item.visitedOn}</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Sửa tảo mộ</h1>
      <div className="mt-8">
        <VisitForm initial={item} action={update} submitLabel="Lưu thay đổi" onDelete={del} graves={labeled} />
      </div>
    </main>
  );
}
