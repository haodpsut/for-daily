import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { heritageItems, persons } from "@/lib/db/schema";
import HeritageForm from "@/components/HeritageForm";
import {
  updateHeritageAction, deleteHeritageAction, type HeritageFormState,
} from "@/lib/actions/heritage";

export const dynamic = "force-dynamic";

export default async function EditHeritagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.select().from(heritageItems).where(eq(heritageItems.id, id)).then((r) => r[0]);
  if (!item) notFound();

  const personList = await db
    .select({ id: persons.id, fullName: persons.fullName, generation: persons.generation })
    .from(persons)
    .orderBy(asc(persons.generation), asc(persons.fullName));

  const update = async (prev: HeritageFormState, fd: FormData) => {
    "use server";
    return updateHeritageAction(id, prev, fd);
  };
  const del = async () => {
    "use server";
    await deleteHeritageAction(id);
    redirect("/dashboard/admin/heritage");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/heritage" className="text-stone-500 hover:text-stone-900">Di sản</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900 truncate">{item.title}</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Sửa di sản</h1>

      <div className="mt-8">
        <HeritageForm
          initial={item}
          action={update}
          submitLabel="Lưu thay đổi"
          onDelete={del}
          persons={personList}
        />
      </div>
    </main>
  );
}
