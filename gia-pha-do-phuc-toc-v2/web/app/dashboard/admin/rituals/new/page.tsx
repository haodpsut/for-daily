import Link from "next/link";
import RitualForm from "@/components/RitualForm";
import { createRitualAction } from "@/lib/actions/rituals";

export const dynamic = "force-dynamic";

export default function NewRitualPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/rituals" className="text-stone-500 hover:text-stone-900">Nghi lễ</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Thêm mới</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Thêm nghi lễ</h1>
      <div className="mt-8">
        <RitualForm action={createRitualAction} submitLabel="Tạo nghi lễ" />
      </div>
    </main>
  );
}
