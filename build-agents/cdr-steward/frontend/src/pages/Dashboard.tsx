import { useEffect, useState } from 'react';
import { getProgram, renderAll } from '../api/programs';
import type { ProgramDetail, RenderResult } from '../types';

const PROGRAM_CODE = '7480201';

export default function Dashboard() {
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [renderResults, setRenderResults] = useState<RenderResult[] | null>(null);

  useEffect(() => {
    getProgram(PROGRAM_CODE)
      .then(setProgram)
      .catch((e) => setError(String(e.response?.data?.detail || e.message)))
      .finally(() => setLoading(false));
  }, []);

  const handleRender = async () => {
    setRendering(true);
    setRenderResults(null);
    try {
      const results = await renderAll(PROGRAM_CODE);
      setRenderResults(results);
    } catch (e: any) {
      setError(String(e.response?.data?.detail || e.message));
    } finally {
      setRendering(false);
    }
  };

  if (loading) return <div className="text-gray-500">Đang tải...</div>;
  if (error) return <div className="text-red-600">Lỗi: {error}</div>;
  if (!program) return <div>Không tìm thấy chương trình.</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{program.name_vn}</h1>
        <div className="text-sm text-gray-500 mt-1">
          Mã ngành: <span className="font-mono">{program.code}</span> ·{' '}
          Trình độ: {program.level} · Phiên bản: v{program.version} ·{' '}
          QĐ: {program.decision_no || '—'}
        </div>
      </header>

      <section className="grid grid-cols-5 gap-4">
        <StatCard label="Mục tiêu (PO)" value={program.counts.pos} />
        <StatCard label="Chuẩn đầu ra (PLO)" value={program.counts.plos} />
        <StatCard label="Chỉ báo (PI)" value={program.counts.pis} />
        <StatCard label="Học phần" value={program.counts.courses} />
        <StatCard label="CLO" value={program.counts.clos} />
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-lg">Sinh tài liệu CTĐT</h2>
            <p className="text-sm text-gray-500 mt-1">
              Render đồng bộ 5 template DAU + N đề cương từ dữ liệu hiện tại trong DB.
            </p>
          </div>
          <button
            onClick={handleRender}
            disabled={rendering}
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-5 py-2 rounded font-medium transition"
          >
            {rendering ? 'Đang render...' : 'Sinh tất cả PDF'}
          </button>
        </div>

        {renderResults && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-green-700 mb-2">
              ✓ Đã sinh {renderResults.length} PDF
            </div>
            <ul className="space-y-1">
              {renderResults.map((r) => (
                <li key={r.template} className="flex items-center justify-between text-sm py-1">
                  <span className="font-mono text-gray-700">{r.template}</span>
                  <a
                    href={r.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 hover:underline"
                  >
                    Mở PDF →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-lg mb-3">Học phần đã có CLO</h2>
        {program.courses.filter((c) => c.clos_count > 0).length === 0 ? (
          <div className="text-sm text-gray-500">Chưa có học phần nào có CLO.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-2 font-medium">Mã</th>
                <th className="py-2 font-medium">Tên học phần</th>
                <th className="py-2 font-medium text-center">TC</th>
                <th className="py-2 font-medium text-center">CLO</th>
                <th className="py-2 font-medium">Nhóm KT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {program.courses
                .filter((c) => c.clos_count > 0)
                .map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 font-mono text-gray-700">{c.code}</td>
                    <td className="py-2">{c.name_vn}</td>
                    <td className="py-2 text-center">{c.credits}</td>
                    <td className="py-2 text-center">{c.clos_count}</td>
                    <td className="py-2 text-xs text-gray-500">{c.knowledge_group}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-2xl font-bold text-brand-700">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
