import Link from "next/link";
import { auth } from "@/auth";
import UserMenu from "@/components/UserMenu";

const SITE_NAME = process.env.SITE_NAME ?? "Đỗ Phúc Tộc";

const TABS = [
  { href: "/dashboard",          label: "Tổng quan", adminOnly: false },
  { href: "/dashboard/phahe",    label: "Phả hệ",    adminOnly: false },
  { href: "/dashboard/tu-duong", label: "Từ đường",  adminOnly: false },
  { href: "/dashboard/di-san",   label: "Di sản",    adminOnly: false },
  { href: "/dashboard/mo-ma",    label: "Mồ mả",     adminOnly: false },
  { href: "/dashboard/admin",    label: "Quản trị",  adminOnly: true },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  // Use empty-string fallbacks so types stay narrow (string, not string | null | undefined)
  const displayName: string = user?.name || user?.email || "Thành viên";
  const email: string = user?.email || "";

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between gap-4 py-4">
            <Link href="/" className="serif text-xl font-bold text-stone-900">
              {SITE_NAME}
            </Link>
            {user ? (
              <UserMenu name={displayName} email={email} role={user.role} />
            ) : (
              <Link href="/login" className="text-xs text-stone-500 hover:text-stone-900">
                Đăng nhập
              </Link>
            )}
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.filter((t) => !t.adminOnly || user?.role === "admin").map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`border-b-2 border-transparent px-4 py-2 text-sm font-medium transition hover:border-stone-300 ${
                  t.adminOnly ? "text-rose-700 hover:text-rose-900" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
