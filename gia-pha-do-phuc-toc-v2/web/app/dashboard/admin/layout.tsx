import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";

const TABS = [
  { href: "/dashboard/admin",                label: "Tổng quan" },
  { href: "/dashboard/admin/hall",           label: "Từ đường" },
  { href: "/dashboard/admin/persons",        label: "Người" },
  { href: "/dashboard/admin/anniversaries",  label: "Giỗ kỵ" },
  { href: "/dashboard/admin/heritage",       label: "Di sản" },
  { href: "/dashboard/admin/graves",         label: "Mồ mả" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <>
      <div className="border-b border-rose-100 bg-rose-50/60">
        <div className="mx-auto max-w-7xl px-6 py-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-rose-900">⚙ Khu Quản trị</span>
            <span className="text-stone-400">·</span>
            <nav className="flex gap-1 overflow-x-auto">
              {TABS.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="rounded px-2 py-1 text-rose-700 hover:bg-white hover:text-rose-900"
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
