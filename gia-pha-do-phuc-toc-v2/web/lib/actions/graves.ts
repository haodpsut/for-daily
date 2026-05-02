"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { graves } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export type GraveFormState = { error: string | null; ok: boolean };

const STATUSES = ["kien_co", "dat", "cai_tang_xong", "that_lac", "khac"] as const;

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
    cemeteryName: get("cemeteryName"),
    addressText: get("addressText"),
    geoLat: num("geoLat"),
    geoLng: num("geoLng"),
    locationDescription: get("locationDescription"),
    status: (get("status") ?? "dat") as (typeof STATUSES)[number],
    builtOn: get("builtOn"),
    lastReinterredOn: get("lastReinterredOn"),
    inscription: get("inscription"),
    note: get("note"),
  };
}

function validate(d: ReturnType<typeof parse>): string | null {
  if (!STATUSES.includes(d.status)) return "Trạng thái không hợp lệ.";
  if (d.geoLat != null && (d.geoLat < -90 || d.geoLat > 90)) return "Vĩ độ không hợp lệ.";
  if (d.geoLng != null && (d.geoLng < -180 || d.geoLng > 180)) return "Kinh độ không hợp lệ.";
  return null;
}

function bust(personId?: string) {
  revalidatePath("/dashboard/mo-ma");
  revalidatePath("/dashboard/admin/graves");
  if (personId) revalidatePath(`/dashboard/phahe/${personId}`);
}

export async function createGraveAction(_prev: GraveFormState, fd: FormData): Promise<GraveFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db.insert(graves).values(data);
  bust(data.personId ?? undefined);
  redirect("/dashboard/admin/graves");
}

export async function updateGraveAction(id: string, _prev: GraveFormState, fd: FormData): Promise<GraveFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db.update(graves).set({ ...data, updatedAt: new Date() }).where(eq(graves.id, id));
  bust(data.personId ?? undefined);
  return { error: null, ok: true };
}

export async function deleteGraveAction(id: string) {
  await requireAdmin();
  await db.delete(graves).where(eq(graves.id, id));
  bust();
}
