"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { heritageItems } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export type HeritageFormState = { error: string | null; ok: boolean };

const TYPES = ["di_huan", "gia_phong", "cau_doi", "hoanh_phi", "van_ban_co", "tho_van"] as const;

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
    type: get("type") as (typeof TYPES)[number] | null,
    title: get("title"),
    content: get("content"),
    transliteration: get("transliteration"),
    translation: get("translation"),
    sourcePersonId: get("sourcePersonId"),
    sourceNote: get("sourceNote"),
    yearComposed: num("yearComposed"),
    displayOrder: num("displayOrder") ?? 0,
  };
}

function validate(d: ReturnType<typeof parse>): string | null {
  if (!d.title) return "Tiêu đề là bắt buộc.";
  if (!d.type || !TYPES.includes(d.type)) return "Loại di sản không hợp lệ.";
  return null;
}

function bust(id?: string) {
  revalidatePath("/dashboard/di-san");
  revalidatePath("/dashboard/admin/heritage");
  if (id) revalidatePath(`/dashboard/admin/heritage/${id}`);
}

export async function createHeritageAction(_prev: HeritageFormState, fd: FormData): Promise<HeritageFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db.insert(heritageItems).values({
    ...data,
    type: data.type as (typeof TYPES)[number],
    title: data.title as string,
  });
  bust();
  redirect("/dashboard/admin/heritage");
}

export async function updateHeritageAction(id: string, _prev: HeritageFormState, fd: FormData): Promise<HeritageFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db
    .update(heritageItems)
    .set({
      ...data,
      type: data.type as (typeof TYPES)[number],
      title: data.title as string,
      updatedAt: new Date(),
    })
    .where(eq(heritageItems.id, id));
  bust(id);
  return { error: null, ok: true };
}

export async function deleteHeritageAction(id: string) {
  await requireAdmin();
  await db.delete(heritageItems).where(eq(heritageItems.id, id));
  bust();
}
