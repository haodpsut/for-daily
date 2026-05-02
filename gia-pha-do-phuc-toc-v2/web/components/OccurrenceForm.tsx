"use client";

import { useActionState, useState } from "react";
import { type OccurrenceFormState } from "@/lib/actions/occurrences";
import {
  Section, Row, Field, TextArea, FormStateBanner, FormActions,
} from "@/components/ui/FormAtoms";

const initial: OccurrenceFormState = { error: null, ok: false };

interface OccurrenceData {
  ritualId: string | null;
  deathAnniversaryId: string | null;
  occurredOn: string;
  hostPersonId: string | null;
  location: string | null;
  attendeeCount: number | null;
  summary: string | null;
}

export default function OccurrenceForm({
  initial: data,
  action,
  submitLabel,
  onDelete,
  rituals,
  anniversaries,
  persons,
}: {
  initial?: Partial<OccurrenceData>;
  action: (prev: OccurrenceFormState, fd: FormData) => Promise<OccurrenceFormState>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
  rituals: Array<{ id: string; name: string }>;
  anniversaries: Array<{ id: string; personName: string | null; lunarMonth: number; lunarDay: number }>;
  persons: Array<{ id: string; fullName: string; generation: number | null }>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [mode, setMode] = useState<"ritual" | "anniv">(
    data?.deathAnniversaryId ? "anniv" : "ritual",
  );

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Nguồn gốc lễ">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("ritual")}
            className={`rounded-md px-3 py-1.5 text-sm ${mode === "ritual" ? "bg-stone-900 text-white" : "border border-stone-300 bg-white text-stone-700"}`}
          >
            Theo nghi lễ template
          </button>
          <button
            type="button"
            onClick={() => setMode("anniv")}
            className={`rounded-md px-3 py-1.5 text-sm ${mode === "anniv" ? "bg-stone-900 text-white" : "border border-stone-300 bg-white text-stone-700"}`}
          >
            Theo giỗ kỵ cá nhân
          </button>
        </div>

        {mode === "ritual" ? (
          <>
            <input type="hidden" name="deathAnniversaryId" value="" />
            <label className="block">
              <span className="text-xs font-medium text-stone-600">Nghi lễ *</span>
              <select
                name="ritualId"
                required
                defaultValue={data?.ritualId ?? ""}
                className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
              >
                <option value="">— Chọn nghi lễ —</option>
                {rituals.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}
              </select>
            </label>
          </>
        ) : (
          <>
            <input type="hidden" name="ritualId" value="" />
            <label className="block">
              <span className="text-xs font-medium text-stone-600">Giỗ kỵ *</span>
              <select
                name="deathAnniversaryId"
                required
                defaultValue={data?.deathAnniversaryId ?? ""}
                className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
              >
                <option value="">— Chọn giỗ kỵ —</option>
                {anniversaries.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.personName} — {a.lunarDay}/{a.lunarMonth} ÂL
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </Section>

      <Section title="Chi tiết buổi lễ">
        <Row>
          <Field label="Ngày tổ chức (dương lịch) *" name="occurredOn" type="date" required defaultValue={data?.occurredOn ?? ""} />
          <Field label="Số người tham dự" name="attendeeCount" type="number" defaultValue={data?.attendeeCount ?? ""} />
        </Row>
        <label className="block">
          <span className="text-xs font-medium text-stone-600">Người chủ trì</span>
          <select
            name="hostPersonId"
            defaultValue={data?.hostPersonId ?? ""}
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          >
            <option value="">— Không chọn —</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName} (đời {p.generation ?? "?"})</option>
            ))}
          </select>
        </label>
        <Field label="Địa điểm" name="location" defaultValue={data?.location ?? ""} placeholder="Từ đường họ Đỗ Phúc" />
        <TextArea
          label="Tóm tắt buổi lễ"
          name="summary"
          rows={5}
          defaultValue={data?.summary ?? ""}
          placeholder="Lễ Giỗ Tổ năm 2025 — con cháu tề tựu đông đủ. Trưởng tộc chủ trì..."
        />
      </Section>

      <FormStateBanner error={state.error} ok={state.ok} />
      <FormActions
        cancelHref="/dashboard/admin/occurrences"
        submitLabel={submitLabel}
        pending={pending}
        onDelete={onDelete}
        deleteConfirmText="Xoá lần thực hiện này? Công đức gắn với lần này sẽ bị mất liên kết."
      />
    </form>
  );
}
