"use client";

import { useActionState } from "react";
import { updateHallAction, type HallFormState } from "@/lib/actions/hall";
import {
  Section, Row, Field, TextArea, FormStateBanner, FormActions,
} from "@/components/ui/FormAtoms";

const initial: HallFormState = { error: null, ok: false };

interface Hall {
  name: string;
  address: string | null;
  geoLat: number | null;
  geoLng: number | null;
  history: string | null;
  heroImageUrl: string | null;
  contactInfo: unknown;
}

export default function HallForm({ data }: { data: Partial<Hall> | null }) {
  const [state, formAction, pending] = useActionState(updateHallAction, initial);
  const contact = (data?.contactInfo && typeof data.contactInfo === "object"
    ? data.contactInfo
    : {}) as Record<string, string>;

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Thông tin chung">
        <Field label="Tên Từ đường *" name="name" required defaultValue={data?.name ?? ""} />
        <TextArea label="Địa chỉ" name="address" rows={2} defaultValue={data?.address ?? ""} />
        <Row>
          <Field label="Vĩ độ (lat)" name="geoLat" type="number" step="any" defaultValue={data?.geoLat ?? ""} />
          <Field label="Kinh độ (lng)" name="geoLng" type="number" step="any" defaultValue={data?.geoLng ?? ""} />
        </Row>
        <Field label="URL ảnh banner" name="heroImageUrl" defaultValue={data?.heroImageUrl ?? ""} />
      </Section>

      <Section title="Lịch sử Từ đường">
        <TextArea
          label="Nội dung (markdown)"
          name="history"
          rows={8}
          defaultValue={data?.history ?? ""}
          placeholder="**Lịch sử**\n\nTừ đường được khởi dựng vào năm..."
        />
      </Section>

      <Section title="Liên hệ">
        <Field label="Trưởng tộc" name="contact_truong_toc" defaultValue={contact.truong_toc ?? ""} />
        <Row>
          <Field label="Điện thoại" name="contact_phone" defaultValue={contact.phone ?? ""} />
          <Field label="Email" name="contact_email" type="email" defaultValue={contact.email ?? ""} />
        </Row>
      </Section>

      <FormStateBanner error={state.error} ok={state.ok} />
      <FormActions cancelHref="/dashboard/admin" submitLabel="Lưu thông tin Từ đường" pending={pending} />
    </form>
  );
}
