import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { ancestralHallInfo } from "@/lib/db/schema";
import HallForm from "@/components/HallForm";

export const dynamic = "force-dynamic";

export default async function HallAdminPage() {
  const data = await db.select().from(ancestralHallInfo).where(eq(ancestralHallInfo.id, 1)).then((r) => r[0] ?? null);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin" className="text-stone-500 hover:text-stone-900">Quản trị</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Từ đường</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Thông tin Từ đường</h1>
      <p className="mt-1 text-sm text-stone-600">
        Hiển thị ở landing page (công khai) và dashboard. Vĩ độ/kinh độ dùng cho bản đồ Mồ mả nếu trùng vùng.
      </p>

      <div className="mt-8">
        <HallForm data={data} />
      </div>
    </main>
  );
}
