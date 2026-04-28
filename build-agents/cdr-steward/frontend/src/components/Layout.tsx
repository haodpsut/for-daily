import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getImpact } from '../api/programs';
import { useProgram } from '../contexts/ProgramContext';
import { useAuth } from '../contexts/AuthContext';
import CreateProgramModal from './CreateProgramModal';

const navItems = [
  { to: '/', label: 'Tổng quan', icon: '◐' },
  { to: '/pos', label: 'Mục tiêu (PO)', icon: '◧' },
  { to: '/plos', label: 'Chuẩn đầu ra (PLO)', icon: '◨' },
  { to: '/courses', label: 'Học phần', icon: '◰' },
  { to: '/import', label: 'Import Excel', icon: '⬆' },
  { to: '/impact', label: 'Tác động thay đổi', icon: '⚡', badge: true },
  { to: '/measurement', label: 'Đo lường CĐR', icon: '◉' },
  { to: '/outputs', label: 'Tài liệu sinh ra', icon: '◳' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { programs, currentCode, setCurrentCode, loading } = useProgram();
  const navigate = useNavigate();
  const [staleCount, setStaleCount] = useState<number>(0);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!currentCode || programs.length === 0) {
      setStaleCount(0);
      return;
    }
    const tick = () =>
      getImpact(currentCode)
        .then((r) => setStaleCount(r.counts.stale + r.counts.missing))
        .catch(() => setStaleCount(0));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [currentCode, programs.length]);

  // Pre-warm bỏ — VPS server luôn warm, không cần ping. Layout's getImpact poll
  // 30s đã keep cdr alive, kdcl chỉ cần on-demand khi click /measurement.

  const handleLogout = () => {
    if (confirm('Đăng xuất?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-brand-900 text-white flex flex-col">
        <div className="p-5 border-b border-brand-700">
          <div className="text-lg font-bold">CĐR Steward</div>
          <div className="text-xs text-brand-100 mt-1">Single source of truth — CTĐT</div>
        </div>

        {/* User info */}
        {user && (
          <div className="p-3 border-b border-brand-700 text-xs text-brand-100">
            <div className="truncate font-medium text-white">{user.full_name || user.email}</div>
            <div className="truncate opacity-70">{user.email}</div>
            {user.institution_name && (
              <div className="truncate opacity-70 mt-1">{user.institution_name}</div>
            )}
            <button
              onClick={handleLogout}
              className="mt-2 w-full text-xs bg-brand-700 hover:bg-red-700 px-2 py-1 rounded transition"
            >
              Đăng xuất
            </button>
          </div>
        )}

        {/* Program switcher */}
        <div className="p-3 border-b border-brand-700 space-y-2">
          <label className="text-xs text-brand-100 px-1">Chương trình đào tạo</label>
          {loading ? (
            <div className="text-xs text-brand-100 italic px-1">Đang tải...</div>
          ) : programs.length === 0 ? (
            <div className="text-xs text-amber-300 italic px-1">Chưa có CTĐT</div>
          ) : (
            <select
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              className="w-full bg-brand-700 text-white border border-brand-600 rounded px-2 py-1.5 text-sm"
            >
              {programs.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code} — {p.name_vn}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowCreate(true)}
            className="w-full text-xs bg-brand-700 hover:bg-brand-600 px-2 py-1.5 rounded border border-brand-600 transition"
          >
            + Tạo CTĐT mới
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-brand-700 text-white border-l-4 border-white'
                    : 'text-brand-100 hover:bg-brand-700/50 border-l-4 border-transparent'
                }`
              }
            >
              <span className="text-base opacity-70">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && staleCount > 0 && (
                <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {staleCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-700 text-xs text-brand-100">
          v0.5 — Multi-tenant
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-6">
          {programs.length === 0 && !loading ? (
            <EmptyState onCreate={() => setShowCreate(true)} />
          ) : (
            <Outlet />
          )}
        </div>
      </main>

      {showCreate && <CreateProgramModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-lg p-16 text-center">
      <div className="text-5xl mb-4">📚</div>
      <h2 className="text-xl font-semibold mb-2">Chưa có Chương trình đào tạo nào</h2>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Tạo CTĐT đầu tiên để bắt đầu — sau đó thêm Mục tiêu, Chuẩn đầu ra, Học phần,
        hoặc upload Excel template có sẵn.
      </p>
      <button
        onClick={onCreate}
        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded font-medium"
      >
        + Tạo CTĐT đầu tiên
      </button>
    </div>
  );
}
