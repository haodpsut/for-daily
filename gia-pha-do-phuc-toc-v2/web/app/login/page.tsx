import Link from "next/link";

export default function Login() {
  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Về trang chủ</Link>

      <div className="mt-8 rounded-lg border border-stone-200 bg-white p-8 text-center">
        <h1 className="serif text-3xl font-bold text-stone-900">Đăng nhập</h1>
        <p className="mt-3 text-sm text-stone-600">Tính năng này sẽ có ở Sprint 2.</p>

        <div className="mt-6 rounded bg-amber-50 p-4 text-left text-sm text-amber-900">
          <p className="font-medium">Đang chuẩn bị</p>
          <p className="mt-1 text-amber-800">
            Sprint 2 sẽ thêm hệ thống tài khoản (Auth.js) với 3 vai trò: Quản trị, Biên tập, Thành viên.
            Người đăng ký đầu tiên sẽ tự động trở thành Quản trị (trưởng tộc / người soạn gia phả).
          </p>
        </div>

        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-700"
        >
          Xem demo dashboard (chưa cần login)
        </Link>
      </div>
    </main>
  );
}
