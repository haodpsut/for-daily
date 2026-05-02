import Link from "next/link";
import ReportForm from "@/components/ReportForm";
import { createReportAction } from "@/lib/actions/reports";

export const dynamic = "force-dynamic";

export default function NewReportPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/reports" className="text-stone-500 hover:text-stone-900">Báo cáo năm</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Thêm mới</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Thêm báo cáo năm</h1>
      <div className="mt-8">
        <ReportForm action={createReportAction} submitLabel="Tạo báo cáo" />
      </div>
    </main>
  );
}
