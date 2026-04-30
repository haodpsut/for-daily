"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("from") || "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });

    if (res?.error) {
      setError("Email hoặc mật khẩu không đúng.");
      setLoading(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-8">
      <h1 className="serif text-3xl font-bold text-stone-900">Đăng nhập</h1>
      <p className="mt-2 text-sm text-stone-600">Vào trang gia phả của dòng tộc.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email</label>
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
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">Mật khẩu</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            minLength={8}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
        </div>

        {error && <div className="rounded bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-stone-700 disabled:opacity-50"
        >
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-amber-700 hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
