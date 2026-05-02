"use client";

import { useActionState } from "react";
import { type GraveFormState } from "@/lib/actions/graves";
import {
  Section, Row, Field, TextArea, Select, FormStateBanner, FormActions,
} from "@/components/ui/FormAtoms";

const initial: GraveFormState = { error: null, ok: false };

const STATUS_OPTIONS = [
  { v: "kien_co",        l: "Kiên cố" },
  { v: "dat",            l: "Mộ đất" },
  { v: "cai_tang_xong",  l: "Đã cải táng" },
  { v: "that_lac",       l: "Thất lạc" },
  { v: "khac",           l: "Khác" },
];

interface GraveData {
  personId: string | null;
  cemeteryName: string | null;
  addressText: string | null;
  geoLat: number | null;
  geoLng: number | null;
  locationDescription: string | null;
  status: string;
  builtOn: string | null;
  lastReinterredOn: string | null;
  inscription: string | null;
  note: string | null;
}

export default function GraveForm({
  initial: data,
  action,
  submitLabel,
  onDelete,
  persons,
}: {
  initial?: Partial<GraveData>;
  action: (prev: GraveFormState, fd: FormData) => Promise<GraveFormState>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
  persons: Array<{ id: string; fullName: string; generation: number | null; deathYear: number | null }>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Người an nghỉ">
        <label className="block">
          <span className="text-xs font-medium text-stone-600">Gắn với người trong gia phả</span>
          <select
            name="personId"
            defaultValue={data?.personId ?? ""}
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          >
            <option value="">— Chưa gắn / mộ chưa định danh —</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} (đời {p.generation ?? "?"}{p.deathYear ? `, mất ${p.deathYear}` : ""})
              </option>
            ))}
          </select>
        </label>
      </Section>

      <Section title="Vị trí">
        <Field label="Tên nghĩa trang" name="cemeteryName" defaultValue={data?.cemeteryName ?? ""} />
        <TextArea label="Địa chỉ chi tiết" name="addressText" rows={2} defaultValue={data?.addressText ?? ""} />
        <Row>
          <Field
            label="Vĩ độ (lat)"
            name="geoLat"
            type="number"
            step="any"
            defaultValue={data?.geoLat ?? ""}
            placeholder="16.0560"
          />
          <Field
            label="Kinh độ (lng)"
            name="geoLng"
            type="number"
            step="any"
            defaultValue={data?.geoLng ?? ""}
            placeholder="108.2050"
          />
        </Row>
        <TextArea
          label="Mô tả vị trí (hàng/lô/hướng)"
          name="locationDescription"
          rows={2}
          defaultValue={data?.locationDescription ?? ""}
          placeholder="Hàng 3, lô 12, hướng Đông Nam..."
        />
      </Section>

      <Section title="Tình trạng & xây dựng">
        <Select label="Trạng thái" name="status" defaultValue={data?.status ?? "dat"} options={STATUS_OPTIONS} required />
        <Row>
          <Field label="Ngày xây" name="builtOn" type="date" defaultValue={data?.builtOn ?? ""} />
          <Field label="Cải táng gần nhất" name="lastReinterredOn" type="date" defaultValue={data?.lastReinterredOn ?? ""} />
        </Row>
        <TextArea label="Chữ trên bia" name="inscription" rows={2} defaultValue={data?.inscription ?? ""} />
      </Section>

      <Section title="Ghi chú">
        <TextArea label="Ghi chú" name="note" rows={2} defaultValue={data?.note ?? ""} />
      </Section>

      <FormStateBanner error={state.error} ok={state.ok} />
      <FormActions
        cancelHref="/dashboard/admin/graves"
        submitLabel={submitLabel}
        pending={pending}
        onDelete={onDelete}
        deleteConfirmText="Xoá mộ này khỏi gia phả?"
      />
    </form>
  );
}
