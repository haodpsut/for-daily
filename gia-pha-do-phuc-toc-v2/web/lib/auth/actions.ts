"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPassword } from "./hash";

export type RegisterState = { error: string | null; success: boolean };

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim() || null;

  if (!email || !password) return { error: "Email và mật khẩu là bắt buộc.", success: false };
  if (!email.includes("@")) return { error: "Email không hợp lệ.", success: false };
  if (password.length < 8) return { error: "Mật khẩu phải ít nhất 8 ký tự.", success: false };

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .then((r) => r[0]);
  if (existing) return { error: "Email này đã được đăng ký.", success: false };

  // First user = admin auto
  const userCountRow = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(users)
    .then((r) => r[0]);
  const userCount = userCountRow?.c ?? 0;

  const role: "admin" | "member" = userCount === 0 ? "admin" : "member";

  await db.insert(users).values({
    email,
    passwordHash: await hashPassword(password),
    fullName,
    role,
    isActive: true,
  });

  return { error: null, success: true };
}
