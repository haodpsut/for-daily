import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← Về trang chủ
      </Link>

      <div className="mt-6">
        <Suspense
          fallback={
            <div className="rounded-lg border border-stone-200 bg-white p-8">
              <p className="text-sm text-stone-500">Đang tải…</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
