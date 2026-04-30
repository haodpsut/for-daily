import { db } from "@/lib/db/client";
import { heritageItems } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  di_huan: "Di huấn",
  gia_phong: "Gia phong",
  cau_doi: "Câu đối",
  hoanh_phi: "Hoành phi",
  van_ban_co: "Văn bản cổ",
  tho_van: "Thơ văn",
};

const TYPE_COLORS: Record<string, string> = {
  di_huan: "bg-rose-100 text-rose-800",
  gia_phong: "bg-amber-100 text-amber-800",
  cau_doi: "bg-emerald-100 text-emerald-800",
  hoanh_phi: "bg-sky-100 text-sky-800",
  van_ban_co: "bg-purple-100 text-purple-800",
  tho_van: "bg-indigo-100 text-indigo-800",
};

export default async function DiSanPage() {
  const items = await db.select().from(heritageItems).orderBy(asc(heritageItems.displayOrder));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="serif text-3xl font-bold text-stone-900">Di sản tinh thần</h1>
      <p className="mt-1 text-sm text-stone-600">{items.length} mục — di huấn, gia phong, câu đối, hoành phi.</p>

      <div className="mt-8 space-y-6">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-stone-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <h2 className="serif text-2xl font-semibold text-stone-900">{item.title}</h2>
              <span
                className={`rounded px-3 py-1 text-xs font-medium ${TYPE_COLORS[item.type] ?? "bg-stone-100 text-stone-700"}`}
              >
                {TYPE_LABELS[item.type] ?? item.type}
              </span>
            </div>

            {item.content && (
              <pre className="mt-4 whitespace-pre-wrap font-serif text-base leading-relaxed text-stone-800">
                {item.content}
              </pre>
            )}

            {(item.transliteration || item.translation) && (
              <div className="mt-4 space-y-2 border-t border-stone-100 pt-4 text-sm">
                {item.transliteration && (
                  <p>
                    <span className="font-medium text-stone-500">Phiên âm:</span>{" "}
                    <em>{item.transliteration}</em>
                  </p>
                )}
                {item.translation && (
                  <p>
                    <span className="font-medium text-stone-500">Dịch nghĩa:</span>{" "}
                    {item.translation}
                  </p>
                )}
              </div>
            )}

            {(item.sourceNote || item.yearComposed) && (
              <p className="mt-4 text-xs text-stone-500">
                {item.sourceNote}
                {item.yearComposed ? ` · ${item.yearComposed}` : ""}
              </p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
