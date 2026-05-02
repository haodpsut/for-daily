"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { ritualOccurrences } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export type OccurrenceFormState = { error: string | null; ok: boolean };

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
    ritualId: get("ritualId"),
    deathAnniversaryId: get("deathAnniversaryId"),
    occurredOn: get("occurredOn"),
    hostPersonId: get("hostPersonId"),
    location: get("location"),
    attendeeCount: num("attendeeCount"),
    summary: get("summary"),
  };
}

function validate(d: ReturnType<typeof parse>): string | null {
  if (!d.occurredOn) return "Ngày tổ chức là bắt buộc.";
  if (!d.ritualId && !d.deathAnniversaryId) return "Phải chọn nghi lễ HOẶC giỗ kỵ.";
  if (d.ritualId && d.deathAnniversaryId) return "Chỉ được chọn một trong hai (nghi lễ hoặc giỗ kỵ).";
  return null;
}

function bust() {
  revalidatePath("/dashboard/tu-duong");
  revalidatePath("/dashboard/admin/occurrences");
}

export async function createOccurrenceAction(_prev: OccurrenceFormState, fd: FormData): Promise<OccurrenceFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db.insert(ritualOccurrences).values({
    ritualId: data.ritualId,
    deathAnniversaryId: data.deathAnniversaryId,
    occurredOn: data.occurredOn as string,
    hostPersonId: data.hostPersonId,
    location: data.location,
    attendeeCount: data.attendeeCount,
    summary: data.summary,
  });
  bust();
  redirect("/dashboard/admin/occurrences");
}

export async function updateOccurrenceAction(id: string, _prev: OccurrenceFormState, fd: FormData): Promise<OccurrenceFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db
    .update(ritualOccurrences)
    .set({
      ritualId: data.ritualId,
      deathAnniversaryId: data.deathAnniversaryId,
      occurredOn: data.occurredOn as string,
      hostPersonId: data.hostPersonId,
      location: data.location,
      attendeeCount: data.attendeeCount,
      summary: data.summary,
      updatedAt: new Date(),
    })
    .where(eq(ritualOccurrences.id, id));
  bust();
  return { error: null, ok: true };
}

export async function deleteOccurrenceAction(id: string) {
  await requireAdmin();
  await db.delete(ritualOccurrences).where(eq(ritualOccurrences.id, id));
  bust();
}
