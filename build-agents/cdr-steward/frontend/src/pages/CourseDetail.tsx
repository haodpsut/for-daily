import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getCourse, updateCourse, deleteCourse,
  createCLO, updateCLO, deleteCLO, setCLOPIMapping,
} from '../api/courses';
import type { CourseDetail as CourseDetailT, IRMALevel } from '../types';

const KG_OPTIONS = [
  { value: 'DAI_CUONG', label: 'Đại cương' },
  { value: 'CO_SO', label: 'Cơ sở ngành' },
  { value: 'CHUYEN_NGANH', label: 'Chuyên ngành' },
  { value: 'TU_CHON', label: 'Tự chọn' },
  { value: 'TOT_NGHIEP', label: 'Tốt nghiệp' },
];

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetailT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMeta, setEditingMeta] = useState(false);
  const [addCloMode, setAddCloMode] = useState(false);
  const [editingCloId, setEditingCloId] = useState<string | null>(null);
  const [editingMatrixCloId, setEditingMatrixCloId] = useState<string | null>(null);

  const refetch = async () => {
    if (!id) return;
    const c = await getCourse(id);
    setCourse(c);
  };

  useEffect(() => {
    refetch().finally(() => setLoading(false));
  }, [id]);

  const wrap = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      await refetch();
    } catch (e: any) {
      setError(String(e.response?.data?.detail || e.message));
    }
  };

  if (loading) return <div className="text-gray-500">Đang tải...</div>;
  if (!course) return <div>Không tìm thấy.</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/courses" className="text-sm text-brand-600 hover:underline">
          ← về danh sách học phần
        </Link>
      </div>

      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="font-mono text-brand-700">{course.code}</span> — {course.name_vn}
          </h1>
          {course.name_en && <p className="text-sm text-gray-500 italic mt-1">{course.name_en}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditingMeta(true)}
            className="text-sm text-gray-600 hover:text-brand-700 px-3 py-1.5 border border-gray-300 rounded"
          >
            Sửa thông tin
          </button>
          <button
            onClick={() => {
              if (confirm(`Xóa học phần ${course.code}? Sẽ xóa cả ${course.clos.length} CLO.`)) {
                wrap(async () => {
                  await deleteCourse(course.id);
                  navigate('/courses');
                });
              }
            }}
            className="text-sm text-red-600 hover:text-red-800 px-3 py-1.5"
          >
            Xóa
          </button>
        </div>
      </header>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">{error}</div>}

      {/* Course metadata */}
      {editingMeta ? (
        <CourseMetaForm
          course={course}
          onSave={async (body) => {
            await wrap(async () => {
              await updateCourse(course.id, body);
              setEditingMeta(false);
            });
          }}
          onCancel={() => setEditingMeta(false)}
        />
      ) : (
        <section className="bg-white rounded-lg border border-gray-200 p-5 grid grid-cols-3 gap-4 text-sm">
          <Field label="Số tín chỉ" value={course.credits} />
          <Field label="LT / TH / Tự học" value={`${course.hours_lt} / ${course.hours_th} / ${course.hours_self}`} />
          <Field label="Học kỳ đề xuất" value={course.semester_default || '—'} />
          <Field label="Nhóm kiến thức" value={KG_OPTIONS.find((k) => k.value === course.knowledge_group)?.label || course.knowledge_group} />
          <div className="col-span-3">
            <div className="text-xs text-gray-500">Mô tả</div>
            <div className="mt-1">{course.description || <span className="text-gray-400 italic">chưa có</span>}</div>
          </div>
        </section>
      )}

      {/* CLOs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">
            Chuẩn đầu ra học phần (CLO) — {course.clos.length}
          </h2>
          <button
            onClick={() => setAddCloMode(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded text-sm"
          >
            + Thêm CLO
          </button>
        </div>

        {addCloMode && (
          <CLOEditForm
            initialCode={`CLO${course.clos.length + 1}`}
            initialText=""
            onSave={async (body) => {
              await wrap(async () => {
                await createCLO(course.id, body);
                setAddCloMode(false);
              });
            }}
            onCancel={() => setAddCloMode(false)}
          />
        )}

        {course.clos.map((clo) => (
          <div key={clo.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 flex items-start gap-3">
              {editingCloId === clo.id ? (
                <CLOEditForm
                  initialCode={clo.code}
                  initialText={clo.text_vn}
                  onSave={async (body) => {
                    await wrap(async () => {
                      await updateCLO(clo.id, body);
                      setEditingCloId(null);
                    });
                  }}
                  onCancel={() => setEditingCloId(null)}
                />
              ) : (
                <>
                  <span className="text-brand-700 font-bold text-sm font-mono mt-0.5 shrink-0 w-14">
                    {clo.code}
                  </span>
                  <div className="flex-1 text-sm">{clo.text_vn}</div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setEditingMatrixCloId(
                        editingMatrixCloId === clo.id ? null : clo.id
                      )}
                      className={`text-xs px-2 py-1 rounded ${
                        editingMatrixCloId === clo.id
                          ? 'bg-brand-100 text-brand-700'
                          : 'text-gray-600 hover:text-brand-700'
                      }`}
                    >
                      Map PI
                    </button>
                    <button
                      onClick={() => setEditingCloId(clo.id)}
                      className="text-xs text-gray-500 hover:text-brand-700 px-2 py-1"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Xóa ${clo.code}?`)) wrap(() => deleteCLO(clo.id));
                      }}
                      className="text-xs text-gray-400 hover:text-red-600 px-2 py-1"
                    >
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Show current PI mapping (read-only) when not editing */}
            {editingMatrixCloId !== clo.id && (
              <CurrentMappingDisplay
                levels={course.clo_pi_levels[clo.code] || {}}
                piGroups={course.pi_groups}
              />
            )}

            {/* Inline matrix editor */}
            {editingMatrixCloId === clo.id && (
              <MatrixEditor
                cloCode={clo.code}
                piGroups={course.pi_groups}
                initialLevels={course.clo_pi_levels[clo.code] || {}}
                onSave={async (levels) => {
                  await wrap(async () => {
                    await setCLOPIMapping(clo.id, levels);
                    setEditingMatrixCloId(null);
                  });
                }}
                onCancel={() => setEditingMatrixCloId(null)}
              />
            )}
          </div>
        ))}

        {course.clos.length === 0 && !addCloMode && (
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-400 text-sm">
            Học phần chưa có CLO. Click "+ Thêm CLO" để bắt đầu.
          </div>
        )}
      </section>
    </div>
  );
}

// ────────────── helper components ──────────────

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function CLOEditForm({
  initialCode, initialText, onSave, onCancel,
}: {
  initialCode: string;
  initialText: string;
  onSave: (body: { code: string; text_vn: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initialCode);
  const [text, setText] = useState(initialText);

  return (
    <div className="flex-1 space-y-2">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border rounded px-2 py-1 font-mono text-sm w-20"
          placeholder="CLO1"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="border rounded px-2 py-1 text-sm flex-1"
          placeholder="Mô tả CLO..."
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ code, text_vn: text })}
          disabled={!code || !text}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-3 py-1 rounded text-xs"
        >
          Lưu
        </button>
        <button onClick={onCancel} className="text-gray-500 px-3 py-1 text-xs">
          Hủy
        </button>
      </div>
    </div>
  );
}

function CurrentMappingDisplay({
  levels,
}: {
  levels: Record<string, string>;
  piGroups: { plo_code: string; pis: { code: string }[] }[];
}) {
  const mapped = Object.entries(levels).filter(([, v]) => v);
  if (mapped.length === 0) {
    return (
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
        Chưa map PI nào — click "Map PI" để gán.
      </div>
    );
  }
  return (
    <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex flex-wrap gap-1.5">
      {mapped.map(([pi, lvl]) => (
        <span
          key={pi}
          className="text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono"
        >
          {pi} <strong className="text-brand-700">{lvl}</strong>
        </span>
      ))}
    </div>
  );
}

function MatrixEditor({
  cloCode, piGroups, initialLevels, onSave, onCancel,
}: {
  cloCode: string;
  piGroups: { plo_code: string; pis: { code: string; text_vn: string }[] }[];
  initialLevels: Record<string, string>;
  onSave: (levels: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}) {
  const [levels, setLevels] = useState<Record<string, string>>({ ...initialLevels });
  const LEVEL_OPTS: IRMALevel[] = ['', 'I', 'R', 'M', 'A'];

  const setLevel = (pi: string, lvl: string) => {
    setLevels((prev) => {
      const next = { ...prev };
      if (lvl === '') delete next[pi];
      else next[pi] = lvl;
      return next;
    });
  };

  return (
    <div className="bg-amber-50 border-t border-amber-200 p-4 space-y-3">
      <div className="text-xs text-amber-900">
        <strong>Map {cloCode} → PIs:</strong> chọn mức I (Introduce) / R (Reinforce) / M (Mastery) / A (Assessment) cho mỗi PI mà CLO này đóng góp. Để trống = không map.
      </div>

      <div className="space-y-3">
        {piGroups.map((grp) => (
          <div key={grp.plo_code} className="bg-white rounded border border-amber-100 p-3">
            <div className="text-xs font-semibold text-brand-700 mb-2 font-mono">
              {grp.plo_code}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {grp.pis.map((pi) => (
                <div key={pi.code} className="flex items-start gap-2 text-xs">
                  <span className="font-mono text-gray-700 w-14 shrink-0 mt-1">{pi.code}</span>
                  <span className="flex-1 text-gray-600 mt-1">{pi.text_vn}</span>
                  <select
                    value={levels[pi.code] || ''}
                    onChange={(e) => setLevel(pi.code, e.target.value)}
                    className={`border rounded px-1.5 py-0.5 font-mono text-xs ${
                      levels[pi.code]
                        ? 'bg-brand-50 border-brand-300 font-bold text-brand-700'
                        : 'border-gray-300'
                    }`}
                  >
                    {LEVEL_OPTS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl || '—'}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t border-amber-200">
        <button
          onClick={() => onSave(levels)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded text-sm font-medium"
        >
          Lưu mapping ({Object.values(levels).filter(Boolean).length} PI)
        </button>
        <button onClick={onCancel} className="text-gray-600 px-4 py-1.5 text-sm">
          Hủy
        </button>
      </div>
    </div>
  );
}

function CourseMetaForm({
  course, onSave, onCancel,
}: {
  course: CourseDetailT;
  onSave: (body: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    code: course.code,
    name_vn: course.name_vn,
    name_en: course.name_en || '',
    credits: course.credits,
    hours_lt: course.hours_lt,
    hours_th: course.hours_th,
    hours_self: course.hours_self,
    knowledge_group: course.knowledge_group,
    semester_default: course.semester_default || 0,
    description: course.description || '',
  });

  const set = <K extends keyof typeof form>(k: K, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <section className="bg-amber-50 border border-amber-200 rounded-lg p-5 space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Input label="Mã HP" value={form.code} onChange={(v: any) => set('code', v)} mono />
        <Input label="Tên VN" value={form.name_vn} onChange={(v: any) => set('name_vn', v)} />
        <Input label="Tên EN" value={form.name_en} onChange={(v: any) => set('name_en', v)} />
        <Select
          label="Nhóm kiến thức"
          value={form.knowledge_group}
          onChange={(v: any) => set('knowledge_group', v)}
          options={KG_OPTIONS}
        />
        <NumInput label="Tín chỉ" value={form.credits} onChange={(v: any) => set('credits', v)} />
        <NumInput label="HK đề xuất (1-10)" value={form.semester_default} onChange={(v: any) => set('semester_default', v)} />
        <NumInput label="Giờ LT" value={form.hours_lt} onChange={(v: any) => set('hours_lt', v)} />
        <NumInput label="Giờ TH" value={form.hours_th} onChange={(v: any) => set('hours_th', v)} />
        <NumInput label="Giờ tự học" value={form.hours_self} onChange={(v: any) => set('hours_self', v)} />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Mô tả</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
      <div className="flex gap-2 pt-2 border-t border-amber-200">
        <button
          onClick={() => onSave({
            ...form,
            semester_default: form.semester_default || null,
          })}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded text-sm font-medium"
        >
          Lưu
        </button>
        <button onClick={onCancel} className="text-gray-600 px-4 py-1.5 text-sm">
          Hủy
        </button>
      </div>
    </section>
  );
}

function Input({ label, value, onChange, mono }: any) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded px-2 py-1 text-sm ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );
}

function NumInput({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full border rounded px-2 py-1 text-sm"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
      >
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
