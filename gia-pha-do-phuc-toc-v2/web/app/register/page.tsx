"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerAction, type RegisterState } from "@/lib/auth/actions";

const initialState: RegisterState = { error: null, success: false };

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  // After successful register, auto sign in
  useEffect(() => {
    if (state.success) {
      const form = document.querySelector("form") as HTMLFormElement | null;
      const fd = form ? new FormData(form) : null;
      if (fd) {
        signIn("credentials", {
          email: fd.get("email"),
          password: fd.get("password"),
          redirect: false,
        }).then(() => {
          router.push("/dashboard");
          router.refresh();
        });
      }
    }
  }, [state.success, router]);

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← Về trang chủ
      </Link>

      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-8">
        <h1 className="serif text-3xl font-bold text-stone-900">Đăng ký</h1>
        <p className="mt-2 text-sm text-stone-600">
          Tạo tài khoản để xem gia phả dòng tộc. Người đăng ký <strong>đầu tiên</strong> sẽ tự động trở thành <strong>Quản trị viên</strong>.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-stone-700">
              Họ tên
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">Mật khẩu *</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-stone-500">Ít nhất 8 ký tự.</p>
          </div>

          {state.error && (
            <div className="rounded bg-rose-50 p-3 text-sm text-rose-800">{state.error}</div>
          )}
          {state.success && (
            <div className="rounded bg-emerald-50 p-3 text-sm text-emerald-800">
              ✓ Đã tạo tài khoản. Đang đăng nhập…
            </div>
          )}

          <button
            type="submit"
            disabled={pending || state.success}
            className="w-full rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-stone-700 disabled:opacity-50"
          >
            {pending ? "Đang tạo…" : "Đăng ký"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-amber-700 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
