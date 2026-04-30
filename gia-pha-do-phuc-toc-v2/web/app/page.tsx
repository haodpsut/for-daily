import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { ancestralHallInfo, persons, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const SITE_NAME = process.env.SITE_NAME ?? "Đỗ Phúc Tộc";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [session, hall, stats, userCount] = await Promise.all([
    auth(),
    db.select().from(ancestralHallInfo).where(eq(ancestralHallInfo.id, 1)).then((r) => r[0]),
    db
      .select({
        personCount: sql<number>`count(*)::int`,
        generations: sql<number>`coalesce(max(generation), 0)::int`,
      })
      .from(persons)
      .then((r) => r[0]),
    db.select({ c: sql<number>`count(*)::int` }).from(users).then((r) => r[0]?.c ?? 0),
  ]);

  const isLoggedIn = !!session?.user;
  const noUsersYet = userCount === 0;

  return (
    <main className="min-h-screen">
      <section className="border-b border-stone-200 bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="serif text-sm uppercase tracking-[0.3em] text-stone-500">Gia phả · Từ đường</p>
          <h1 className="serif mt-4 text-5xl font-bold text-stone-900 md:text-6xl">{SITE_NAME}</h1>
          {hall?.address && (
            <p className="mt-4 text-sm text-stone-600">{hall.address}</p>
          )}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-700">
            Nơi gìn giữ phả hệ, lễ nghi, di sản tinh thần và mồ mả của dòng tộc — để con cháu ngàn đời sau vẫn biết
            <span className="serif italic"> cội nguồn </span>của mình.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-700"
              >
                Vào dashboard →
              </Link>
            ) : (
              <>
                {noUsersYet ? (
                  <Link
                    href="/register"
                    className="rounded-md bg-amber-700 px-6 py-3 text-sm font-medium text-amber-50 transition hover:bg-amber-800"
                  >
                    🔑 Tạo tài khoản Quản trị đầu tiên
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-700"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-md border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </>
            )}
            <Link
              href="/about"
              className="rounded-md border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Giới thiệu
            </Link>
          </div>
        </div>
      </section>

      {/* Public stats */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="serif text-2xl font-bold text-stone-900">Tóm lược dòng tộc</h2>
        <p className="mt-2 text-sm text-stone-600">
          Thông tin dưới đây công khai. Chi tiết cá nhân, mồ mả, di sản chỉ con cháu trong họ (đã đăng ký) mới xem được.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Stat label="Số người trong gia phả" value={`${stats.personCount}`} />
          <Stat label="Số đời" value={`${stats.generations}`} />
          <Stat label="Thành viên đã đăng ký" value={`${userCount}`} />
        </div>

        {hall?.history && (
          <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6">
            <h3 className="serif text-lg font-semibold text-stone-900">Lịch sử Từ đường</h3>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-stone-700">
              {hall.history}
            </pre>
          </div>
        )}
      </section>

      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} {SITE_NAME} · Self-hosted, owned by the family
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 text-center">
      <p className="text-xs uppercase tracking-wider text-stone-500">{label}</p>
      <p className="serif mt-2 text-3xl font-bold text-stone-900">{value}</p>
    </div>
  );
}
