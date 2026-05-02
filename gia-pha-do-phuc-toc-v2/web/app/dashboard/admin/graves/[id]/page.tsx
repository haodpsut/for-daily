import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { graves, persons } from "@/lib/db/schema";
import GraveForm from "@/components/GraveForm";
import {
  updateGraveAction, deleteGraveAction, type GraveFormState,
} from "@/lib/actions/graves";

export const dynamic = "force-dynamic";

export default async function EditGravePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.select().from(graves).where(eq(graves.id, id)).then((r) => r[0]);
  if (!item) notFound();

  const personList = await db
    .select({
      id: persons.id, fullName: persons.fullName,
      generation: persons.generation, deathYear: persons.deathYear,
    })
    .from(persons)
    .orderBy(asc(persons.generation), asc(persons.fullName));

  const update = async (prev: GraveFormState, fd: FormData) => {
    "use server";
    return updateGraveAction(id, prev, fd);
  };
  const del = async () => {
    "use server";
    await deleteGraveAction(id);
    redirect("/dashboard/admin/graves");
  };

  // Convert date strings safely
  const initial = {
    ...item,
    builtOn: item.builtOn ?? null,
    lastReinterredOn: item.lastReinterredOn ?? null,
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/graves" className="text-stone-500 hover:text-stone-900">Mồ mả</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Sửa</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Sửa mộ phần</h1>
      <div className="mt-8">
        <GraveForm initial={initial} action={update} submitLabel="Lưu thay đổi" onDelete={del} persons={personList} />
      </div>
    </main>
  );
}
