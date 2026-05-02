"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { rituals } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export type RitualFormState = { error: string | null; ok: boolean };

const KINDS = ["gio_to", "gio_thuong", "le_tet", "le_thanh_minh", "le_chap_tu", "khac"] as const;

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

  const offeringRaw = get("offeringList");
  let offeringList: unknown = null;
  if (offeringRaw) {
    try {
      offeringList = JSON.parse(offeringRaw);
    } catch {
      offeringList = "__invalid__";
    }
  }

  return {
    name: get("name"),
    kind: get("kind") as (typeof KINDS)[number] | null,
    purpose: get("purpose"),
    ritualScript: get("ritualScript"),
    offeringList,
    procedure: get("procedure"),
    fixedLunarMonth: num("fixedLunarMonth"),
    fixedLunarDay: num("fixedLunarDay"),
  };
}

function validate(d: ReturnType<typeof parse>): string | null {
  if (!d.name) return "Tên nghi lễ là bắt buộc.";
  if (!d.kind || !KINDS.includes(d.kind)) return "Loại nghi lễ không hợp lệ.";
  if (d.offeringList === "__invalid__") return "Danh sách vật phẩm không phải JSON hợp lệ.";
  if (d.fixedLunarMonth != null && (d.fixedLunarMonth < 1 || d.fixedLunarMonth > 12)) return "Tháng âm phải 1-12.";
  if (d.fixedLunarDay != null && (d.fixedLunarDay < 1 || d.fixedLunarDay > 30)) return "Ngày âm phải 1-30.";
  return null;
}

function bust(id?: string) {
  revalidatePath("/dashboard/tu-duong");
  revalidatePath("/dashboard/admin/rituals");
  if (id) revalidatePath(`/dashboard/admin/rituals/${id}`);
}

export async function createRitualAction(_prev: RitualFormState, fd: FormData): Promise<RitualFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db.insert(rituals).values({
    name: data.name as string,
    kind: data.kind as (typeof KINDS)[number],
    purpose: data.purpose,
    ritualScript: data.ritualScript,
    offeringList: data.offeringList === "__invalid__" ? null : data.offeringList,
    procedure: data.procedure,
    fixedLunarMonth: data.fixedLunarMonth,
    fixedLunarDay: data.fixedLunarDay,
  });
  bust();
  redirect("/dashboard/admin/rituals");
}

export async function updateRitualAction(id: string, _prev: RitualFormState, fd: FormData): Promise<RitualFormState> {
  await requireAdmin();
  const data = parse(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db
    .update(rituals)
    .set({
      name: data.name as string,
      kind: data.kind as (typeof KINDS)[number],
      purpose: data.purpose,
      ritualScript: data.ritualScript,
      offeringList: data.offeringList === "__invalid__" ? null : data.offeringList,
      procedure: data.procedure,
      fixedLunarMonth: data.fixedLunarMonth,
      fixedLunarDay: data.fixedLunarDay,
      updatedAt: new Date(),
    })
    .where(eq(rituals.id, id));
  bust(id);
  return { error: null, ok: true };
}

export async function deleteRitualAction(id: string) {
  await requireAdmin();
  await db.delete(rituals).where(eq(rituals.id, id));
  bust();
}
