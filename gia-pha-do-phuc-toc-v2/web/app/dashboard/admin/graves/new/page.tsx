import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { persons } from "@/lib/db/schema";
import GraveForm from "@/components/GraveForm";
import { createGraveAction } from "@/lib/actions/graves";

export const dynamic = "force-dynamic";

export default async function NewGravePage() {
  const personList = await db
    .select({
      id: persons.id, fullName: persons.fullName,
      generation: persons.generation, deathYear: persons.deathYear,
    })
    .from(persons)
    .orderBy(asc(persons.generation), asc(persons.fullName));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/graves" className="text-stone-500 hover:text-stone-900">Mồ mả</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Thêm mới</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Thêm mộ phần</h1>
      <div className="mt-8">
        <GraveForm action={createGraveAction} submitLabel="Tạo mộ" persons={personList} />
      </div>
    </main>
  );
}
