import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProgram } from '../api/programs';
import { createCourse } from '../api/courses';
import { useProgram } from '../contexts/ProgramContext';
import type { ProgramDetail } from '../types';

const KG_LABEL: Record<string, string> = {
  DAI_CUONG: 'Đại cương',
  CO_SO: 'Cơ sở ngành',
  CHUYEN_NGANH: 'Chuyên ngành',
  TU_CHON: 'Tự chọn',
  TOT_NGHIEP: 'Tốt nghiệp',
};

const KG_OPTIONS = Object.entries(KG_LABEL).map(([value, label]) => ({ value, label }));

export default function Courses() {
  const { currentCode } = useProgram();
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => getProgram(currentCode).then(setProgram);

  useEffect(() => {
    if (!currentCode) return;
    refetch();
  }, [currentCode]);

  if (!program) return <div className="text-gray-500">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Học phần</h1>
          <p className="text-sm text-gray-500 mt-1">
            {program.courses.length} học phần · tổng{' '}
            {program.courses.reduce((s, c) => s + c.credits, 0)} TC
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded text-sm"
        >
          + Thêm học phần
        </button>
      </header>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">{error}</div>}

      {showAdd && (
        <AddCourseForm
          onSave={async (body) => {
            setError(null);
            try {
              await createCourse(currentCode, body);
              setShowAdd(false);
              await refetch();
            } catch (e: any) {
              setError(String(e.response?.data?.detail || e.message));
            }
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 font-medium">Mã</th>
              <th className="px-4 py-3 font-medium">Tên học phần</th>
              <th className="px-4 py-3 font-medium text-center">TC</th>
              <th className="px-4 py-3 font-medium text-center">LT/TH</th>
              <th className="px-4 py-3 font-medium text-center">CLO</th>
              <th className="px-4 py-3 font-medium text-center">HK</th>
              <th className="px-4 py-3 font-medium">Nhóm KT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {program.courses.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-700">
                  <Link to={`/courses/${c.id}`} className="text-brand-700 hover:underline">
                    {c.code}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/courses/${c.id}`} className="hover:underline">
                    <div className="font-medium">{c.name_vn}</div>
                    {c.name_en && <div className="text-xs text-gray-400 mt-0.5">{c.name_en}</div>}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center font-medium">{c.credits}</td>
                <td className="px-4 py-3 text-center text-xs text-gray-500">
                  {c.hours_lt}/{c.hours_th}
                </td>
                <td className="px-4 py-3 text-center">
                  {c.clos_count > 0 ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                      {c.clos_count}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-xs text-gray-500">
                  {c.semester_default || '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {KG_LABEL[c.knowledge_group] || c.knowledge_group}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddCourseForm({
  onSave, onCancel,
}: {
  onSave: (body: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    code: '',
    name_vn: '',
    name_en: '',
    credits: 3,
    hours_lt: 30,
    hours_th: 0,
    knowledge_group: 'CHUYEN_NGANH',
    semester_default: 1,
  });

  const set = <K extends keyof typeof form>(k: K, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <section className="bg-brand-50 border border-brand-200 rounded-lg p-4 space-y-3">
      <div className="font-medium text-brand-900">Thêm học phần mới</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="Mã HP (vd ITP201)" className="border rounded px-2 py-1 font-mono" />
        <select value={form.knowledge_group} onChange={(e) => set('knowledge_group', e.target.value)} className="border rounded px-2 py-1">
          {KG_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input value={form.name_vn} onChange={(e) => set('name_vn', e.target.value)} placeholder="Tên tiếng Việt" className="border rounded px-2 py-1 col-span-2" />
        <input value={form.name_en} onChange={(e) => set('name_en', e.target.value)} placeholder="Tên tiếng Anh" className="border rounded px-2 py-1 col-span-2" />
        <div className="grid grid-cols-4 gap-2 col-span-2">
          <input type="number" value={form.credits} onChange={(e) => set('credits', +e.target.value)} placeholder="TC" className="border rounded px-2 py-1" />
          <input type="number" value={form.hours_lt} onChange={(e) => set('hours_lt', +e.target.value)} placeholder="LT" className="border rounded px-2 py-1" />
          <input type="number" value={form.hours_th} onChange={(e) => set('hours_th', +e.target.value)} placeholder="TH" className="border rounded px-2 py-1" />
          <input type="number" value={form.semester_default} onChange={(e) => set('semester_default', +e.target.value)} placeholder="HK" className="border rounded px-2 py-1" />
        </div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-brand-200">
        <button
          onClick={() => onSave(form)}
          disabled={!form.code || !form.name_vn}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-1.5 rounded text-sm"
        >
          Tạo
        </button>
        <button onClick={onCancel} className="text-gray-600 px-4 py-1.5 text-sm">Hủy</button>
      </div>
    </section>
  );
}
