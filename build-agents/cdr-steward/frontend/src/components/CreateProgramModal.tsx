import { useState } from 'react';
import { useProgram } from '../contexts/ProgramContext';

const LEVEL_OPTIONS = [
  { value: 'DAI_HOC', label: 'Đại học' },
  { value: 'THAC_SI', label: 'Thạc sĩ' },
  { value: 'TIEN_SI', label: 'Tiến sĩ' },
];

export default function CreateProgramModal({ onClose }: { onClose: () => void }) {
  const { createProgram } = useProgram();
  const [form, setForm] = useState({
    code: '',
    name_vn: '',
    name_en: '',
    level: 'DAI_HOC',
    duration_years: 4,
    total_credits: 144,
    decision_no: '',
    decision_date: '',
    issuing_authority: 'Hiệu trưởng Trường Đại học Kiến trúc Đà Nẵng',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.code || !form.name_vn) {
      setError('Mã và tên CTĐT là bắt buộc');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createProgram({
        ...form,
        name_en: form.name_en || undefined,
        decision_no: form.decision_no || undefined,
        decision_date: form.decision_date || undefined,
        issuing_authority: form.issuing_authority || undefined,
      });
      onClose();
    } catch (e: any) {
      setError(String(e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tạo Chương trình đào tạo mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </header>

        <div className="p-6 space-y-4 text-sm">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mã ngành (Program Code) *">
              <input
                value={form.code}
                onChange={(e) => set('code', e.target.value)}
                placeholder="vd 7480101"
                className="w-full border rounded px-2 py-1.5 font-mono"
              />
            </Field>
            <Field label="Trình độ">
              <select
                value={form.level}
                onChange={(e) => set('level', e.target.value)}
                className="w-full border rounded px-2 py-1.5"
              >
                {LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Tên CTĐT (Tiếng Việt) *" full>
              <input
                value={form.name_vn}
                onChange={(e) => set('name_vn', e.target.value)}
                placeholder="vd Quản trị kinh doanh"
                className="w-full border rounded px-2 py-1.5"
              />
            </Field>
            <Field label="Tên CTĐT (English)" full>
              <input
                value={form.name_en}
                onChange={(e) => set('name_en', e.target.value)}
                placeholder="vd Business Administration"
                className="w-full border rounded px-2 py-1.5"
              />
            </Field>
            <Field label="Thời gian đào tạo (năm)">
              <input
                type="number" value={form.duration_years}
                onChange={(e) => set('duration_years', +e.target.value)}
                className="w-full border rounded px-2 py-1.5"
              />
            </Field>
            <Field label="Tổng tín chỉ">
              <input
                type="number" value={form.total_credits}
                onChange={(e) => set('total_credits', +e.target.value)}
                className="w-full border rounded px-2 py-1.5"
              />
            </Field>
            <Field label="Số quyết định">
              <input
                value={form.decision_no}
                onChange={(e) => set('decision_no', e.target.value)}
                placeholder="346/QĐ-ĐHKTĐN"
                className="w-full border rounded px-2 py-1.5"
              />
            </Field>
            <Field label="Ngày quyết định">
              <input
                type="date" value={form.decision_date}
                onChange={(e) => set('decision_date', e.target.value)}
                className="w-full border rounded px-2 py-1.5"
              />
            </Field>
            <Field label="Cơ quan ban hành" full>
              <input
                value={form.issuing_authority}
                onChange={(e) => set('issuing_authority', e.target.value)}
                className="w-full border rounded px-2 py-1.5"
              />
            </Field>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-3">
            💡 <strong>Sau khi tạo:</strong> CTĐT mới sẽ trống (chưa có PO/PLO/Course).
            Tự thêm qua các tab Mục tiêu / Chuẩn đầu ra / Học phần, hoặc upload Excel template.
          </div>
        </div>

        <footer className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-gray-600 px-4 py-2 text-sm"
          >
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-5 py-2 rounded font-medium text-sm"
          >
            {submitting ? 'Đang tạo...' : 'Tạo CTĐT'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
