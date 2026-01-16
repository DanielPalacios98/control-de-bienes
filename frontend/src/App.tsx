
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center"
      >
        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white flex-shrink-0 flex flex-col border-r border-slate-800 z-40 transition-all duration-300
        ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 w-64' : 'fixed -left-64 w-64'}
        md:relative md:left-0 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
      `}>
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 flex-shrink-0 justify-between">
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'md:justify-center md:w-full' : ''}`}>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-warehouse text-xl"></i>
            </div>
            <span className={`text-xl font-bold tracking-tight ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
              Control de <span className="text-indigo-400">Bienes</span>
            </span>
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 items-center justify-center transition-all text-slate-400 hover:text-white"
            title={isSidebarCollapsed ? 'Expandir' : 'Colapsar'}
          >
            <i className={`fas ${isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>
        
        {/* Navegación - Crece para ocupar el espacio y permite scroll interno si es necesario */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => {
              setActiveTab('inventory');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
            title={isSidebarCollapsed ? 'Inventario' : ''}
          >
            <i className="fas fa-boxes w-5"></i>
            <span className={`font-medium ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Inventario</span>
          </button>
          
          {currentUser.role === UserRole.SUPER_ADMIN && (
            <button 
              onClick={() => {
                setActiveTab('users');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
              title={isSidebarCollapsed ? 'Usuarios' : ''}
            >
              <i className="fas fa-user-shield w-5"></i>
              <span className={`font-medium ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Usuarios</span>
            </button>
          )}

          <button 
            onClick={() => {
              setActiveTab('audit');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
            title={isSidebarCollapsed ? 'Auditoría' : ''}
          >
            <i className="fas fa-history w-5"></i>
            <span className={`font-medium ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Auditoría</span>
          </button>
        </nav>

        {/* Panel de Usuario - Fijo al fondo usando Flexbox, sin Absolute */}
        <div className={`p-4 border-t border-slate-800 bg-slate-900 flex-shrink-0 ${isSidebarCollapsed ? 'md:px-2' : ''}`}>
          <div className={`flex items-center gap-3 p-2 bg-slate-800/40 rounded-xl border border-slate-700/30 ${
            isSidebarCollapsed ? 'md:justify-center md:relative' : ''
          }`}>
            <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center text-xs font-black uppercase shadow-inner">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className={`flex-1 min-w-0 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
              <p className="text-xs font-black text-slate-100 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-tighter">
                {currentUser.role === UserRole.SUPER_ADMIN ? 'Admin General' : 'Bodeguero'}
              </p>
            </div>
            <button 
              onClick={() => setCurrentUser(null)} 
              className={`flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all ${
                isSidebarCollapsed ? 'md:absolute md:top-2 md:right-2 w-6 h-6' : 'w-8 h-8'
              }`}
              title="Cerrar Sesión"
            >
              <i className={`fas fa-sign-out-alt ${isSidebarCollapsed ? 'md:text-xs' : ''}`}></i>
            </button>
          </div>
        </div>

        {/* Móvil: Botón de cerrar sesión simplificado */}
        <div className="md:hidden p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={() => setCurrentUser(null)}
            className="w-full bg-rose-500/10 text-rose-400 py-3 rounded-lg font-medium hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal - Con su propio scroll independiente */}
      <main className="flex-1 h-full overflow-y-auto bg-gray-50 custom-scrollbar relative pt-16 md:pt-0">
        <div className="pb-12"> {/* Espaciado final para que el contenido no pegue al borde */}
          {activeTab === 'inventory' && <Dashboard user={currentUser} />}
          {activeTab === 'users' && currentUser.role === UserRole.SUPER_ADMIN && <UserManagement />}
          {activeTab === 'audit' && (
            <div className="p-8 text-center text-gray-500 min-h-[60vh] flex flex-col items-center justify-center">
               <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 mb-6">
                 <i className="fas fa-clipboard-list text-4xl text-indigo-400"></i>
               </div>
               <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Historial de Operaciones</h2>
               <p className="max-w-md text-slate-500 font-medium">Este módulo centraliza todas las entradas, egresos y cambios de responsable para garantizar la trazabilidad total.</p>
               <div className="mt-8 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">Módulo en Desarrollo</div>
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .sidebar-active {
          background: linear-gradient(to right, #4f46e5, #6366f1);
        }
      `}} />
    </div>
  );
};

export default App;
