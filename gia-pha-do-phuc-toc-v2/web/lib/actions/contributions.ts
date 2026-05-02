"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { contributions } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export type ContribFormState = { error: string | null; ok: boolean };

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
  return {
    contributorPersonId: get("contributorPersonId"),
    contributorName: get("contributorName"),
    amountVnd: num("amountVnd"),
    inKind: get("inKind"),
    occurrenceId: get("occurrenceId"),
    reportId: get("reportId"),
    receivedOn: get("receivedOn"),
    note: get("note"),
  };
}

function validate(d: ReturnType<typeof parse>): string | null {
  if (!d.receivedOn) return "Ngày nhận là bắt buộc.";
  if (!d.contributorPersonId && !d.contributorName) return "Phải nhập tên người đóng góp HOẶC chọn từ gia phả.";
  if (!d.amountVnd && !d.inKind) return "Phải nhập số tiền HOẶC hiện vật.";
  return null;
}

function bust() {
  revalidatePath("/dashboard/tu-duong");
  revalidatePath("/dashboard/admin/contributions");
}

export async function createContribAction(_prev: ContribFormState, fd: FormData): Promise<ContribFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db.insert(contributions).values({
    contributorPersonId: data.contributorPersonId,
    contributorName: data.contributorName,
    amountVnd: data.amountVnd,
    inKind: data.inKind,
    occurrenceId: data.occurrenceId,
    reportId: data.reportId,
    receivedOn: data.receivedOn as string,
    note: data.note,
  });
  bust();
  redirect("/dashboard/admin/contributions");
}

export async function updateContribAction(id: string, _prev: ContribFormState, fd: FormData): Promise<ContribFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db
    .update(contributions)
    .set({
      contributorPersonId: data.contributorPersonId,
      contributorName: data.contributorName,
      amountVnd: data.amountVnd,
      inKind: data.inKind,
      occurrenceId: data.occurrenceId,
      reportId: data.reportId,
      receivedOn: data.receivedOn as string,
      note: data.note,
    })
    .where(eq(contributions.id, id));
  bust();
  return { error: null, ok: true };
}

export async function deleteContribAction(id: string) {
  await requireAdmin();
  await db.delete(contributions).where(eq(contributions.id, id));
  bust();
}
