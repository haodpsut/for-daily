import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Tổng quan', icon: '◐' },
  { to: '/pos', label: 'Mục tiêu (PO)', icon: '◧' },
  { to: '/plos', label: 'Chuẩn đầu ra (PLO)', icon: '◨' },
  { to: '/courses', label: 'Học phần', icon: '◰' },
  { to: '/import', label: 'Import Excel', icon: '⬆' },
  { to: '/outputs', label: 'Tài liệu sinh ra', icon: '◳' },
];

export default function Layout() {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-brand-900 text-white flex flex-col">
        <div className="p-5 border-b border-brand-700">
          <div className="text-lg font-bold">CĐR Steward</div>
          <div className="text-xs text-brand-100 mt-1">Single source of truth — CTĐT</div>
        </div>
        <nav className="flex-1 py-4">
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
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-700 text-xs text-brand-100">
          v0.2 — DAU CNTT 7480201
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
