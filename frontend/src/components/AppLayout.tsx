import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  MagnifyingGlassCircleIcon,
  DocumentChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

interface AppLayoutProps {
  user: { name: string };
  children?: React.ReactNode;
  onLogout?: () => void;
}

const sidebarItems = [
  { name: 'Inicio', route: '/', icon: Squares2X2Icon },
  { name: 'Inventario', route: '/inventory', icon: ClipboardDocumentListIcon },
  { name: 'Usuarios', route: '/users', icon: UsersIcon },
  { name: 'Auditorías', route: '/audits', icon: MagnifyingGlassCircleIcon },
  { name: 'Préstamos', route: '/loans', icon: ClockIcon },
  { name: 'Reportes', route: '/reports', icon: DocumentChartBarIcon },
];

const AppLayout: React.FC<AppLayoutProps> = ({ user, children, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside
        className={`${collapsed ? 'w-20' : 'w-64'
          } bg-white shadow-xl flex flex-col border-r border-gray-200 z-10 transition-all duration-300 relative`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-9 bg-white border border-gray-200 text-gray-500 rounded-full p-1 shadow-sm hover:text-slate-600 hover:border-slate-300 transition-colors"
          title={collapsed ? "Expandir" : "Contraer"}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </button>

        <div className={`px-6 py-8 flex items-center justify-between mb-2 ${collapsed ? 'flex-col gap-4 px-2' : ''}`}>
          {collapsed ? (
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">CB</span>
            </div>
          ) : (
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight uppercase flex items-center gap-2 whitespace-nowrap overflow-hidden">
              <span className="w-2 h-6 bg-slate-600 rounded-full shrink-0"></span>
              Módulos
            </h2>
          )}

          {!collapsed && (
            <button
              onClick={() => onLogout && onLogout()}
              className="text-xs font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition uppercase tracking-wider"
              title="Cerrar sesión"
            >
              Salir
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-2 px-3">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.route;
            return (
              <Link
                key={item.route}
                to={item.route}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all group ${isActive
                    ? 'bg-slate-100 text-slate-900 border border-slate-200/50 shadow-sm'
                    : 'text-gray-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : ''}
              >
                <item.icon
                  className={`h-6 w-6 shrink-0 transition-colors ${isActive ? 'text-slate-700' : 'text-gray-400 group-hover:text-slate-600'
                    }`}
                />
                {!collapsed && (
                  <span className="whitespace-nowrap overflow-hidden text-sm">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={`mt-auto pt-8 pb-4 border-t border-gray-100 mx-3 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-gray-200 cursor-default" title={user?.name}>
              {user?.name?.charAt(0)}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-1">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-gray-200 shrink-0">
                {user?.name?.charAt(0)}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-bold text-gray-700 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">Sesión Activa</p>
              </div>
            </div>
          )}
        </div>
      </aside>
      <main className="flex-1 p-10 bg-gray-50 min-h-screen overflow-auto">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AppLayout;
