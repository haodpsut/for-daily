import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { persons } from "@/lib/db/schema";
import PersonForm from "@/components/PersonForm";
import { updatePersonAction, deletePersonAction, type PersonFormState } from "@/lib/actions/persons";

export const dynamic = "force-dynamic";

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await db.select().from(persons).where(eq(persons.id, id)).then((r) => r[0]);
  if (!person) notFound();

  // Bind id to update + delete actions
  const update = async (prev: PersonFormState, fd: FormData) => {
    "use server";
    return updatePersonAction(id, prev, fd);
  };
  const del = async () => {
    "use server";
    const res = await deletePersonAction(id);
    if (res.error) {
      // FK constraint or similar — bubble through redirect with msg
      redirect(`/dashboard/admin/persons/${id}?err=${encodeURIComponent(res.error)}`);
    }
    redirect("/dashboard/admin/persons");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/persons" className="text-stone-500 hover:text-stone-900">Quản lý Người</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Sửa: {person.fullName}</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Sửa thông tin</h1>
      <p className="mt-1 text-sm text-stone-600">
        ID: <code className="text-xs text-stone-500">{person.id}</code>
      </p>

      <div className="mt-8">
        <PersonForm
          initial={person}
          action={update}
          submitLabel="Lưu thay đổi"
          onDelete={del}
        />
      </div>
    </main>
  );
}
