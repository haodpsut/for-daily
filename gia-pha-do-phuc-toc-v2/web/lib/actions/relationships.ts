"use server";

import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { relationships } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

type ChildLinkType = "biological_child" | "adopted_child";

export type RelActionResult = { error: string | null };

function bust(...ids: Array<string | undefined>) {
  revalidatePath("/dashboard/phahe");
  revalidatePath("/dashboard/phahe/tree");
  revalidatePath("/dashboard/phahe/xung-ho");
  for (const id of ids) {
    if (id) revalidatePath(`/dashboard/phahe/${id}`);
  }
}

export async function addParentAction(
  childId: string,
  parentId: string,
  type: ChildLinkType = "biological_child",
): Promise<RelActionResult> {
  await requireAdmin();
  if (!childId || !parentId) return { error: "Thiếu ID." };
  if (childId === parentId) return { error: "Không thể là cha/mẹ của chính mình." };

  const existing = await db
    .select()
    .from(relationships)
    .where(
      and(
        eq(relationships.type, type),
        eq(relationships.personA, parentId),
        eq(relationships.personB, childId),
      ),
    )
    .then((r) => r[0]);
  if (existing) return { error: "Quan hệ này đã được ghi nhận." };

  await db.insert(relationships).values({ type, personA: parentId, personB: childId });
  bust(childId, parentId);
  return { error: null };
}

export async function addChildAction(
  parentId: string,
  childId: string,
  type: ChildLinkType = "biological_child",
): Promise<RelActionResult> {
  return addParentAction(childId, parentId, type);
}

export async function addSpouseAction(personA: string, personB: string): Promise<RelActionResult> {
  await requireAdmin();
  if (!personA || !personB) return { error: "Thiếu ID." };
  if (personA === personB) return { error: "Không thể kết hôn với chính mình." };

  const existing = await db
    .select()
    .from(relationships)
    .where(
      and(
        eq(relationships.type, "marriage"),
        or(
          and(eq(relationships.personA, personA), eq(relationships.personB, personB)),
          and(eq(relationships.personA, personB), eq(relationships.personB, personA)),
        ),
      ),
    )
    .then((r) => r[0]);
  if (existing) return { error: "Đã ghi nhận hôn nhân này." };

  await db.insert(relationships).values({
    type: "marriage",
    personA,
    personB,
  });
  bust(personA, personB);
  return { error: null };
}

export async function removeRelationshipAction(relId: string): Promise<RelActionResult> {
  await requireAdmin();
  if (!relId) return { error: "Thiếu ID." };

  const rel = await db
    .select()
    .from(relationships)
    .where(eq(relationships.id, relId))
    .then((r) => r[0]);
  if (!rel) return { error: "Quan hệ không tồn tại." };

  await db.delete(relationships).where(eq(relationships.id, relId));
  bust(rel.personA, rel.personB);
  return { error: null };
}
