import { db } from "@/lib/db/client";
import { persons, relationships } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import KinshipCalculator from "@/components/KinshipCalculator";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function XungHoPage() {
  const [allPersons, allRels] = await Promise.all([
    db.select().from(persons).orderBy(asc(persons.generation), asc(persons.fullName)),
    db.select().from(relationships),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <Link href="/dashboard/phahe" className="text-stone-500 hover:text-stone-900">Phả hệ</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Tính xưng hô</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Tính xưng hô</h1>
      <p className="mt-1 text-sm text-stone-600">
        Chọn 2 người trong dòng tộc, hệ thống sẽ tính cách họ gọi nhau theo phong tục Việt.
        Hỗ trợ huyết thống tới 9 đời, qua hôn nhân (dâu/rể, anh em cột chèo, chị em dâu).
      </p>

      <div className="mt-8">
        <KinshipCalculator persons={allPersons} relationships={allRels} />
      </div>
    </main>
  );
}
