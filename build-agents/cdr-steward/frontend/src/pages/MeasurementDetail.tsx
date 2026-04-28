import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  computeSession,
  downloadCloMasteryCsv,
  downloadEvidenceCsv,
  downloadScoresCsv,
  downloadTt04Pdf,
  downloadTt04Tex,
  generateTt04Report,
  getCachedResults,
  getSession,
  importGradebook,
  listQuestions,
  listSessionStudents,
  type ComputeResponse,
  type ImportSummary,
  type MeasQuestion,
  type MeasSessionDetail,
  type MeasStudent,
} from '../api/measurement';

export default function MeasurementDetail() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<MeasSessionDetail | null>(null);
  const [questions, setQuestions] = useState<MeasQuestion[]>([]);
  const [students, setStudents] = useState<MeasStudent[]>([]);
  const [results, setResults] = useState<ComputeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [reportingTt04, setReportingTt04] = useState(false);
  const [tt04Available, setTt04Available] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refetchAll = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [s, q, st] = await Promise.all([
        getSession(id),
        listQuestions(id),
        listSessionStudents(id),
      ]);
      setSession(s);
      setQuestions(q);
      setStudents(st);
      try {
        const r = await getCachedResults(id);
        setResults(r);
      } catch {
        setResults(null);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Lỗi tải');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchAll();
  }, [id]);

  const handleCompute = async () => {
    if (!id) return;
    setComputing(true);
    setError(null);
    try {
      const r = await computeSession(id);
      setResults(r);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Compute thất bại');
    } finally {
      setComputing(false);
    }
  };

  const handleImport = async (file: File) => {
    if (!id) return;
    setImporting(true);
    setImportSummary(null);
    setError(null);
    try {
      const summary = await importGradebook(id, file);
      setImportSummary(summary);
      await refetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Import thất bại');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerateTt04 = async () => {
    if (!id) return;
    setReportingTt04(true);
    setError(null);
    try {
      const r = await generateTt04Report(id);
      setTt04Available(r.pdf_available);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Render báo cáo thất bại');
    } finally {
      setReportingTt04(false);
    }
  };

  if (loading && !session) return <div className="text-gray-500">Đang tải...</div>;
  if (!session) return <div className="text-red-600">Không tìm thấy phiên đo.</div>;

  const fname = `${session.cohort_code}_${session.semester}`.replace(/\s+/g, '_');

  return (
    <div className="space-y-6">
      <div>
        <Link to="/measurement" className="text-sm text-brand-600 hover:underline">
          ← Quay lại danh sách
        </Link>
        <h1 className="text-2xl font-bold mt-1">{session.name}</h1>
        <div className="text-sm text-gray-500 mt-1">
          {session.semester} · Lớp {session.cohort_code} ·{' '}
          {session.exam_date && `Thi ${session.exam_date}`} · Ngưỡng CLO ≥{' '}
          {session.clo_threshold_pct}%
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* QUICK STATS */}
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Sinh viên" value={students.length} />
        <Stat label="Câu hỏi" value={questions.length} />
        <Stat
          label="CLO đo được"
          value={results?.n_clos_evaluated ?? '—'}
          accent={results ? 'green' : 'gray'}
        />
        <Stat
          label="PLO roll-up"
          value={results?.n_plos_evaluated ?? '—'}
          accent={results ? 'green' : 'gray'}
        />
      </div>

      {/* IMPORT EXCEL */}
      <section className="bg-white border border-gray-200 rounded p-5">
        <h2 className="text-lg font-semibold mb-2">📥 Import điểm Excel</h2>
        <p className="text-sm text-gray-500 mb-3">
          File phải có 3 sheets: <code>Sinh viên</code>, <code>Câu hỏi</code>,{' '}
          <code>Điểm</code>. Xem template trong{' '}
          <code>/import_templates/</code>.
        </p>
        <div className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xlsm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
            }}
            disabled={importing}
            className="text-sm"
          />
          {importing && <span className="text-sm text-gray-500">Đang import...</span>}
        </div>
        {importSummary && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            <div>
              ✓ Sinh viên: {importSummary.students_created} mới /{' '}
              {importSummary.students_updated} cập nhật ·{' '}
              {importSummary.students_enrolled} enroll
            </div>
            <div>
              ✓ Câu hỏi: {importSummary.questions_created} mới /{' '}
              {importSummary.questions_updated} cập nhật
            </div>
            <div>
              ✓ Điểm: {importSummary.scores_created} mới /{' '}
              {importSummary.scores_updated} cập nhật
            </div>
            {importSummary.warnings.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-amber-700">
                  ⚠ {importSummary.warnings.length} cảnh báo
                </summary>
                <ul className="mt-1 ml-5 list-disc text-xs text-amber-700">
                  {importSummary.warnings.slice(0, 10).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </section>

      {/* COMPUTE */}
      <section className="bg-white border border-gray-200 rounded p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">⚙ Tính % đạt CLO/PLO</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Aggregate điểm theo trọng số → phần trăm đạt CLO → roll-up PLO qua
              CLO_PI level (M, A).
            </p>
          </div>
          <button
            onClick={handleCompute}
            disabled={computing || students.length === 0 || questions.length === 0}
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
          >
            {computing ? 'Đang tính...' : results ? 'Tính lại' : 'Tính kết quả'}
          </button>
        </div>

        {results && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Kết quả CLO ({results.clo_results.length})
              </h3>
              <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">CLO</th>
                    <th className="text-left px-3 py-2">Mô tả</th>
                    <th className="text-center px-3 py-2">N SV</th>
                    <th className="text-center px-3 py-2">Đạt</th>
                    <th className="text-right px-3 py-2">% đạt</th>
                    <th className="text-right px-3 py-2">Avg %</th>
                  </tr>
                </thead>
                <tbody>
                  {results.clo_results.map((r) => {
                    const pct = parseFloat(r.pct_achieved);
                    const cls = pct >= 70 ? 'text-green-700' : pct >= 50 ? 'text-amber-700' : 'text-red-700';
                    return (
                      <tr key={r.clo_id} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-medium">{r.clo_code || r.clo_id.slice(0, 8)}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">{r.clo_text}</td>
                        <td className="px-3 py-2 text-center">{r.n_students}</td>
                        <td className="px-3 py-2 text-center">{r.n_achieved}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${cls}`}>
                          {r.pct_achieved}%
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">{r.avg_score_pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {results.plo_results.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Roll-up PLO ({results.plo_results.length})
                </h3>
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">PLO</th>
                      <th className="text-left px-3 py-2">Mô tả</th>
                      <th className="text-center px-3 py-2">PI đo</th>
                      <th className="text-right px-3 py-2">% đạt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.plo_results.map((r) => (
                      <tr key={r.plo_id} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-medium">{r.plo_code || r.plo_id.slice(0, 8)}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">{r.plo_text}</td>
                        <td className="px-3 py-2 text-center">{r.pi_count}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {r.pct_achieved}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {results.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
                <div className="font-medium text-amber-700 mb-1">⚠ Cảnh báo</div>
                <ul className="list-disc ml-5 text-amber-700 text-xs">
                  {results.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!results && (
          <div className="text-center text-gray-400 text-sm py-4 border border-dashed border-gray-200 rounded">
            Chưa có kết quả tính. Import điểm + bấm "Tính kết quả".
          </div>
        )}
      </section>

      {/* EXPORTS */}
      <section className="bg-white border border-gray-200 rounded p-5">
        <h2 className="text-lg font-semibold mb-3">📤 Export evidence + Báo cáo</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <button
            onClick={() => downloadScoresCsv(session.id, `scores_${fname}.csv`)}
            disabled={!results}
            className="border border-gray-300 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 rounded text-left"
          >
            <div className="font-medium">Score Matrix CSV</div>
            <div className="text-xs text-gray-500">student × question raw scores</div>
          </button>
          <button
            onClick={() => downloadCloMasteryCsv(session.id, `clo_mastery_${fname}.csv`)}
            disabled={!results}
            className="border border-gray-300 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 rounded text-left"
          >
            <div className="font-medium">CLO Mastery CSV</div>
            <div className="text-xs text-gray-500">% achieved per student per CLO</div>
          </button>
          <button
            onClick={() => downloadEvidenceCsv(session.id, `evidence_${fname}.csv`)}
            className="border border-gray-300 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 rounded text-left"
          >
            <div className="font-medium">Evidence Summary CSV</div>
            <div className="text-xs text-gray-500">1 row per SV, full info</div>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold">Báo cáo TT04-2025 (PDF)</h3>
            <button
              onClick={handleGenerateTt04}
              disabled={reportingTt04 || !results}
              className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-3 py-1 rounded text-xs"
            >
              {reportingTt04 ? 'Đang render...' : 'Render PDF'}
            </button>
          </div>
          {tt04Available !== null && (
            <div className="flex gap-2">
              {tt04Available && (
                <button
                  onClick={() => downloadTt04Pdf(session.id, `tt04_${fname}.pdf`)}
                  className="text-sm text-brand-600 hover:underline"
                >
                  ⬇ Tải PDF
                </button>
              )}
              <button
                onClick={() => downloadTt04Tex(session.id, `tt04_${fname}.tex`)}
                className="text-sm text-brand-600 hover:underline"
              >
                ⬇ Tải .tex (compile thủ công)
              </button>
              {!tt04Available && (
                <span className="text-xs text-amber-600 ml-2">
                  ⚠ XeLaTeX chưa cài trên server — chỉ có .tex
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = 'gray',
}: {
  label: string;
  value: number | string;
  accent?: 'gray' | 'green' | 'amber';
}) {
  const cls = {
    gray: 'text-gray-700',
    green: 'text-green-700',
    amber: 'text-amber-700',
  }[accent];
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${cls}`}>{value}</div>
    </div>
  );
}
