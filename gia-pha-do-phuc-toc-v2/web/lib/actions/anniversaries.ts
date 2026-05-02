"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { deathAnniversaries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export type AnnivFormState = { error: string | null; ok: boolean };

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
    personId: get("personId"),
    lunarMonth: num("lunarMonth"),
    lunarDay: num("lunarDay"),
    importance: num("importance") ?? 1,
    ritualScript: get("ritualScript"),
    note: get("note"),
  };
}

function validate(d: ReturnType<typeof parse>): string | null {
  if (!d.personId) return "Phải chọn 1 người.";
  if (d.lunarMonth == null || d.lunarMonth < 1 || d.lunarMonth > 12) return "Tháng âm phải từ 1 đến 12.";
  if (d.lunarDay == null || d.lunarDay < 1 || d.lunarDay > 30) return "Ngày âm phải từ 1 đến 30.";
  if (d.importance < 1 || d.importance > 5) return "Trọng đại phải từ 1 đến 5.";
  return null;
}

function bust(personId?: string) {
  revalidatePath("/dashboard/tu-duong");
  revalidatePath("/dashboard/admin/anniversaries");
  if (personId) revalidatePath(`/dashboard/phahe/${personId}`);
}

export async function createAnnivAction(_prev: AnnivFormState, fd: FormData): Promise<AnnivFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db.insert(deathAnniversaries).values({
    personId: data.personId as string,
    lunarMonth: data.lunarMonth as number,
    lunarDay: data.lunarDay as number,
    importance: data.importance,
    ritualScript: data.ritualScript,
    note: data.note,
  });
  bust(data.personId ?? undefined);
  redirect("/dashboard/admin/anniversaries");
}

export async function updateAnnivAction(id: string, _prev: AnnivFormState, fd: FormData): Promise<AnnivFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db
    .update(deathAnniversaries)
    .set({
      personId: data.personId as string,
      lunarMonth: data.lunarMonth as number,
      lunarDay: data.lunarDay as number,
      importance: data.importance,
      ritualScript: data.ritualScript,
      note: data.note,
      updatedAt: new Date(),
    })
    .where(eq(deathAnniversaries.id, id));
  bust(data.personId ?? undefined);
  return { error: null, ok: true };
}

export async function deleteAnnivAction(id: string) {
  await requireAdmin();
  await db.delete(deathAnniversaries).where(eq(deathAnniversaries.id, id));
  bust();
}
