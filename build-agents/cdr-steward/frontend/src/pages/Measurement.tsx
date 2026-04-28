import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createSession,
  deleteSession,
  listSessions,
  type MeasSessionListItem,
} from '../api/measurement';
import { getProgram } from '../api/programs';
import { useProgram } from '../contexts/ProgramContext';
import type { ProgramDetail } from '../types';

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  DRAFT:     { text: 'Nháp',          cls: 'bg-gray-100 text-gray-700' },
  SCORING:   { text: 'Đang chấm',    cls: 'bg-blue-100 text-blue-700' },
  COMPUTED:  { text: 'Đã tính',       cls: 'bg-green-100 text-green-700' },
  PUBLISHED: { text: 'Đã công bố',    cls: 'bg-purple-100 text-purple-700' },
};

export default function Measurement() {
  const { currentCode } = useProgram();
  const [sessions, setSessions] = useState<MeasSessionListItem[]>([]);
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    try {
      const prog = await getProgram(currentCode);
      setProgram(prog);
      const list = await listSessions({ program_id: prog.id });
      setSessions(list);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentCode) return;
    refetch();
  }, [currentCode]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xoá session "${name}"?\nTất cả điểm + kết quả sẽ mất.`)) return;
    try {
      await deleteSession(id);
      await refetch();
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Xoá thất bại');
    }
  };

  if (loading && !program) return <div className="text-gray-500">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Đo lường CĐR (KĐCLGD)</h1>
          <p className="text-sm text-gray-500 mt-1">
            {sessions.length} phiên đo · CTĐT {currentCode}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Mỗi phiên đo = 1 môn × 1 kỳ × 1 lớp. Import điểm SV → tự tính % đạt CLO/PLO.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded text-sm"
          disabled={!program}
        >
          + Tạo phiên đo
        </button>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {showCreate && program && (
        <CreateSessionModal
          program={program}
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            setShowCreate(false);
            await refetch();
          }}
        />
      )}

      {sessions.length === 0 && !loading ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-lg font-semibold mb-2">Chưa có phiên đo nào</h2>
          <p className="text-gray-500 mb-4 text-sm max-w-md mx-auto">
            Tạo phiên đo cho 1 môn để import điểm SV và tự tính % đạt CLO theo
            Thông tư 04-2025/BGDĐT.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded text-sm"
          >
            + Tạo phiên đo đầu tiên
          </button>
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Tên phiên</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Môn</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Học kỳ</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Lớp</th>
                <th className="text-center px-4 py-2 font-medium text-gray-600">SV</th>
                <th className="text-center px-4 py-2 font-medium text-gray-600">Câu</th>
                <th className="text-center px-4 py-2 font-medium text-gray-600">Trạng thái</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const status = STATUS_LABEL[s.status] || { text: s.status, cls: 'bg-gray-100' };
                return (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <Link
                        to={`/measurement/${s.id}`}
                        className="text-brand-700 hover:underline font-medium"
                      >
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {s.course_code}
                      {s.course_name && (
                        <span className="text-gray-400 ml-1">— {s.course_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{s.semester}</td>
                    <td className="px-4 py-2.5 text-gray-600">{s.cohort_code}</td>
                    <td className="px-4 py-2.5 text-center">{s.n_students}</td>
                    <td className="px-4 py-2.5 text-center">{s.n_questions}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${status.cls}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Modal tạo phiên đo
// ─────────────────────────────────────────────────────────
function CreateSessionModal({
  program,
  onClose,
  onCreated,
}: {
  program: ProgramDetail;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [courseId, setCourseId] = useState<string>(program.courses[0]?.id || '');
  const [semester, setSemester] = useState<string>('HKII 2024-2025');
  const [cohortCode, setCohortCode] = useState<string>('21CS01');
  const [name, setName] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [threshold, setThreshold] = useState<string>('50.0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCourse = program.courses.find((c) => c.id === courseId);

  // Auto-suggest tên
  useEffect(() => {
    if (selectedCourse && !name) {
      setName(`${selectedCourse.code} -- ${semester} -- ${cohortCode}`);
    }
  }, [selectedCourse, semester, cohortCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createSession({
        program_id: program.id,
        course_id: courseId,
        name,
        semester,
        cohort_code: cohortCode,
        exam_date: examDate || undefined,
        clo_threshold_pct: threshold,
      });
      onCreated();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Tạo phiên đo thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-bold mb-4">Tạo phiên đo mới</h3>
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">Học phần *</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              {program.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name_vn}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 mb-1">Học kỳ *</label>
              <input
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="VD: HKII 2024-2025"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Mã lớp *</label>
              <input
                value={cohortCode}
                onChange={(e) => setCohortCode(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="VD: 21CS01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Tên phiên đo *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 mb-1">Ngày thi</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">
                Ngưỡng đạt CLO (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded text-xs">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded"
            >
              {submitting ? 'Đang tạo...' : 'Tạo phiên đo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
