import Link from "next/link";

const MODULES = [
  { slug: "phahe",    title: "Phả hệ",   desc: "Sơ đồ dòng tộc, hồ sơ cá nhân, xưng hô tự động",  sprint: "S2" },
  { slug: "tu-duong", title: "Từ đường", desc: "Lịch giỗ kỵ, văn cúng, nghi lễ, báo cáo năm",      sprint: "S3" },
  { slug: "di-san",   title: "Di sản",   desc: "Di huấn, gia phong, câu đối, hoành phi",           sprint: "S5" },
  { slug: "mo-ma",    title: "Mồ mả",    desc: "Bản đồ, vị trí, lịch tảo mộ",                       sprint: "S6" },
  { slug: "thu-vien", title: "Thư viện", desc: "Hình ảnh dòng tộc qua các thời kỳ",                 sprint: "S7" },
];

export default function Dashboard() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Về trang chủ</Link>

      <h1 className="serif mt-6 text-4xl font-bold text-stone-900">Dashboard (placeholder)</h1>
      <p className="mt-3 text-stone-600">
        Các module sẽ được mở dần qua các sprint. Hiện tại Foundation (S1) đã xong:
        schema 14 bảng, dữ liệu mẫu 12 người + 5 giỗ + 3 nghi lễ + 4 mộ + 4 di sản, CLI import/export.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <div
            key={m.slug}
            className="relative rounded-lg border border-stone-200 bg-white p-6"
          >
            <h2 className="serif text-xl font-semibold text-stone-900">{m.title}</h2>
            <p className="mt-2 text-sm text-stone-600">{m.desc}</p>
            <span className="absolute right-3 top-3 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {m.sprint}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-stone-200 bg-stone-50 p-6 text-sm text-stone-700">
        <h3 className="serif text-lg font-semibold text-stone-900">Verify dữ liệu mẫu</h3>
        <p className="mt-2">
          Trong khi chờ UI, anh có thể truy vấn DB trực tiếp trên VPS để xem 12 người mẫu:
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-stone-900 p-3 text-xs text-stone-100">
{`psql -h localhost -p 15432 -d giapha -c \\
  "SELECT generation, full_name, gender FROM persons ORDER BY generation, birth_order;"`}
        </pre>
      </div>
    </main>
  );
}
