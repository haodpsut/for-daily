"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { ancestralHallInfo } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export type HallFormState = { error: string | null; ok: boolean };

function get(fd: FormData, k: string) {
  const v = fd.get(k);
  return v == null ? null : String(v).trim() || null;
}
function num(fd: FormData, k: string) {
  const v = get(fd, k);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseContact(fd: FormData): Record<string, string> | null {
  const obj: Record<string, string> = {};
  for (const k of ["truong_toc", "phone", "email"]) {
    const v = String(fd.get(`contact_${k}`) ?? "").trim();
    if (v) obj[k] = v;
  }
  return Object.keys(obj).length ? obj : null;
}

export async function updateHallAction(_prev: HallFormState, fd: FormData): Promise<HallFormState> {
  await requireAdmin();

  const name = get(fd, "name");
  if (!name) return { error: "Tên Từ đường là bắt buộc.", ok: false };

  const data = {
    name,
    address: get(fd, "address"),
    geoLat: num(fd, "geoLat"),
    geoLng: num(fd, "geoLng"),
    history: get(fd, "history"),
    heroImageUrl: get(fd, "heroImageUrl"),
    contactInfo: parseContact(fd),
    updatedAt: new Date(),
  };

  // Upsert singleton (id=1)
  await db
    .insert(ancestralHallInfo)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({ target: ancestralHallInfo.id, set: data });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/hall");
  return { error: null, ok: true };
}
