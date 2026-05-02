import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { annualReports } from "@/lib/db/schema";
import ReportForm from "@/components/ReportForm";
import {
  updateReportAction, deleteReportAction, type ReportFormState,
} from "@/lib/actions/reports";

export const dynamic = "force-dynamic";

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.select().from(annualReports).where(eq(annualReports.id, id)).then((r) => r[0]);
  if (!item) notFound();

  const update = async (prev: ReportFormState, fd: FormData) => {
    "use server";
    return updateReportAction(id, prev, fd);
  };
  const del = async () => {
    "use server";
    await deleteReportAction(id);
    redirect("/dashboard/admin/reports");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/reports" className="text-stone-500 hover:text-stone-900">Báo cáo năm</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">{item.year}</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Sửa báo cáo năm {item.year}</h1>
      <div className="mt-8">
        <ReportForm initial={item} action={update} submitLabel="Lưu thay đổi" onDelete={del} />
      </div>
    </main>
  );
}
