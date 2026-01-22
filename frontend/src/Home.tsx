import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  UsersIcon,
  MagnifyingGlassCircleIcon,
  HomeIcon,
  DocumentChartBarIcon,
  ArchiveBoxIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { inventoryAPI, loanRecordAPI } from './services/api';

interface HomeProps {
  user: { name: string; role?: string };
}

// Odoo-style: Clean, consistent icons, no rainbow colors.
const modules = [
  { name: 'Inventario', route: '/inventory', icon: ClipboardDocumentListIcon },
  { name: 'Usuarios', route: '/users', icon: UsersIcon },
  { name: 'Auditorías', route: '/audits', icon: MagnifyingGlassCircleIcon },
  { name: 'Préstamos', route: '/loans', icon: HomeIcon },
  { name: 'Reportes', route: '/reports', icon: DocumentChartBarIcon },
];

const Home: React.FC<HomeProps> = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    totalStock: 0,
    activeLoans: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [inventory, loans] = await Promise.all([
          inventoryAPI.getAll(),
          loanRecordAPI.getActive()
        ]);

        const totalItems = inventory.length;
        const totalStock = inventory.reduce((sum, item) => sum + (item.totalEnBodega || 0), 0);
        const activeLoans = loans.length;
        const lowStock = inventory.filter(i => i.materialServible < 5).length;

        setStats({ totalItems, totalStock, activeLoans, lowStock });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Card Component for consistency
  const StatCard = ({ title, value, icon: Icon, alert = false }: { title: string, value: number | string, icon: any, alert?: boolean }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-800'}`}>
          {loading ? '-' : value}
        </p>
      </div>
      <div className={`h-10 w-10 rounded-md flex items-center justify-center ${alert ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-start py-10 px-4 sm:px-6 lg:px-8 font-sans">

      {/* Modern Simple Header */}
      <header className="w-full max-w-6xl mb-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="bg-slate-800 text-white p-1.5 rounded-md">
              <ArchiveBoxIcon className="h-6 w-6" />
            </div>
            Control de Bienes
          </h1>
          <p className="text-gray-500 text-sm mt-1">Panel de Control General</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase() || 'Usuario'}</p>
          </div>
          <div className="h-9 w-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold border-2 border-white shadow-sm">
            {user?.name?.charAt(0)}
          </div>
        </div>
      </header>

      {/* KPI Stats Grid - Clean & Minimal */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={ArchiveBoxIcon}
        />
        <StatCard
          title="Stock Bodega"
          value={stats.totalStock}
          icon={ClipboardDocumentListIcon}
        />
        <StatCard
          title="Préstamos Activos"
          value={stats.activeLoans}
          icon={ClockIcon}
        />
        <StatCard
          title="Alertas Stock"
          value={stats.lowStock}
          icon={ExclamationTriangleIcon}
          alert={stats.lowStock > 0}
        />
      </div>

      {/* Apps/Modules Grid - Odoo Style: White cards, consistent icons */}
      <main className="w-full max-w-6xl">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Aplicaciones</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {modules.map((mod) => (
            <button
              key={mod.route}
              onClick={() => navigate(mod.route)}
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="h-14 w-14 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 group-hover:bg-slate-100 group-hover:text-slate-800 transition-colors">
                <mod.icon className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{mod.name}</span>
            </button>
          ))}
        </div>
      </main>

    </div>
  );
};

export default Home;
