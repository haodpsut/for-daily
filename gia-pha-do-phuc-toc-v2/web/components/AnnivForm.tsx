"use client";

import { useActionState } from "react";
import { type AnnivFormState } from "@/lib/actions/anniversaries";
import {
  Section, Row, Field, TextArea, FormStateBanner, FormActions,
} from "@/components/ui/FormAtoms";

const initial: AnnivFormState = { error: null, ok: false };

interface AnnivData {
  personId: string;
  lunarMonth: number;
  lunarDay: number;
  importance: number;
  ritualScript: string | null;
  note: string | null;
}

export default function AnnivForm({
  initial: data,
  action,
  submitLabel,
  onDelete,
  persons,
}: {
  initial?: Partial<AnnivData>;
  action: (prev: AnnivFormState, fd: FormData) => Promise<AnnivFormState>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
  persons: Array<{ id: string; fullName: string; generation: number | null; deathYear: number | null }>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Người được tưởng nhớ">
        <label className="block">
          <span className="text-xs font-medium text-stone-600">Người *</span>
          <select
            name="personId"
            required
            defaultValue={data?.personId ?? ""}
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          >
            <option value="">— Chọn người —</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} (đời {p.generation ?? "?"}{p.deathYear ? `, mất ${p.deathYear}` : ""})
              </option>
            ))}
          </select>
        </label>
      </Section>

      <Section title="Ngày giỗ (âm lịch)">
        <Row>
          <Field label="Ngày * (1-30)" name="lunarDay" type="number" min={1} max={30} required defaultValue={data?.lunarDay ?? ""} />
          <Field label="Tháng * (1-12)" name="lunarMonth" type="number" min={1} max={12} required defaultValue={data?.lunarMonth ?? ""} />
        </Row>
        <Field
          label="Mức trọng đại (1-5)"
          name="importance"
          type="number"
          min={1}
          max={5}
          defaultValue={data?.importance ?? 1}
          placeholder="5 = Giỗ Tổ; 1 = giỗ thường"
        />
      </Section>

      <Section title="Nội dung">
        <TextArea
          label="Văn cúng riêng (markdown, để trống nếu dùng văn chung)"
          name="ritualScript"
          rows={5}
          defaultValue={data?.ritualScript ?? ""}
        />
        <TextArea label="Ghi chú" name="note" rows={2} defaultValue={data?.note ?? ""} />
      </Section>

      <FormStateBanner error={state.error} ok={state.ok} />
      <FormActions
        cancelHref="/dashboard/admin/anniversaries"
        submitLabel={submitLabel}
        pending={pending}
        onDelete={onDelete}
        deleteConfirmText="Xoá giỗ kỵ này?"
      />
    </form>
  );
}
