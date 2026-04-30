import Link from "next/link";

const SITE_NAME = process.env.SITE_NAME ?? "Đỗ Phúc Tộc";

const MODULES = [
  { href: "/dashboard/phahe",    title: "Phả hệ",      desc: "Sơ đồ dòng tộc, hồ sơ cá nhân, xưng hô tự động", soon: true },
  { href: "/dashboard/tu-duong", title: "Từ đường",    desc: "Lịch giỗ kỵ, văn cúng, nghi lễ, báo cáo năm",     soon: true },
  { href: "/dashboard/di-san",   title: "Di sản",      desc: "Di huấn, gia phong, câu đối, hoành phi",          soon: true },
  { href: "/dashboard/mo-ma",    title: "Mồ mả",       desc: "Bản đồ, vị trí, lịch tảo mộ",                      soon: true },
  { href: "/dashboard/thu-vien", title: "Thư viện",    desc: "Hình ảnh dòng tộc qua các thời kỳ",                soon: true },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-stone-200 bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="serif text-sm uppercase tracking-[0.3em] text-stone-500">Gia phả · Từ đường</p>
          <h1 className="serif mt-4 text-5xl font-bold text-stone-900 md:text-6xl">{SITE_NAME}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-700">
            Nơi gìn giữ phả hệ, lễ nghi, di sản tinh thần và mồ mả của dòng tộc — để con cháu ngàn đời sau vẫn biết
            <span className="serif italic"> cội nguồn </span>
            của mình.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/login"
              className="rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-700"
            >
              Đăng nhập
            </Link>
            <Link
              href="/about"
              className="rounded-md border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
            >
              Giới thiệu
            </Link>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="serif text-2xl font-bold text-stone-900">Năm trụ cột</h2>
        <p className="mt-2 text-stone-600">Toàn bộ tri thức dòng tộc, có cấu trúc, tra cứu và truyền lại được.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <div
              key={m.href}
              className="group relative rounded-lg border border-stone-200 bg-white p-6 transition hover:border-stone-400 hover:shadow-md"
            >
              <h3 className="serif text-xl font-semibold text-stone-900">{m.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{m.desc}</p>
              {m.soon && (
                <span className="absolute right-3 top-3 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Sắp ra mắt
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Status */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-lg border border-stone-200 bg-white p-6">
          <h3 className="serif text-lg font-semibold text-stone-900">Trạng thái dự án</h3>
          <p className="mt-2 text-sm text-stone-600">
            Sprint 1 / 8 — <strong>Foundation</strong>: Schema + seed + import/export CLI đã sẵn sàng. Các module sẽ được mở dần qua các sprint sau.
          </p>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} {SITE_NAME} · Self-hosted, open & owned by the family
        </div>
      </footer>
    </main>
  );
}
