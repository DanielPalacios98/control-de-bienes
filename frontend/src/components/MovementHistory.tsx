import React, { useState, useEffect, useMemo } from 'react';
import { movementAPI, MovementResponse } from '../services/api';
import MovementStats from './MovementStats';
import { exportToPDF, exportToExcel } from '../utils/reportGenerator';

const MovementHistory: React.FC = () => {
  const [movements, setMovements] = useState<MovementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movementAPI.getAll();
      setMovements(data);
    } catch (err) {
      console.error('Error loading movements', err);
      setError('No se pudieron cargar los movimientos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = movements.length;
    const ingresos = movements.filter(m => m.type === 'Ingreso').length;
    const egresos = movements.filter(m => m.type === 'Egreso').length;
    const ajustes = movements.filter(m => m.type === 'Ajuste').length;
    return { total, ingresos, egresos, ajustes };
  }, [movements]);

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchType = filterType === 'ALL' || m.type === filterType;
      
      const searchLower = searchTerm.toLowerCase();
      
      const equipName = m.equipmentId && typeof m.equipmentId === 'object' ? m.equipmentId.description : 'N/A';
      const equipType = m.equipmentId && typeof m.equipmentId === 'object' ? m.equipmentId.tipo : '';
      const respName = m.responsibleId && typeof m.responsibleId === 'object' ? m.responsibleId.name : 'N/A';
      const performedName = m.performedById && typeof m.performedById === 'object' ? m.performedById.name : 'N/A';
      const reason = m.reason || '';

      const matchSearch = !searchTerm || 
        equipName.toLowerCase().includes(searchLower) ||
        equipType?.toLowerCase().includes(searchLower) ||
        respName.toLowerCase().includes(searchLower) ||
        performedName.toLowerCase().includes(searchLower) ||
        reason.toLowerCase().includes(searchLower);

      return matchType && matchSearch;
    });
  }, [movements, filterType, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeColor = (type: string) => {
    switch(type) {
      case 'Ingreso': return 'bg-emerald-100 text-emerald-700';
      case 'Egreso': return 'bg-amber-100 text-amber-700';
      case 'Ajuste': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">Auditoría de Movimientos</h1>
        <p className="text-slate-500">Historial completo de ingresos, egresos y ajustes de inventario.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Movimientos</p>
          <p className="text-2xl font-black text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-l-4 border-l-emerald-500 border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Ingresos</p>
          <p className="text-2xl font-black text-slate-800">{stats.ingresos}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-l-4 border-l-amber-500 border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Egresos (Préstamos)</p>
          <p className="text-2xl font-black text-slate-800">{stats.egresos}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-l-4 border-l-blue-500 border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Ajustes</p>
          <p className="text-2xl font-black text-slate-800">{stats.ajustes}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6">
        
        {/* Search & Filters */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Buscar por equipo, responsable o motivo..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {['ALL', 'Ingreso', 'Egreso', 'Ajuste'].map((type) => (
                  <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                          filterType === type 
                              ? 'bg-indigo-600 text-white shadow-md' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                      {type === 'ALL' ? 'Todos' : type}
                  </button>
              ))}
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="flex gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm self-start xl:self-stretch">
           <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <i className="fas fa-list"></i> Lista
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'stats' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <i className="fas fa-chart-pie"></i> Gráficos
              </button>
           </div>
           
           <div className="w-px bg-slate-200 mx-1"></div>

           <button 
             onClick={() => exportToPDF(filteredMovements, `Tipo: ${filterType}`)}
             className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all text-sm font-bold flex items-center gap-2 border border-rose-100"
             title="Exportar a PDF"
           >
             <i className="fas fa-file-pdf"></i> PDF
           </button>
           <button 
             onClick={() => exportToExcel(filteredMovements, `Tipo: ${filterType}`)}
             className="px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all text-sm font-bold flex items-center gap-2 border border-emerald-100"
             title="Exportar a Excel"
           >
             <i className="fas fa-file-excel"></i> Excel
           </button>
           
           <div className="w-px bg-slate-200 mx-1"></div>

           <button 
            onClick={loadMovements}
            className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
            title="Recargar datos"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 border border-rose-100">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {activeTab === 'stats' ? (
        <MovementStats movements={filteredMovements} />
      ) : (
        /* Table - Reused styles from DashboardExcel style */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
         <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Equipo</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Cant.</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Responsable / Destino</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Registrado Por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((move) => {
                  const equipDesc = move.equipmentId && typeof move.equipmentId === 'object' ? move.equipmentId.description : 'Equipo eliminado';
                  const equipTipo = move.equipmentId && typeof move.equipmentId === 'object' ? move.equipmentId.tipo : '';
                  const respName = move.responsibleId && typeof move.responsibleId === 'object' ? move.responsibleId.name : 'Desconocido';
                  // For outgoing loans, responsibleId might be the user picking it up, 
                  // but sometimes text fields are used in LoanRecords. 
                  // However, Movement model has responsibleId as Ref to User. 
                  // Wait, Movement.responsibleId is Ref to User.
                  // If it's a loan to an external person, how is it stored in Movement?
                  // Looking at Movement.ts: responsibleId: { type: Schema.Types.ObjectId, ref: 'User' } (required).
                  // So Movements primarily track internal custody transfers or confirmed system users.
                  // If an external loan happens, usually a system user (Custodian) is the "responsible" for the transaction log,
                  // while the LoanRecord holds the external person's name.
                  // We'll display whatever user is linked.

                  const performedName = move.performedById && typeof move.performedById === 'object' ? move.performedById.name : 'Sistema';

                  return (
                    <tr key={move._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatDate(move.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${getBadgeColor(move.type)}`}>
                          {move.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{equipDesc}</span>
                            <span className="text-xs text-slate-400">{equipTipo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700 text-right">
                        {move.quantity}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">{respName}</span>
                            {move.reason && (
                                <span className="text-xs text-slate-400 italic mt-0.5">"{move.reason}"</span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {performedName}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <i className="fas fa-search text-3xl opacity-50"></i>
                            <p>No se encontraron movimientos con los filtros actuales.</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
     )}
    </div>
  );
};

export default MovementHistory;
