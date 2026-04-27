import { useEffect, useState } from 'react';
import { getProgram } from '../api/programs';
import type { ProgramDetail } from '../types';

const KG_LABEL: Record<string, string> = {
  DAI_CUONG: 'Đại cương',
  CO_SO: 'Cơ sở ngành',
  CHUYEN_NGANH: 'Chuyên ngành',
  TU_CHON: 'Tự chọn',
  TOT_NGHIEP: 'Tốt nghiệp',
};

export default function Courses() {
  const [program, setProgram] = useState<ProgramDetail | null>(null);

  useEffect(() => {
    getProgram('7480201').then(setProgram);
  }, []);

  if (!program) return <div className="text-gray-500">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Học phần</h1>
        <p className="text-sm text-gray-500 mt-1">
          {program.courses.length} học phần · tổng {program.courses.reduce((s, c) => s + c.credits, 0)} TC
        </p>
      </header>

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
                <td className="px-4 py-3 font-mono text-gray-700">{c.code}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{c.name_vn}</div>
                  {c.name_en && <div className="text-xs text-gray-400 mt-0.5">{c.name_en}</div>}
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
