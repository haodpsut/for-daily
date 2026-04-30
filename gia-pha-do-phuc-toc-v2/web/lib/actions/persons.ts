"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { persons } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export type PersonFormState = { error: string | null; ok: boolean };

interface ParsedPerson {
  fullName: string | null;
  otherNames: string | null;
  gender: "male" | "female" | "other" | null;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthIsLunar: boolean;
  deathYear: number | null;
  deathMonth: number | null;
  deathDay: number | null;
  deathIsLunar: boolean;
  isDeceased: boolean;
  isInLaw: boolean;
  generation: number | null;
  birthOrder: number | null;
  biography: string | null;
  note: string | null;
}

function parseFormData(fd: FormData): ParsedPerson {
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
  const bool = (k: string) => fd.get(k) === "on" || fd.get(k) === "true";

  const deathYear = num("deathYear");

  return {
    fullName: get("fullName"),
    otherNames: get("otherNames"),
    gender: get("gender") as "male" | "female" | "other" | null,
    birthYear: num("birthYear"),
    birthMonth: num("birthMonth"),
    birthDay: num("birthDay"),
    birthIsLunar: bool("birthIsLunar"),
    deathYear,
    deathMonth: num("deathMonth"),
    deathDay: num("deathDay"),
    deathIsLunar: bool("deathIsLunar"),
    isDeceased: bool("isDeceased") || deathYear != null,
    isInLaw: bool("isInLaw"),
    generation: num("generation"),
    birthOrder: num("birthOrder"),
    biography: get("biography"),
    note: get("note"),
  };
}

function validate(data: ParsedPerson): string | null {
  if (!data.fullName) return "Họ tên là bắt buộc.";
  if (!data.gender || !["male", "female", "other"].includes(data.gender)) {
    return "Giới tính không hợp lệ.";
  }
  if (data.birthYear && data.birthYear < 1500) return "Năm sinh không hợp lệ (≥ 1500).";
  if (data.deathYear && data.birthYear && data.deathYear < data.birthYear) {
    return "Năm mất phải sau năm sinh.";
  }
  return null;
}

// Narrow types after validate for Drizzle insert/update
type ValidatedPerson = ParsedPerson & {
  fullName: string;
  gender: "male" | "female" | "other";
};

function toDbValues(data: ParsedPerson): ValidatedPerson {
  return {
    ...data,
    fullName: data.fullName as string,
    gender: data.gender as "male" | "female" | "other",
  };
}

export async function createPersonAction(_prev: PersonFormState, fd: FormData): Promise<PersonFormState> {
  await requireAdmin();
  const data = parseFormData(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  const [inserted] = await db.insert(persons).values(toDbValues(data)).returning({ id: persons.id });

  revalidatePath("/dashboard/phahe");
  revalidatePath("/dashboard/admin/persons");
  redirect(`/dashboard/phahe/${inserted.id}`);
}

export async function updatePersonAction(id: string, _prev: PersonFormState, fd: FormData): Promise<PersonFormState> {
  await requireAdmin();
  const data = parseFormData(fd);
  const err = validate(data);
  if (err) return { error: err, ok: false };

  await db
    .update(persons)
    .set({ ...toDbValues(data), updatedAt: new Date() })
    .where(eq(persons.id, id));

  revalidatePath("/dashboard/phahe");
  revalidatePath(`/dashboard/phahe/${id}`);
  revalidatePath("/dashboard/admin/persons");
  return { error: null, ok: true };
}

export async function deletePersonAction(id: string): Promise<{ error: string | null }> {
  await requireAdmin();
  try {
    await db.delete(persons).where(eq(persons.id, id));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xoá thất bại." };
  }
  revalidatePath("/dashboard/phahe");
  revalidatePath("/dashboard/admin/persons");
  return { error: null };
}
