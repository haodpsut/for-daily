import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { rituals } from "@/lib/db/schema";
import RitualForm from "@/components/RitualForm";
import {
  updateRitualAction, deleteRitualAction, type RitualFormState,
} from "@/lib/actions/rituals";

export const dynamic = "force-dynamic";

export default async function EditRitualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.select().from(rituals).where(eq(rituals.id, id)).then((r) => r[0]);
  if (!item) notFound();

  const update = async (prev: RitualFormState, fd: FormData) => {
    "use server";
    return updateRitualAction(id, prev, fd);
  };
  const del = async () => {
    "use server";
    await deleteRitualAction(id);
    redirect("/dashboard/admin/rituals");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/rituals" className="text-stone-500 hover:text-stone-900">Nghi lễ</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900 truncate">{item.name}</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Sửa nghi lễ</h1>
      <div className="mt-8">
        <RitualForm initial={item} action={update} submitLabel="Lưu thay đổi" onDelete={del} />
      </div>
    </main>
  );
}
