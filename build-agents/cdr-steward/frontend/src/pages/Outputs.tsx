import { useState } from 'react';
import { renderAll } from '../api/programs';
import type { RenderResult } from '../types';

export default function Outputs() {
  const [results, setResults] = useState<RenderResult[] | null>(null);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRender = async () => {
    setRendering(true);
    setError(null);
    try {
      const r = await renderAll('7480201');
      setResults(r);
    } catch (e: any) {
      setError(String(e.response?.data?.detail || e.message));
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tài liệu sinh ra</h1>
          <p className="text-sm text-gray-500 mt-1">
            5 template DAU + N đề cương — sinh ra dạng PDF từ data hiện tại trong DB
          </p>
        </div>
        <button
          onClick={handleRender}
          disabled={rendering}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-5 py-2 rounded font-medium"
        >
          {rendering ? 'Đang render...' : 'Sinh lại tất cả'}
        </button>
      </header>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>}

      {!results && !rendering && (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-400">
          Click "Sinh lại tất cả" để render PDF
        </div>
      )}

      {results && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Tên file</th>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((r) => (
                <tr key={r.template} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.template}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.pdf_filename}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={r.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 hover:underline mr-3"
                    >
                      Mở
                    </a>
                    <a
                      href={r.pdf_url}
                      download
                      className="text-brand-600 hover:underline"
                    >
                      Tải
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
