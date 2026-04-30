import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    redirect("/dashboard?error=admin-required");
  }
  return user;
}

export async function requireEditor() {
  const user = await requireAuth();
  if (user.role !== "admin" && user.role !== "editor") {
    redirect("/dashboard?error=editor-required");
  }
  return user;
}
