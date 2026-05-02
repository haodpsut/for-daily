"use client";

import { useActionState } from "react";
import { type RitualFormState } from "@/lib/actions/rituals";
import {
  Section, Row, Field, TextArea, Select, FormStateBanner, FormActions,
} from "@/components/ui/FormAtoms";

const initial: RitualFormState = { error: null, ok: false };

const KIND_OPTIONS = [
  { v: "gio_to",         l: "Giỗ Tổ" },
  { v: "gio_thuong",     l: "Giỗ thường (cá nhân)" },
  { v: "le_tet",         l: "Lễ Tết Nguyên Đán" },
  { v: "le_thanh_minh",  l: "Lễ Tảo Mộ Thanh Minh" },
  { v: "le_chap_tu",     l: "Lễ Chạp Tổ" },
  { v: "khac",           l: "Khác" },
];

interface RitualData {
  name: string;
  kind: string;
  purpose: string | null;
  ritualScript: string | null;
  offeringList: unknown;
  procedure: string | null;
  fixedLunarMonth: number | null;
  fixedLunarDay: number | null;
}

export default function RitualForm({
  initial: data,
  action,
  submitLabel,
  onDelete,
}: {
  initial?: Partial<RitualData>;
  action: (prev: RitualFormState, fd: FormData) => Promise<RitualFormState>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  const offeringPretty = data?.offeringList
    ? JSON.stringify(data.offeringList, null, 2)
    : `[
  { "name": "Mâm cỗ chay/mặn", "qty": 3 },
  { "name": "Hương, đèn", "qty": 1 },
  { "name": "Trầu cau", "qty": 1 },
  { "name": "Rượu", "qty": 1, "note": "1 chai" }
]`;

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Thông tin chung">
        <Field label="Tên nghi lễ *" name="name" required defaultValue={data?.name ?? ""} />
        <Row>
          <Select label="Loại *" name="kind" required defaultValue={data?.kind} options={KIND_OPTIONS} />
          <div />
        </Row>
        <TextArea
          label="Mục đích / ý nghĩa"
          name="purpose"
          rows={2}
          defaultValue={data?.purpose ?? ""}
        />
      </Section>

      <Section title="Lịch âm cố định (tuỳ chọn)">
        <Row>
          <Field label="Ngày âm (1-30)" name="fixedLunarDay" type="number" min={1} max={30} defaultValue={data?.fixedLunarDay ?? ""} />
          <Field label="Tháng âm (1-12)" name="fixedLunarMonth" type="number" min={1} max={12} defaultValue={data?.fixedLunarMonth ?? ""} />
        </Row>
        <p className="text-xs text-stone-500">Ví dụ: Giỗ Tổ = 15/8 ÂL, Thanh Minh = 3/3 ÂL. Để trống nếu giỗ cá nhân (theo ngày mất).</p>
      </Section>

      <Section title="Văn cúng">
        <TextArea
          label="Văn cúng (markdown)"
          name="ritualScript"
          rows={10}
          defaultValue={data?.ritualScript ?? ""}
          placeholder="**VĂN CÚNG**\n\nNam mô A Di Đà Phật! (3 lần)\n\nKính lạy:\n- Đức Tổ..."
        />
      </Section>

      <Section title="Vật phẩm + Tiến trình">
        <TextArea
          label="Danh sách vật phẩm (JSON)"
          name="offeringList"
          rows={8}
          defaultValue={offeringPretty}
        />
        <p className="text-xs text-stone-500">Mỗi vật phẩm là 1 object: name (bắt buộc), qty, note. Để trống nếu chưa cần.</p>
        <TextArea
          label="Tiến trình (markdown)"
          name="procedure"
          rows={6}
          defaultValue={data?.procedure ?? ""}
          placeholder="1. Sắp lễ (sáng sớm)\n2. Khấn vái — trưởng tộc đọc văn cúng\n3. Dâng hương..."
        />
      </Section>

      <FormStateBanner error={state.error} ok={state.ok} />
      <FormActions
        cancelHref="/dashboard/admin/rituals"
        submitLabel={submitLabel}
        pending={pending}
        onDelete={onDelete}
        deleteConfirmText="Xoá nghi lễ này? Các lần thực hiện gắn với nghi lễ này sẽ bị mất liên kết."
      />
    </form>
  );
}
