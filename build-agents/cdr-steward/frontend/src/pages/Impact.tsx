import { useEffect, useState } from 'react';
import { getImpact, renderAll, openPdf } from '../api/programs';
import { useProgram } from '../contexts/ProgramContext';
import type { ImpactReport, TemplateImpact, TemplateStatus } from '../types';

export default function Impact() {
  const { currentCode } = useProgram();
  const [report, setReport] = useState<ImpactReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => getImpact(currentCode).then(setReport);

  useEffect(() => {
    if (!currentCode) return;
    setLoading(true);
    refetch().finally(() => setLoading(false));
  }, [currentCode]);

  const handleRender = async () => {
    setRendering(true);
    setError(null);
    try {
      await renderAll(currentCode);
      await refetch();
    } catch (e: any) {
      setError(String(e.response?.data?.detail || e.message));
    } finally {
      setRendering(false);
    }
  };

  if (loading) return <div className="text-gray-500">Đang tải...</div>;
  if (!report) return <div>—</div>;

  const totalStale = report.counts.stale + report.counts.missing;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Tác động thay đổi</h1>
        <p className="text-sm text-gray-500 mt-1">
          So sánh phiên bản dữ liệu hiện tại với lần render PDF gần nhất.
          Mỗi lần sửa PLO/PI/Course → version tăng → các PDF cũ thành <strong>stale</strong>.
        </p>
      </header>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">{error}</div>}

      {/* Summary cards */}
      <section className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Phiên bản hiện tại</div>
          <div className="text-2xl font-bold text-brand-700 mt-1">v{report.program_version}</div>
          <div className="text-xs text-gray-400 mt-1">
            cập nhật {formatRelative(report.program_updated_at)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Render gần nhất</div>
          <div className="text-2xl font-bold text-gray-700 mt-1">
            {report.last_rendered_version ? `v${report.last_rendered_version}` : '—'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {report.last_rendered_at ? formatRelative(report.last_rendered_at) : 'chưa render'}
          </div>
        </div>
        <div className={`rounded-lg border p-4 ${
          totalStale > 0
            ? 'bg-amber-50 border-amber-300'
            : 'bg-green-50 border-green-300'
        }`}>
          <div className="text-xs text-gray-600">Cần cập nhật</div>
          <div className={`text-2xl font-bold mt-1 ${
            totalStale > 0 ? 'text-amber-700' : 'text-green-700'
          }`}>
            {totalStale > 0 ? `${totalStale} PDF` : '✓ Đồng bộ'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {report.counts.stale} stale + {report.counts.missing} thiếu
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center">
          <button
            onClick={handleRender}
            disabled={rendering}
            className={`w-full py-3 rounded font-medium text-white transition ${
              totalStale > 0
                ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300'
                : 'bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300'
            }`}
          >
            {rendering
              ? 'Đang render...'
              : totalStale > 0
                ? `Cập nhật ${totalStale} PDF`
                : 'Render lại tất cả'}
          </button>
        </div>
      </section>

      {/* Program-level templates */}
      <section>
        <h2 className="font-semibold text-base mb-2">Tài liệu chương trình</h2>
        <TemplateTable items={report.program_templates} />
      </section>

      {/* Đề cương */}
      <section>
        <h2 className="font-semibold text-base mb-2">
          Đề cương học phần ({report.decuong_templates.length})
        </h2>
        {report.decuong_templates.length === 0 ? (
          <div className="text-sm text-gray-500 bg-white border border-gray-200 rounded p-4">
            Chưa có học phần nào có CLO. Thêm CLO vào học phần để render đề cương.
          </div>
        ) : (
          <TemplateTable items={report.decuong_templates} />
        )}
      </section>
    </div>
  );
}

function TemplateTable({ items }: { items: TemplateImpact[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600 text-xs uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Tên template</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 font-medium">Render gần nhất</th>
            <th className="px-4 py-3 font-medium text-right">PDF</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((t) => (
            <tr key={t.name}>
              <td className="px-4 py-3 font-mono text-xs">{t.name}</td>
              <td className="px-4 py-3">
                <StatusBadge status={t.status} />
              </td>
              <td className="px-4 py-3 text-gray-600 text-xs">
                {t.rendered_at ? formatRelative(t.rendered_at) : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                {t.pdf_url ? (
                  <button
                    onClick={() => openPdf(t.pdf_url!).catch(() => {})}
                    className="text-brand-600 hover:underline"
                  >
                    Mở
                  </button>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: TemplateStatus }) {
  const cfg = {
    fresh: { label: '✓ Đồng bộ', cls: 'bg-green-100 text-green-700' },
    stale: { label: '⚠ Cần cập nhật', cls: 'bg-amber-100 text-amber-700' },
    missing: { label: '✗ Chưa render', cls: 'bg-gray-100 text-gray-600' },
  }[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s trước`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} ngày trước`;
  return d.toLocaleDateString('vi-VN');
}
