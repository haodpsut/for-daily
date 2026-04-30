import Link from "next/link";

const SITE_NAME = process.env.SITE_NAME ?? "Đỗ Phúc Tộc";

const TABS = [
  { href: "/dashboard",          label: "Tổng quan" },
  { href: "/dashboard/phahe",    label: "Phả hệ" },
  { href: "/dashboard/tu-duong", label: "Từ đường" },
  { href: "/dashboard/di-san",   label: "Di sản" },
  { href: "/dashboard/mo-ma",    label: "Mồ mả" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="serif text-xl font-bold text-stone-900">
              {SITE_NAME}
            </Link>
            <span className="text-xs text-stone-500">Sprint 1 — read-only demo</span>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
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
