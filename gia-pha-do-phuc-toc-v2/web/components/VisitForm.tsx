"use client";

import { useActionState } from "react";
import { type VisitFormState } from "@/lib/actions/grave-visits";
import {
  Section, Field, TextArea, FormStateBanner, FormActions,
} from "@/components/ui/FormAtoms";

const initial: VisitFormState = { error: null, ok: false };

interface VisitData {
  graveId: string;
  visitedOn: string;
  visitorNames: string | null;
  purpose: string | null;
  workDone: string | null;
  note: string | null;
}

export default function VisitForm({
  initial: data,
  action,
  submitLabel,
  onDelete,
  graves,
}: {
  initial?: Partial<VisitData>;
  action: (prev: VisitFormState, fd: FormData) => Promise<VisitFormState>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
  graves: Array<{ id: string; label: string }>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Tảo mộ">
        <label className="block">
          <span className="text-xs font-medium text-stone-600">Mộ *</span>
          <select
            name="graveId"
            required
            defaultValue={data?.graveId ?? ""}
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          >
            <option value="">— Chọn mộ —</option>
            {graves.map((g) => (<option key={g.id} value={g.id}>{g.label}</option>))}
          </select>
        </label>
        <Field label="Ngày tảo *" name="visitedOn" type="date" required defaultValue={data?.visitedOn ?? new Date().toISOString().slice(0, 10)} />
        <Field label="Mục đích" name="purpose" defaultValue={data?.purpose ?? ""} placeholder="Tảo mộ Thanh Minh 2025" />
        <Field label="Người đi tảo" name="visitorNames" defaultValue={data?.visitorNames ?? ""} placeholder="Đỗ Văn Hùng + 5 con cháu" />
        <TextArea label="Việc đã làm" name="workDone" rows={3} defaultValue={data?.workDone ?? ""} placeholder="Sơn lại bia, thay đèn, dọn cỏ, thắp hương" />
        <TextArea label="Ghi chú" name="note" rows={2} defaultValue={data?.note ?? ""} />
      </Section>

      <FormStateBanner error={state.error} ok={state.ok} />
      <FormActions
        cancelHref="/dashboard/admin/grave-visits"
        submitLabel={submitLabel}
        pending={pending}
        onDelete={onDelete}
        deleteConfirmText="Xoá lần tảo mộ này?"
      />
    </form>
  );
}
