"use client";

import { useActionState } from "react";
import {
  type HeritageFormState,
} from "@/lib/actions/heritage";
import {
  Section, Row, Field, TextArea, Select, FormStateBanner, FormActions,
} from "@/components/ui/FormAtoms";

const initial: HeritageFormState = { error: null, ok: false };

const TYPE_OPTIONS = [
  { v: "di_huan",    l: "Di huấn" },
  { v: "gia_phong",  l: "Gia phong" },
  { v: "cau_doi",    l: "Câu đối" },
  { v: "hoanh_phi",  l: "Hoành phi" },
  { v: "van_ban_co", l: "Văn bản cổ" },
  { v: "tho_van",    l: "Thơ văn" },
];

interface HeritageData {
  type: string;
  title: string;
  content: string | null;
  transliteration: string | null;
  translation: string | null;
  sourcePersonId: string | null;
  sourceNote: string | null;
  yearComposed: number | null;
  displayOrder: number;
}

export default function HeritageForm({
  initial: data,
  action,
  submitLabel,
  onDelete,
  persons,
}: {
  initial?: Partial<HeritageData>;
  action: (prev: HeritageFormState, fd: FormData) => Promise<HeritageFormState>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
  persons: Array<{ id: string; fullName: string; generation: number | null }>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Thông tin cơ bản">
        <Row>
          <Select label="Loại *" name="type" required defaultValue={data?.type} options={TYPE_OPTIONS} />
          <Field label="Thứ tự hiển thị" name="displayOrder" type="number" defaultValue={data?.displayOrder ?? 0} />
        </Row>
        <Field label="Tiêu đề *" name="title" required defaultValue={data?.title ?? ""} />
      </Section>

      <Section title="Nội dung">
        <TextArea
          label="Nội dung gốc (chữ Hán Nôm hoặc Việt)"
          name="content"
          rows={6}
          defaultValue={data?.content ?? ""}
        />
        <Row>
          <TextArea label="Phiên âm (nếu chữ Hán)" name="transliteration" rows={3} defaultValue={data?.transliteration ?? ""} />
          <TextArea label="Dịch nghĩa" name="translation" rows={3} defaultValue={data?.translation ?? ""} />
        </Row>
      </Section>

      <Section title="Nguồn gốc">
        <Row>
          <label className="block">
            <span className="text-xs font-medium text-stone-600">Tác giả / Liên quan đến</span>
            <select
              name="sourcePersonId"
              defaultValue={data?.sourcePersonId ?? ""}
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
            >
              <option value="">— Không gắn với ai —</option>
              {persons.map((p) => (
                <option key={p.id} value={p.id}>{p.fullName} (đời {p.generation ?? "?"})</option>
              ))}
            </select>
          </label>
          <Field label="Năm soạn" name="yearComposed" type="number" defaultValue={data?.yearComposed ?? ""} />
        </Row>
        <TextArea label="Ghi chú nguồn (truyền miệng, sao chép từ...)" name="sourceNote" rows={2} defaultValue={data?.sourceNote ?? ""} />
      </Section>

      <FormStateBanner error={state.error} ok={state.ok} />
      <FormActions
        cancelHref="/dashboard/admin/heritage"
        submitLabel={submitLabel}
        pending={pending}
        onDelete={onDelete}
        deleteConfirmText="Xoá di sản này khỏi gia phả?"
      />
    </form>
  );
}
