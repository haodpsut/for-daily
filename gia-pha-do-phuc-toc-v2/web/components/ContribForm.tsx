"use client";

import { useActionState } from "react";
import { type ContribFormState } from "@/lib/actions/contributions";
import {
  Section, Row, Field, TextArea, FormStateBanner, FormActions,
} from "@/components/ui/FormAtoms";

const initial: ContribFormState = { error: null, ok: false };

interface ContribData {
  contributorPersonId: string | null;
  contributorName: string | null;
  amountVnd: number | null;
  inKind: string | null;
  occurrenceId: string | null;
  reportId: string | null;
  receivedOn: string;
  note: string | null;
}

export default function ContribForm({
  initial: data,
  action,
  submitLabel,
  onDelete,
  persons,
  occurrences,
  reports,
}: {
  initial?: Partial<ContribData>;
  action: (prev: ContribFormState, fd: FormData) => Promise<ContribFormState>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
  persons: Array<{ id: string; fullName: string; generation: number | null }>;
  occurrences: Array<{ id: string; label: string }>;
  reports: Array<{ id: string; year: number }>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Người đóng góp">
        <label className="block">
          <span className="text-xs font-medium text-stone-600">Trong gia phả (chọn một)</span>
          <select
            name="contributorPersonId"
            defaultValue={data?.contributorPersonId ?? ""}
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          >
            <option value="">— Không chọn (dùng tên bên dưới) —</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName} (đời {p.generation ?? "?"})</option>
            ))}
          </select>
        </label>
        <Field
          label="Hoặc tên người ngoài tộc"
          name="contributorName"
          defaultValue={data?.contributorName ?? ""}
          placeholder="Khách viếng / con dâu chưa đăng ký..."
        />
      </Section>

      <Section title="Đóng góp">
        <Row>
          <Field label="Số tiền (VND)" name="amountVnd" type="number" defaultValue={data?.amountVnd ?? ""} />
          <Field label="Ngày nhận *" name="receivedOn" type="date" required defaultValue={data?.receivedOn ?? new Date().toISOString().slice(0, 10)} />
        </Row>
        <TextArea label="Hiện vật (nếu có)" name="inKind" rows={2} defaultValue={data?.inKind ?? ""} placeholder="10kg gạo nếp + 1 con gà" />
      </Section>

      <Section title="Liên kết">
        <label className="block">
          <span className="text-xs font-medium text-stone-600">Lần thực hiện lễ (tuỳ chọn)</span>
          <select
            name="occurrenceId"
            defaultValue={data?.occurrenceId ?? ""}
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          >
            <option value="">— Không gắn —</option>
            {occurrences.map((o) => (<option key={o.id} value={o.id}>{o.label}</option>))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-stone-600">Báo cáo năm (tuỳ chọn)</span>
          <select
            name="reportId"
            defaultValue={data?.reportId ?? ""}
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          >
            <option value="">— Không gắn —</option>
            {reports.map((r) => (<option key={r.id} value={r.id}>Năm {r.year}</option>))}
          </select>
        </label>
        <TextArea label="Ghi chú" name="note" rows={2} defaultValue={data?.note ?? ""} />
      </Section>

      <FormStateBanner error={state.error} ok={state.ok} />
      <FormActions
        cancelHref="/dashboard/admin/contributions"
        submitLabel={submitLabel}
        pending={pending}
        onDelete={onDelete}
        deleteConfirmText="Xoá khoản công đức này?"
      />
    </form>
  );
}
