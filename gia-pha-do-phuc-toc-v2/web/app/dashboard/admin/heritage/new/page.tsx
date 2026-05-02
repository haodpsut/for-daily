import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { persons } from "@/lib/db/schema";
import HeritageForm from "@/components/HeritageForm";
import { createHeritageAction } from "@/lib/actions/heritage";

export const dynamic = "force-dynamic";

export default async function NewHeritagePage() {
  const personList = await db
    .select({ id: persons.id, fullName: persons.fullName, generation: persons.generation })
    .from(persons)
    .orderBy(asc(persons.generation), asc(persons.fullName));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/heritage" className="text-stone-500 hover:text-stone-900">Di sản</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Thêm mới</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Thêm di sản</h1>
      <p className="mt-1 text-sm text-stone-600">Di huấn, gia phong, câu đối, hoành phi, văn bản cổ…</p>

      <div className="mt-8">
        <HeritageForm action={createHeritageAction} submitLabel="Tạo di sản" persons={personList} />
      </div>
    </main>
  );
}
