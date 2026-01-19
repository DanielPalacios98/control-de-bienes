import React, { useState, useEffect } from 'react';
import { loanRecordAPI } from '../services/api';
import { LoanRecord } from '../types';

const LoanDetails: React.FC = () => {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadActiveLoans();
  }, []);

  const loadActiveLoans = async () => {
    try {
      setLoading(true);
      const data = await loanRecordAPI.getActive();
      setLoans(data);
    } catch (err) {
      console.error('Error loading loans', err);
      setError('No se pudieron cargar los préstamos activos.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = loans.filter(loan => {
    const searchLower = searchTerm.toLowerCase();
    const equipName = typeof loan.equipmentId === 'object' ? loan.equipmentId.description : '';
    const respName = loan.responsibleName || '';
    
    return equipName.toLowerCase().includes(searchLower) || 
           respName.toLowerCase().includes(searchLower);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysElapsed = (dateString: string) => {
    const start = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return diff;
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
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">Material Prestado (Activo)</h1>
        <p className="text-slate-500">Listado de equipos que se encuentran actualmente fuera de bodega.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Buscar por equipo o responsable..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={loadActiveLoans}
          className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 border border-rose-100">
          <i className="fas fa-exclamation-circle mr-2"></i> {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filteredLoans.length > 0 ? (
          filteredLoans.map((loan) => {
            const days = getDaysElapsed(loan.loanDate);
            const isLate = days > 30; // Example threshold
            
            // Safe access for equipment
            const equipDescription = loan.equipmentId && typeof loan.equipmentId === 'object' 
              ? loan.equipmentId.description 
              : 'Equipo no disponible';
              
            const equipTipo = loan.equipmentId && typeof loan.equipmentId === 'object' 
              ? loan.equipmentId.tipo 
              : '';

            return (
              <div key={loan._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon & Status Color */}
                  <div className={`flex-shrink-0 hidden md:flex items-center justify-center w-12 h-12 rounded-lg ${isLate ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'}`}>
                    <i className="fas fa-box-open text-xl"></i>
                  </div>

                  {/* Mobile Header (Icon + Status) */}
                  <div className="flex md:hidden items-center justify-between">
                    <div className={`p-2 rounded-lg ${isLate ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'}`}>
                       <i className="fas fa-box-open text-lg"></i>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isLate ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>
                        {days} días
                    </span>
                  </div>

                  {/* Main Info: Equipment */}
                  <div className="flex-1 min-w-0">
                    <div className="hidden md:flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{equipTipo}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${isLate ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>
                        {days} días
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 truncate mb-1 md:mb-0" title={equipDescription}>{equipDescription}</h3>
                    <p className="text-xs text-gray-500 md:hidden">{equipTipo}</p>
                  </div>

                  {/* Secondary Info: Responsible */}
                  <div className="md:w-1/4 border-t border-gray-100 md:border-0 pt-3 md:pt-0">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1 md:hidden">Responsable</p>
                    <div className="flex items-start md:items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                         <span className="text-xs font-bold text-slate-600">{loan.responsibleName.charAt(0)}</span>
                       </div>
                       <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{loan.responsibleName}</p>
                          <p className="text-xs text-gray-500 truncate">{loan.responsibleArea || 'Sin área'}</p>
                       </div>
                    </div>
                  </div>

                  {/* Stats & Date */}
                  <div className="flex items-center justify-between md:flex-col md:items-end md:w-auto gap-2 md:gap-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                    <div className="flex md:flex-col items-center md:items-end gap-2 md:gap-0">
                       <span className="text-sm md:text-lg font-bold text-gray-900 leading-none">{loan.cantidad}</span>
                       <span className="text-xs md:text-[10px] text-gray-500 font-bold uppercase">Unidades</span>
                    </div>
                    
                    <div className="md:mt-2 text-right">
                      <p className="text-xs text-gray-400 font-medium whitespace-nowrap">
                        <i className="far fa-clock mr-1"></i>
                        {formatDate(loan.loanDate)}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-400 bg-white rounded-lg border border-dashed border-slate-300">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <i className="fas fa-check text-slate-300 text-xl"></i>
             </div>
             <p>No hay material prestado activo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanDetails;
