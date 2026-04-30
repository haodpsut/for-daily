import Link from "next/link";
import PersonForm from "@/components/PersonForm";
import { createPersonAction } from "@/lib/actions/persons";

export const dynamic = "force-dynamic";

export default function NewPersonPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/persons" className="text-stone-500 hover:text-stone-900">Quản lý Người</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Thêm người</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Thêm người vào gia phả</h1>
      <p className="mt-1 text-sm text-stone-600">
        Quan hệ (cha/mẹ/vợ/chồng) sẽ thêm sau khi tạo người, trên trang chi tiết.
      </p>

      <div className="mt-8">
        <PersonForm action={createPersonAction} submitLabel="Tạo người mới" />
      </div>
    </main>
  );
}
