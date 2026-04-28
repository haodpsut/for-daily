import { useState, useCallback } from 'react';
import { importExcel, importDocx } from '../api/plos';
import { useProgram } from '../contexts/ProgramContext';
import type { ImportResult } from '../api/plos';

type Format = 'xlsx' | 'docx';

const FORMAT_CONFIG: Record<Format, {
  label: string;
  icon: string;
  ext: string;
  mime: string;
  fn: (f: File) => Promise<ImportResult>;
  templateName: string;
}> = {
  xlsx: {
    label: 'Excel (.xlsx)', icon: '📊', ext: '.xlsx',
    mime: '.xlsx', fn: importExcel,
    templateName: 'CNTT_7480201_template.xlsx',
  },
  docx: {
    label: 'Word (.docx)', icon: '📝', ext: '.docx',
    mime: '.docx', fn: importDocx,
    templateName: 'CTDT_template.docx',
  },
};

export default function ImportExcel() {
  const { refreshPrograms } = useProgram();
  const [format, setFormat] = useState<Format>('xlsx');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const config = FORMAT_CONFIG[format];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.toLowerCase().endsWith(config.ext)) setFile(f);
  }, [config.ext]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await config.fn(file);
      setResult(r);
      await refreshPrograms();
    } catch (e: any) {
      setResult({
        warnings: [],
        errors: [
          ...(e.response?.data?.detail?.errors || []),
          ...(e.response?.data?.detail ? [] : [String(e.message)]),
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const switchFormat = (f: Format) => {
    setFormat(f);
    setFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Import dữ liệu CTĐT</h1>
        <p className="text-sm text-gray-500 mt-1">
          Hỗ trợ Excel hoặc Word. Hệ thống sẽ <strong>thay thế toàn bộ</strong> chương trình
          trong tài khoản của bạn nếu mã CTĐT đã tồn tại.
        </p>
      </header>

      {/* Format tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(Object.keys(FORMAT_CONFIG) as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => switchFormat(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              format === f
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {FORMAT_CONFIG[f].icon} {FORMAT_CONFIG[f].label}
          </button>
        ))}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
          dragOver
            ? 'border-brand-500 bg-brand-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        {file ? (
          <div className="space-y-3">
            <div className="text-3xl">{config.icon}</div>
            <div className="font-medium">{file.name}</div>
            <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-5 py-2 rounded font-medium"
              >
                {loading ? 'Đang import...' : 'Import vào DB'}
              </button>
              <button
                onClick={() => { setFile(null); setResult(null); }}
                className="text-gray-500 px-5 py-2"
              >
                Chọn file khác
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-3xl text-gray-400">{config.icon}</div>
            <div className="text-gray-600">Kéo thả file {config.ext} vào đây</div>
            <label className="cursor-pointer text-brand-600 hover:underline text-sm">
              hoặc chọn từ máy
              <input
                type="file"
                accept={config.mime}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-3">
          {result.errors.length > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="font-semibold text-red-700 mb-2">❌ Có {result.errors.length} lỗi — không ghi gì</div>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-semibold text-green-700 mb-3">✓ Import thành công</div>
              {result.imported && (
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {Object.entries(result.imported).map(([k, v]) => (
                    <div key={k} className="bg-white rounded px-3 py-2 border border-green-100">
                      <div className="text-2xl font-bold text-green-700">{v}</div>
                      <div className="text-xs text-gray-500">{k}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="font-semibold text-yellow-800 mb-2">⚠ Cảnh báo ({result.warnings.length})</div>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
        <div className="font-semibold mb-2">📋 Sinh template trống (CLI)</div>
        <pre className="bg-white border border-gray-200 rounded p-3 text-xs overflow-x-auto">
{format === 'xlsx'
  ? `cd backend
python scripts/gen_import_template.py --out ../import_templates/CNTT_template.xlsx`
  : `cd backend
python scripts/gen_word_template.py --out ../import_templates/CTDT_template.docx`}
        </pre>
        <p className="text-xs text-gray-500 mt-2">
          Template gồm 11 sheet/bảng: 00_Program · 01_PO · 02_PLO · 03_PI · 04_PLO_PO_matrix ·
          05_PLO_VQF_matrix · 06_Course · 07_CLO · 08_CLO_PI_matrix · 09_Assessment · 10_WeeklyPlan
        </p>
        {format === 'docx' && (
          <p className="text-xs text-amber-700 mt-2">
            ⚠️ Word: parser đọc tables theo <strong>thứ tự</strong> (không theo tiêu đề), nên
            không được đảo vị trí hay xóa bảng trong template.
          </p>
        )}
      </div>
    </div>
  );
}
