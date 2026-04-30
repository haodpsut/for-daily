"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { PersonFormState } from "@/lib/actions/persons";

type Person = {
  id?: string;
  fullName: string;
  otherNames: string | null;
  gender: "male" | "female" | "other";
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthIsLunar: boolean;
  deathYear: number | null;
  deathMonth: number | null;
  deathDay: number | null;
  deathIsLunar: boolean;
  isDeceased: boolean;
  isInLaw: boolean;
  generation: number | null;
  birthOrder: number | null;
  biography: string | null;
  note: string | null;
};

const initialState: PersonFormState = { error: null, ok: false };

export default function PersonForm({
  initial,
  action,
  submitLabel,
  onDelete,
}: {
  initial?: Partial<Person>;
  action: (prev: PersonFormState, fd: FormData) => Promise<PersonFormState>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {/* Basic */}
      <Section title="Thông tin cơ bản">
        <Row>
          <Field label="Họ tên *" name="fullName" defaultValue={initial?.fullName ?? ""} required />
          <Field label="Tên thường gọi" name="otherNames" defaultValue={initial?.otherNames ?? ""} />
        </Row>
        <Row>
          <RadioGroup
            label="Giới tính *"
            name="gender"
            defaultValue={initial?.gender ?? "male"}
            options={[{ v: "male", l: "Nam" }, { v: "female", l: "Nữ" }, { v: "other", l: "Khác" }]}
          />
          <Row>
            <Field label="Đời" name="generation" type="number" defaultValue={initial?.generation ?? ""} />
            <Field label="Thứ con" name="birthOrder" type="number" defaultValue={initial?.birthOrder ?? ""} />
          </Row>
        </Row>
        <CheckboxRow>
          <Checkbox name="isInLaw" label="Là dâu/rể (không phải huyết thống)" defaultChecked={initial?.isInLaw ?? false} />
          <Checkbox name="isDeceased" label="Đã qua đời" defaultChecked={initial?.isDeceased ?? false} />
        </CheckboxRow>
      </Section>

      {/* Birth */}
      <Section title="Ngày sinh">
        <Row>
          <Field label="Năm" name="birthYear" type="number" defaultValue={initial?.birthYear ?? ""} />
          <Field label="Tháng" name="birthMonth" type="number" min={1} max={12} defaultValue={initial?.birthMonth ?? ""} />
          <Field label="Ngày" name="birthDay" type="number" min={1} max={31} defaultValue={initial?.birthDay ?? ""} />
        </Row>
        <Checkbox name="birthIsLunar" label="Ngày sinh là âm lịch" defaultChecked={initial?.birthIsLunar ?? false} />
      </Section>

      {/* Death */}
      <Section title="Ngày mất (nếu đã qua đời)">
        <Row>
          <Field label="Năm" name="deathYear" type="number" defaultValue={initial?.deathYear ?? ""} />
          <Field label="Tháng" name="deathMonth" type="number" min={1} max={12} defaultValue={initial?.deathMonth ?? ""} />
          <Field label="Ngày" name="deathDay" type="number" min={1} max={31} defaultValue={initial?.deathDay ?? ""} />
        </Row>
        <Checkbox name="deathIsLunar" label="Ngày mất là âm lịch" defaultChecked={initial?.deathIsLunar ?? true} />
      </Section>

      {/* Free text */}
      <Section title="Tiểu sử & ghi chú">
        <TextArea label="Tiểu sử" name="biography" rows={4} defaultValue={initial?.biography ?? ""} />
        <TextArea label="Ghi chú" name="note" rows={2} defaultValue={initial?.note ?? ""} />
      </Section>

      {state.error && (
        <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{state.error}</div>
      )}
      {state.ok && (
        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">✓ Đã lưu.</div>
      )}

      <div className="flex items-center justify-between border-t border-stone-100 pt-6">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {pending ? "Đang lưu…" : submitLabel}
          </button>
          <Link
            href="/dashboard/admin/persons"
            className="rounded-md border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Huỷ
          </Link>
        </div>

        {onDelete && (
          <DeleteButton onConfirm={onDelete} />
        )}
      </div>
    </form>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => Promise<void> }) {
  return (
    <form action={onConfirm}>
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("Xoá người này khỏi gia phả? Hành động không thể hoàn tác. Mọi quan hệ liên quan cũng bị xoá theo.")) {
            e.preventDefault();
          }
        }}
        className="rounded-md border border-rose-300 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50"
      >
        Xoá
      </button>
    </form>
  );
}

// ─── Form atoms ───
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-stone-200 bg-white p-5">
      <legend className="serif px-2 text-sm font-semibold text-stone-700">{title}</legend>
      <div className="mt-2 space-y-3">{children}</div>
    </fieldset>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}
function CheckboxRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-x-6 gap-y-2">{children}</div>;
}
function Field({
  label, name, type = "text", required, defaultValue, min, max,
}: {
  label: string; name: string; type?: string; required?: boolean;
  defaultValue?: string | number | null; min?: number; max?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-600">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        defaultValue={defaultValue ?? ""}
        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
      />
    </label>
  );
}
function TextArea({
  label, name, rows = 3, defaultValue,
}: { label: string; name: string; rows?: number; defaultValue?: string | null }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-600">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
      />
    </label>
  );
}
function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-stone-700">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="size-4" />
      {label}
    </label>
  );
}
function RadioGroup({
  label, name, defaultValue, options,
}: { label: string; name: string; defaultValue: string; options: Array<{ v: string; l: string }> }) {
  return (
    <div>
      <span className="text-xs font-medium text-stone-600">{label}</span>
      <div className="mt-2 flex gap-4">
        {options.map((o) => (
          <label key={o.v} className="inline-flex items-center gap-1.5 text-sm text-stone-700">
            <input type="radio" name={name} value={o.v} defaultChecked={defaultValue === o.v} className="size-4" />
            {o.l}
          </label>
        ))}
      </div>
    </div>
  );
}
