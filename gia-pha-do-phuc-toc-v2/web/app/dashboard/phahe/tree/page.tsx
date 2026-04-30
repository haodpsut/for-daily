import { db } from "@/lib/db/client";
import { persons, relationships } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import FamilyTree from "@/components/FamilyTree";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TreePage() {
  const [allPersons, allRels] = await Promise.all([
    db.select().from(persons).orderBy(asc(persons.generation), asc(persons.birthOrder)),
    db.select().from(relationships),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <Link href="/dashboard/phahe" className="text-stone-500 hover:text-stone-900">Phả hệ</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Cây phả hệ</span>
      </div>

      <h1 className="serif text-2xl font-bold text-stone-900">Cây phả hệ</h1>
      <p className="mt-1 text-xs text-stone-500">
        {allPersons.length} người · Click vào tên để xem chi tiết · Nút <strong>−/+</strong> để đóng/mở nhánh
      </p>

      <div className="mt-4">
        <FamilyTree persons={allPersons} relationships={allRels} />
      </div>
    </main>
  );
}
