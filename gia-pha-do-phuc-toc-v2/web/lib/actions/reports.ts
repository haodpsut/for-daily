"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { annualReports } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export type ReportFormState = { error: string | null; ok: boolean };

function parse(fd: FormData) {
  const get = (k: string) => {
    const v = fd.get(k);
    return v == null ? null : String(v).trim() || null;
  };
  const num = (k: string) => {
    const v = get(k);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const publishedRaw = get("publishedAt");
  return {
    year: num("year"),
    summary: get("summary"),
    totalContributions: num("totalContributions"),
    ritualCount: num("ritualCount"),
    publishedAt: publishedRaw ? new Date(publishedRaw) : null,
  };
}

function validate(d: ReturnType<typeof parse>): string | null {
  if (d.year == null || d.year < 1800 || d.year > 2200) return "Năm không hợp lệ.";
  return null;
}

function bust() {
  revalidatePath("/dashboard/tu-duong");
  revalidatePath("/dashboard/admin/reports");
}

export async function createReportAction(_prev: ReportFormState, fd: FormData): Promise<ReportFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  const dup = await db.select({ id: annualReports.id }).from(annualReports).where(eq(annualReports.year, data.year as number)).then((r) => r[0]);
  if (dup) return { error: `Đã có báo cáo cho năm ${data.year}.`, ok: false };

  await db.insert(annualReports).values({
    year: data.year as number,
    summary: data.summary,
    totalContributions: data.totalContributions,
    ritualCount: data.ritualCount,
    publishedAt: data.publishedAt,
  });
  bust();
  redirect("/dashboard/admin/reports");
}

export async function updateReportAction(id: string, _prev: ReportFormState, fd: FormData): Promise<ReportFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db
    .update(annualReports)
    .set({
      year: data.year as number,
      summary: data.summary,
      totalContributions: data.totalContributions,
      ritualCount: data.ritualCount,
      publishedAt: data.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(annualReports.id, id));
  bust();
  return { error: null, ok: true };
}

export async function deleteReportAction(id: string) {
  await requireAdmin();
  await db.delete(annualReports).where(eq(annualReports.id, id));
  bust();
}
