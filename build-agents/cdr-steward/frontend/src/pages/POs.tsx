import { useEffect, useState } from 'react';
import { getProgram } from '../api/programs';
import type { ProgramDetail } from '../types';

export default function POs() {
  const [program, setProgram] = useState<ProgramDetail | null>(null);

  useEffect(() => {
    getProgram('7480201').then(setProgram);
  }, []);

  if (!program) return <div className="text-gray-500">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Mục tiêu đào tạo (PO)</h1>
        <p className="text-sm text-gray-500 mt-1">{program.pos.length} mục tiêu</p>
      </header>

      <div className="space-y-3">
        {program.pos.map((po) => (
          <div key={po.id} className="bg-white rounded-lg border border-gray-200 p-5 flex gap-4">
            <span className="text-brand-700 font-bold font-mono shrink-0">{po.code}</span>
            <p className="text-gray-800">{po.text_vn}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
