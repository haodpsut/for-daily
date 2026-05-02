"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { graveVisits } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export type VisitFormState = { error: string | null; ok: boolean };

function parse(fd: FormData) {
  const get = (k: string) => {
    const v = fd.get(k);
    return v == null ? null : String(v).trim() || null;
  };
  return {
    graveId: get("graveId"),
    visitedOn: get("visitedOn"),
    visitorNames: get("visitorNames"),
    purpose: get("purpose"),
    workDone: get("workDone"),
    note: get("note"),
  };
}

function validate(d: ReturnType<typeof parse>): string | null {
  if (!d.graveId) return "Phải chọn mộ.";
  if (!d.visitedOn) return "Ngày tảo mộ là bắt buộc.";
  return null;
}

function bust() {
  revalidatePath("/dashboard/mo-ma");
  revalidatePath("/dashboard/admin/grave-visits");
}

export async function createVisitAction(_prev: VisitFormState, fd: FormData): Promise<VisitFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db.insert(graveVisits).values({
    graveId: data.graveId as string,
    visitedOn: data.visitedOn as string,
    visitorNames: data.visitorNames,
    purpose: data.purpose,
    workDone: data.workDone,
    note: data.note,
  });
  bust();
  redirect("/dashboard/admin/grave-visits");
}

export async function updateVisitAction(id: string, _prev: VisitFormState, fd: FormData): Promise<VisitFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db
    .update(graveVisits)
    .set({
      graveId: data.graveId as string,
      visitedOn: data.visitedOn as string,
      visitorNames: data.visitorNames,
      purpose: data.purpose,
      workDone: data.workDone,
      note: data.note,
    })
    .where(eq(graveVisits.id, id));
  bust();
  return { error: null, ok: true };
}

export async function deleteVisitAction(id: string) {
  await requireAdmin();
  await db.delete(graveVisits).where(eq(graveVisits.id, id));
  bust();
}
