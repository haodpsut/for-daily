import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { deathAnniversaries, persons } from "@/lib/db/schema";
import AnnivForm from "@/components/AnnivForm";
import {
  updateAnnivAction, deleteAnnivAction, type AnnivFormState,
} from "@/lib/actions/anniversaries";

export const dynamic = "force-dynamic";

export default async function EditAnnivPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.select().from(deathAnniversaries).where(eq(deathAnniversaries.id, id)).then((r) => r[0]);
  if (!item) notFound();

  const personList = await db
    .select({
      id: persons.id, fullName: persons.fullName,
      generation: persons.generation, deathYear: persons.deathYear,
    })
    .from(persons)
    .orderBy(asc(persons.generation), asc(persons.fullName));

  const update = async (prev: AnnivFormState, fd: FormData) => {
    "use server";
    return updateAnnivAction(id, prev, fd);
  };
  const del = async () => {
    "use server";
    await deleteAnnivAction(id);
    redirect("/dashboard/admin/anniversaries");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/anniversaries" className="text-stone-500 hover:text-stone-900">Giỗ kỵ</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Sửa</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Sửa giỗ kỵ</h1>
      <div className="mt-8">
        <AnnivForm initial={item} action={update} submitLabel="Lưu thay đổi" onDelete={del} persons={personList} />
      </div>
    </main>
  );
}
