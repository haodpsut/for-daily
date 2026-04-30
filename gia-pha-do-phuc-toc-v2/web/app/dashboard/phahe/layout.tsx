import Link from "next/link";

const SUB_TABS = [
  { href: "/dashboard/phahe",         label: "Bảng",     icon: "▦" },
  { href: "/dashboard/phahe/tree",    label: "Cây",      icon: "🌳" },
  { href: "/dashboard/phahe/xung-ho", label: "Xưng hô",  icon: "↔" },
];

export default function PhaHeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 py-2">
          <nav className="flex gap-1 overflow-x-auto text-sm">
            {SUB_TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-stone-600 transition hover:bg-white hover:text-stone-900"
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </>
  );
}
