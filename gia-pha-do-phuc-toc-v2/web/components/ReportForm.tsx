"use client";

import { useActionState } from "react";
import { type ReportFormState } from "@/lib/actions/reports";
import {
  Section, Row, Field, TextArea, FormStateBanner, FormActions,
} from "@/components/ui/FormAtoms";

const initial: ReportFormState = { error: null, ok: false };

interface ReportData {
  year: number;
  summary: string | null;
  totalContributions: number | null;
  ritualCount: number | null;
  publishedAt: Date | string | null;
}

export default function ReportForm({
  initial: data,
  action,
  submitLabel,
  onDelete,
}: {
  initial?: Partial<ReportData>;
  action: (prev: ReportFormState, fd: FormData) => Promise<ReportFormState>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  const publishedDate = data?.publishedAt
    ? typeof data.publishedAt === "string"
      ? data.publishedAt.slice(0, 10)
      : data.publishedAt.toISOString().slice(0, 10)
    : "";

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Năm báo cáo">
        <Row>
          <Field label="Năm *" name="year" type="number" required min={1800} max={2200} defaultValue={data?.year ?? new Date().getFullYear()} />
          <Field label="Ngày phát hành" name="publishedAt" type="date" defaultValue={publishedDate} />
        </Row>
        <Row>
          <Field label="Tổng công đức (VND)" name="totalContributions" type="number" defaultValue={data?.totalContributions ?? ""} />
          <Field label="Số nghi lễ tổ chức" name="ritualCount" type="number" defaultValue={data?.ritualCount ?? ""} />
        </Row>
      </Section>

      <Section title="Tóm tắt">
        <TextArea
          label="Nội dung báo cáo (markdown)"
          name="summary"
          rows={10}
          defaultValue={data?.summary ?? ""}
          placeholder="## Báo cáo Từ đường năm ...\n\n- Tổ chức X lễ giỗ và Y lễ Tết.\n- Trùng tu mái Từ đường (kinh phí ...)."
        />
      </Section>

      <FormStateBanner error={state.error} ok={state.ok} />
      <FormActions
        cancelHref="/dashboard/admin/reports"
        submitLabel={submitLabel}
        pending={pending}
        onDelete={onDelete}
        deleteConfirmText="Xoá báo cáo năm này?"
      />
    </form>
  );
}
