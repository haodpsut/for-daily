/* Shared form primitives — reused by Person/Hall/Heritage/Anniv/Grave/Ritual forms */

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-stone-200 bg-white p-5">
      <legend className="serif px-2 text-sm font-semibold text-stone-700">{title}</legend>
      <div className="mt-2 space-y-3">{children}</div>
    </fieldset>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function CheckboxRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-x-6 gap-y-2">{children}</div>;
}

export function Field({
  label, name, type = "text", required, defaultValue, min, max, step, placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  min?: number;
  max?: number;
  step?: number | string;
  placeholder?: string;
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
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
      />
    </label>
  );
}

export function TextArea({
  label, name, rows = 3, defaultValue, placeholder, required,
}: {
  label: string;
  name: string;
  rows?: number;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-600">{label}</span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 font-sans text-sm focus:border-stone-500 focus:outline-none"
      />
    </label>
  );
}

export function Checkbox({
  name, label, defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-stone-700">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="size-4" />
      {label}
    </label>
  );
}

export function Select({
  label, name, defaultValue, options, required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: Array<{ v: string; l: string }>;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-600">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
      >
        {!required && <option value="">— Chọn —</option>}
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </label>
  );
}

export function FormStateBanner({ error, ok }: { error: string | null; ok: boolean }) {
  if (error) {
    return <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{error}</div>;
  }
  if (ok) {
    return <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">✓ Đã lưu.</div>;
  }
  return null;
}

export function FormActions({
  cancelHref,
  submitLabel,
  pending,
  onDelete,
  deleteLabel = "Xoá",
  deleteConfirmText,
}: {
  cancelHref: string;
  submitLabel: string;
  pending: boolean;
  onDelete?: () => Promise<void>;
  deleteLabel?: string;
  deleteConfirmText?: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-stone-100 pt-6">
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {pending ? "Đang lưu…" : submitLabel}
        </button>
        <a
          href={cancelHref}
          className="rounded-md border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          Huỷ
        </a>
      </div>
      {onDelete && (
        <form action={onDelete}>
          <button
            type="submit"
            onClick={(e) => {
              if (deleteConfirmText && !confirm(deleteConfirmText)) e.preventDefault();
            }}
            className="rounded-md border border-rose-300 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50"
          >
            {deleteLabel}
          </button>
        </form>
      )}
    </div>
  );
}
