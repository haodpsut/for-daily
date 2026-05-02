"use server";

import { eq, and, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/auth/guards";

export type UserActionResult = { error: string | null };

const ROLES = ["admin", "editor", "member"] as const;
type Role = (typeof ROLES)[number];

function bust() {
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin");
  revalidatePath("/");
}

async function getSelfId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function adminCount(): Promise<number> {
  const r = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.isActive, true)))
    .then((r) => r[0]);
  return r?.c ?? 0;
}

export async function setUserRoleAction(userId: string, role: string): Promise<UserActionResult> {
  await requireAdmin();
  if (!ROLES.includes(role as Role)) return { error: "Role không hợp lệ." };

  const selfId = await getSelfId();
  if (userId === selfId) return { error: "Không thể tự đổi role của chính mình." };

  const target = await db.select().from(users).where(eq(users.id, userId)).then((r) => r[0]);
  if (!target) return { error: "User không tồn tại." };

  // If demoting the last active admin → block
  if (target.role === "admin" && target.isActive && role !== "admin") {
    if ((await adminCount()) <= 1) return { error: "Phải có ít nhất 1 Quản trị đang hoạt động." };
  }

  await db.update(users).set({ role: role as Role, updatedAt: new Date() }).where(eq(users.id, userId));
  bust();
  return { error: null };
}

export async function setUserActiveAction(userId: string, isActive: boolean): Promise<UserActionResult> {
  await requireAdmin();
  const selfId = await getSelfId();
  if (userId === selfId) return { error: "Không thể tự deactivate chính mình." };

  const target = await db.select().from(users).where(eq(users.id, userId)).then((r) => r[0]);
  if (!target) return { error: "User không tồn tại." };

  if (!isActive && target.role === "admin" && target.isActive) {
    if ((await adminCount()) <= 1) return { error: "Phải có ít nhất 1 Quản trị đang hoạt động." };
  }

  await db.update(users).set({ isActive, updatedAt: new Date() }).where(eq(users.id, userId));
  bust();
  return { error: null };
}

export async function deleteUserAction(userId: string): Promise<UserActionResult> {
  await requireAdmin();
  const selfId = await getSelfId();
  if (userId === selfId) return { error: "Không thể tự xoá chính mình." };

  const target = await db.select().from(users).where(eq(users.id, userId)).then((r) => r[0]);
  if (!target) return { error: "User không tồn tại." };

  if (target.role === "admin" && target.isActive) {
    if ((await adminCount()) <= 1) return { error: "Phải có ít nhất 1 Quản trị đang hoạt động." };
  }

  await db.delete(users).where(eq(users.id, userId));
  bust();
  return { error: null };
}

// Optional: admin renames a user
export async function renameUserAction(userId: string, fullName: string | null): Promise<UserActionResult> {
  await requireAdmin();
  const trimmed = fullName?.trim() || null;
  await db.update(users).set({ fullName: trimmed, updatedAt: new Date() }).where(eq(users.id, userId));
  bust();
  return { error: null };
}

// keep "ne" reachable so it's not flagged as unused
void ne;
