import { useEffect, useState } from 'react';
import { getProgram } from '../api/programs';
import {
  updatePLO, deletePLO, createPLO,
  updatePI, deletePI, createPI,
  updatePLOPOMapping,
} from '../api/plos';
import type { ProgramDetail, PLO, PI } from '../types';

const PROGRAM_CODE = '7480201';

export default function PLOs() {
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPloId, setEditingPloId] = useState<string | null>(null);
  const [editingPiId, setEditingPiId] = useState<string | null>(null);
  const [showAddPlo, setShowAddPlo] = useState(false);
  const [addPiForPlo, setAddPiForPlo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => getProgram(PROGRAM_CODE).then(setProgram);

  useEffect(() => {
    refetch().finally(() => setLoading(false));
  }, []);

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
  if (!program) return <div>—</div>;

  const piCount = program.plos.reduce((s, p) => s + p.pis.length, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chuẩn đầu ra (PLO)</h1>
          <p className="text-sm text-gray-500 mt-1">
            {program.plos.length} PLO · {piCount} chỉ báo (PI) · v{program.version}
          </p>
        </div>
        <button
          onClick={() => setShowAddPlo(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded text-sm"
        >
          + Thêm PLO mới
        </button>
      </header>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">{error}</div>}

      {showAddPlo && (
        <PLOForm
          programPos={program.pos.map((po) => po.code)}
          nextCode={`PLO${program.plos.length + 1}`}
          onSave={async (body) => {
            await wrap(async () => {
              await createPLO(PROGRAM_CODE, body);
              setShowAddPlo(false);
            });
          }}
          onCancel={() => setShowAddPlo(false)}
        />
      )}

      <div className="space-y-3">
        {program.plos.map((plo) => (
          <div key={plo.id} className="bg-white rounded-lg border border-gray-200 p-5">
            {editingPloId === plo.id ? (
              <PLOEditForm
                plo={plo}
                programPos={program.pos.map((po) => po.code)}
                onSave={async (body, poCodes) => {
                  await wrap(async () => {
                    await updatePLO(plo.id, body);
                    if (poCodes !== undefined) await updatePLOPOMapping(plo.id, poCodes);
                    setEditingPloId(null);
                  });
                }}
                onCancel={() => setEditingPloId(null)}
              />
            ) : (
              <div className="flex items-start gap-3">
                <span className="text-brand-700 font-bold text-sm font-mono mt-0.5 shrink-0 w-14">
                  {plo.code}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{plo.text_vn}</div>
                  {plo.po_codes.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {plo.po_codes.map((po) => (
                        <span
                          key={po}
                          className="text-xs bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-mono"
                        >
                          → {po}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditingPloId(plo.id)}
                    className="text-xs text-gray-500 hover:text-brand-700 px-2 py-1"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xóa ${plo.code}? Sẽ xóa cả ${plo.pis.length} PI con + mappings.`)) {
                        wrap(() => deletePLO(plo.id));
                      }
                    }}
                    className="text-xs text-gray-400 hover:text-red-600 px-2 py-1"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )}

            {/* PIs */}
            <ul className="mt-3 ml-14 space-y-1.5 text-sm border-l-2 border-gray-100 pl-4">
              {plo.pis.map((pi) => (
                <li key={pi.id}>
                  {editingPiId === pi.id ? (
                    <PIEditForm
                      pi={pi}
                      onSave={async (body) => {
                        await wrap(async () => {
                          await updatePI(pi.id, body);
                          setEditingPiId(null);
                        });
                      }}
                      onCancel={() => setEditingPiId(null)}
                    />
                  ) : (
                    <div className="flex gap-2 group">
                      <span className="font-mono text-xs text-gray-500 shrink-0 mt-0.5 w-12">
                        {pi.code}
                      </span>
                      <span className="text-gray-700 flex-1">{pi.text_vn}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 shrink-0">
                        <button
                          onClick={() => setEditingPiId(pi.id)}
                          className="text-xs text-gray-400 hover:text-brand-700 px-1"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa ${pi.code}?`)) wrap(() => deletePI(pi.id));
                          }}
                          className="text-xs text-gray-300 hover:text-red-600 px-1"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}

              {addPiForPlo === plo.id ? (
                <li>
                  <PIEditForm
                    pi={{
                      id: '',
                      code: `PI${plo.code.replace('PLO', '')}.${plo.pis.length + 1}`,
                      text_vn: '',
                      order: plo.pis.length + 1,
                    }}
                    onSave={async (body) => {
                      await wrap(async () => {
                        await createPI(plo.id, { code: body.code!, text_vn: body.text_vn! });
                        setAddPiForPlo(null);
                      });
                    }}
                    onCancel={() => setAddPiForPlo(null)}
                  />
                </li>
              ) : (
                <li>
                  <button
                    onClick={() => setAddPiForPlo(plo.id)}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    + thêm PI cho {plo.code}
                  </button>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────── Edit forms ──────────────

function PLOEditForm({
  plo, programPos, onSave, onCancel,
}: {
  plo: PLO;
  programPos: string[];
  onSave: (body: { code: string; text_vn: string }, poCodes?: string[]) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(plo.code);
  const [text, setText] = useState(plo.text_vn);
  const [poCodes, setPoCodes] = useState<string[]>(plo.po_codes);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border rounded px-2 py-1 font-mono text-sm w-20"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="border rounded px-2 py-1 text-sm flex-1"
        />
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="text-gray-500 mr-1">Map vào PO:</span>
        {programPos.map((po) => (
          <label key={po} className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={poCodes.includes(po)}
              onChange={(e) =>
                setPoCodes(e.target.checked ? [...poCodes, po] : poCodes.filter((c) => c !== po))
              }
            />
            <span className="font-mono">{po}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ code, text_vn: text }, poCodes)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1 rounded text-xs"
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

function PLOForm({
  nextCode, onSave, onCancel,
}: {
  programPos: string[];
  nextCode: string;
  onSave: (body: { code: string; text_vn: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(nextCode);
  const [text, setText] = useState('');

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 space-y-2">
      <div className="text-sm font-medium text-brand-900">Thêm PLO mới</div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="PLO10"
          className="border rounded px-2 py-1 font-mono text-sm w-20"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Mô tả PLO..."
          className="border rounded px-2 py-1 text-sm flex-1"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ code, text_vn: text })}
          disabled={!code || !text}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-3 py-1 rounded text-xs"
        >
          Tạo
        </button>
        <button onClick={onCancel} className="text-gray-500 px-3 py-1 text-xs">
          Hủy
        </button>
      </div>
      <div className="text-xs text-gray-500">PI con và mapping PO có thể thêm sau.</div>
    </div>
  );
}

function PIEditForm({
  pi, onSave, onCancel,
}: {
  pi: Pick<PI, 'id' | 'code' | 'text_vn' | 'order'>;
  onSave: (body: { code: string; text_vn: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(pi.code);
  const [text, setText] = useState(pi.text_vn);

  return (
    <div className="flex gap-2 items-start py-1">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border rounded px-2 py-1 font-mono text-xs w-16 mt-0.5"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="border rounded px-2 py-1 text-xs flex-1"
      />
      <button
        onClick={() => onSave({ code, text_vn: text })}
        disabled={!code || !text}
        className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-2 py-1 rounded text-xs"
      >
        Lưu
      </button>
      <button onClick={onCancel} className="text-gray-500 text-xs px-1">
        Hủy
      </button>
    </div>
  );
}
