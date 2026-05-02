"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setUserRoleAction,
  setUserActiveAction,
  deleteUserAction,
} from "@/lib/actions/users";

interface UserRow {
  id: string;
  email: string;
  fullName: string | null;
  role: "admin" | "editor" | "member";
  isActive: boolean;
  createdAt: Date | string;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Quản trị",
  editor: "Biên tập",
  member: "Thành viên",
};

const ROLE_COLOR: Record<string, string> = {
  admin: "bg-rose-100 text-rose-800",
  editor: "bg-sky-100 text-sky-800",
  member: "bg-stone-100 text-stone-700",
};

export default function UserTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRoleChange(userId: string, newRole: string) {
    setError(null);
    startTransition(async () => {
      const res = await setUserRoleAction(userId, newRole);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function handleToggleActive(userId: string, current: boolean) {
    setError(null);
    startTransition(async () => {
      const res = await setUserActiveAction(userId, !current);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function handleDelete(userId: string, email: string) {
    if (!confirm(`Xoá tài khoản ${email}? Hành động không thể hoàn tác.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteUserAction(userId);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
      )}
      {pending && (
        <div className="mb-4 rounded bg-amber-50 p-2 text-xs text-amber-800">Đang xử lý...</div>
      )}

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Họ tên</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Hoạt động</th>
              <th className="px-4 py-3 font-medium">Đăng ký</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const created = typeof u.createdAt === "string" ? new Date(u.createdAt) : u.createdAt;
              return (
                <tr key={u.id} className={`${isSelf ? "bg-amber-50/40" : ""} hover:bg-stone-50`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-900">{u.email}</div>
                    {isSelf && <div className="text-[10px] text-amber-700">← bạn</div>}
                  </td>
                  <td className="px-4 py-3 text-stone-700">{u.fullName ?? "—"}</td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[u.role]}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={pending}
                        className="rounded border border-stone-300 bg-white px-2 py-1 text-xs"
                      >
                        <option value="admin">Quản trị</option>
                        <option value="editor">Biên tập</option>
                        <option value="member">Thành viên</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        Đang hoạt động
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                        disabled={pending}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          u.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                        }`}
                      >
                        {u.isActive ? "Đang hoạt động" : "Đã khoá"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-500">
                    {created.toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isSelf && (
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        disabled={pending}
                        className="rounded border border-rose-200 bg-white px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                      >
                        Xoá
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-stone-500">
        💡 Tài khoản của anh (highlight vàng) không thể tự sửa role / deactivate / xoá để tránh khoá quyền truy cập.
        Cần đổi role chính mình → tạo admin khác trước, đăng nhập tài khoản đó, rồi đổi role tài khoản này.
      </p>
    </div>
  );
}
