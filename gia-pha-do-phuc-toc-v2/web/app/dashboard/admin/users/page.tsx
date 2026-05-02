import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserTable from "@/components/UserTable";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const all = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const stats = await db
    .select({
      total: sql<number>`count(*)::int`,
      admins: sql<number>`count(*) filter (where role = 'admin' and is_active)::int`,
      editors: sql<number>`count(*) filter (where role = 'editor' and is_active)::int`,
      members: sql<number>`count(*) filter (where role = 'member' and is_active)::int`,
      inactive: sql<number>`count(*) filter (where is_active = false)::int`,
    })
    .from(users)
    .then((r) => r[0]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin" className="text-stone-500 hover:text-stone-900">Quản trị</Link>
        <span className="text-stone-400">/</span>
        <span className="font-medium text-stone-900">Tài khoản</span>
      </div>

      <h1 className="serif text-3xl font-bold text-stone-900">Quản lý tài khoản</h1>
      <p className="mt-1 text-sm text-stone-600">
        {stats?.total ?? 0} tài khoản · {stats?.admins ?? 0} quản trị · {stats?.editors ?? 0} biên tập ·{" "}
        {stats?.members ?? 0} thành viên · {stats?.inactive ?? 0} bị khoá
      </p>

      <div className="mt-6 rounded-lg border border-rose-100 bg-rose-50/40 p-4 text-sm">
        <h3 className="font-semibold text-rose-900">Quy tắc bảo vệ</h3>
        <ul className="mt-2 list-disc pl-5 text-xs text-rose-800 space-y-1">
          <li>Hệ thống <strong>luôn giữ ít nhất 1 Quản trị đang hoạt động</strong>. Không thể xoá / hạ role / khoá người admin cuối cùng.</li>
          <li>Anh không thể tự đổi role / khoá / xoá tài khoản của mình.</li>
          <li>Member mới đăng ký = Active mặc định, role = Thành viên (chỉ đọc).</li>
        </ul>
      </div>

      <div className="mt-6">
        <UserTable users={all} currentUserId={session.user.id} />
      </div>
    </main>
  );
}
