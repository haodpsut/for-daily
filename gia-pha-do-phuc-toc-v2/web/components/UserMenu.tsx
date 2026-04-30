"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface Props {
  name: string;
  email: string;
  role: "admin" | "editor" | "member";
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

export default function UserMenu({ name, email, role }: Props) {
  const [open, setOpen] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-2 py-1 text-sm hover:bg-stone-50"
      >
        <div className="flex size-7 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
          {initials}
        </div>
        <span className="hidden sm:block text-stone-900">{name}</span>
        <svg className="size-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 z-20 rounded-md border border-stone-200 bg-white shadow-lg">
            <div className="border-b border-stone-100 p-4">
              <p className="font-medium text-stone-900">{name}</p>
              <p className="mt-0.5 text-xs text-stone-500">{email}</p>
              <span className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[role]}`}>
                {ROLE_LABEL[role]}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50"
            >
              Đăng xuất
            </button>
          </div>
        </>
      )}
    </div>
  );
}
