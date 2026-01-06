
import React, { useState, useMemo } from 'react';
import { 
  Equipment, 
  EquipmentStatus, 
  EquipmentCondition, 
  Movement, 
  MovementType, 
  Branch, 
  UnitType, 
  UserRole, 
  User,
  LocationType
} from '../types';
import { mockBranches, initialInventory, mockMovements } from '../services/mockData';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [inventory, setInventory] = useState<Equipment[]>(initialInventory);
  const [movements, setMovements] = useState<Movement[]>(mockMovements);
  const [activeView, setActiveView] = useState<'inventory' | 'history'>('inventory');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState(user.role === UserRole.BRANCH_ADMIN ? user.branchId : 'all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'individual' | 'quantity' | 'bulk'>('individual');
  
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (item.inventoryId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            item.currentResponsibleName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = filterBranch === 'all' || item.branchId === filterBranch;
      const matchesLocation = filterLocation === 'all' || item.locationType === filterLocation;
      return matchesSearch && matchesBranch && matchesLocation;
    });
  }, [inventory, searchTerm, filterBranch, filterLocation]);

  const handleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData);
    const timestamp = new Date().toISOString();
    const branch = mockBranches.find(b => b.id === data.branchId);
    
    if (entryType === 'individual') {
      const newItem: Equipment = {
        id: `SYS-${Date.now()}`,
        inventoryId: data.inventoryId as string,
        hasIndividualId: true,
        description: data.description as string,
        unit: data.unit as UnitType,
        condition: data.condition as EquipmentCondition,
        status: EquipmentStatus.AVAILABLE,
        locationType: LocationType.BODEGA,
        entryDate: timestamp.split('T')[0],
        currentResponsibleId: branch?.managerId || '',
        currentResponsibleName: branch?.managerName || '',
        branchId: data.branchId as string,
        stock: 1
      };
      setInventory(prev => [...prev, newItem]);
    } else if (entryType === 'quantity') {
      const newItem: Equipment = {
        id: `SYS-${Date.now()}`,
        hasIndividualId: false,
        description: data.description as string,
        unit: data.unit as UnitType,
        condition: data.condition as EquipmentCondition,
        status: EquipmentStatus.AVAILABLE,
        locationType: LocationType.BODEGA,
        entryDate: timestamp.split('T')[0],
        currentResponsibleId: branch?.managerId || '',
        currentResponsibleName: branch?.managerName || '',
        branchId: data.branchId as string,
        stock: Number(data.quantity)
      };
      setInventory(prev => [...prev, newItem]);
    } else if (entryType === 'bulk') {
      const qty = Number(data.quantity);
      const newItems: Equipment[] = [];
      for (let i = 1; i <= qty; i++) {
        newItems.push({
          id: `SYS-${Date.now()}-${i}`,
          inventoryId: `${data.prefix || 'ID'}-${Date.now()}-${i}`,
          hasIndividualId: true,
          description: data.description as string,
          unit: data.unit as UnitType,
          condition: data.condition as EquipmentCondition,
          status: data.destination === 'egreso' ? EquipmentStatus.IN_USE : EquipmentStatus.AVAILABLE,
          locationType: data.destination === 'egreso' ? LocationType.EN_USO : LocationType.BODEGA,
          entryDate: timestamp.split('T')[0],
          currentResponsibleId: branch?.managerId || '',
          currentResponsibleName: branch?.managerName || '',
          branchId: data.branchId as string,
          stock: 1
        });
      }
      setInventory(prev => [...prev, ...newItems]);
    }
    setIsEntryModalOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData);

    setInventory(prev => prev.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          description: data.description as string,
          inventoryId: item.hasIndividualId ? data.inventoryId as string : undefined,
          condition: data.condition as EquipmentCondition,
          currentResponsibleName: data.currentResponsibleName as string,
          currentResponsibleId: data.currentResponsibleId as string,
          locationType: data.locationType as LocationType,
          branchId: data.branchId as string,
          stock: item.hasIndividualId ? 1 : Number(data.stock)
        };
      }
      return item;
    }));
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    setInventory(prev => prev.filter(item => item.id !== selectedItem.id));
    setIsDeleteConfirmOpen(false);
    setSelectedItem(null);
  };

  const handleExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const qtyToExit = Number(formData.get('quantity'));
    const respId = formData.get('responsibleId') as string;
    const respName = formData.get('responsibleName') as string;
    const reason = formData.get('reason') as string;

    if (selectedItem.stock < qtyToExit) {
      alert("Stock insuficiente.");
      return;
    }

    const timestamp = new Date().toISOString();

    if (selectedItem.hasIndividualId) {
      setInventory(prev => prev.map(item => {
        if (item.id === selectedItem.id) {
          return {
            ...item,
            status: EquipmentStatus.IN_USE,
            locationType: LocationType.EN_USO,
            currentResponsibleId: respId,
            currentResponsibleName: respName
          };
        }
        return item;
      }));
    } else {
      setInventory(prev => {
        const updated = prev.map(item => {
          if (item.id === selectedItem.id) {
            return { ...item, stock: item.stock - qtyToExit };
          }
          return item;
        }).filter(item => item.stock > 0);

        const existingInUseIndex = updated.findIndex(i => 
          i.description === selectedItem.description && 
          i.currentResponsibleId === respId && 
          i.locationType === LocationType.EN_USO
        );

        if (existingInUseIndex !== -1) {
          updated[existingInUseIndex].stock += qtyToExit;
          return [...updated];
        } else {
          const inUseItem: Equipment = {
            id: `SYS-USE-${Date.now()}`,
            hasIndividualId: false,
            description: selectedItem.description,
            unit: selectedItem.unit,
            condition: selectedItem.condition,
            status: EquipmentStatus.IN_USE,
            locationType: LocationType.EN_USO,
            entryDate: selectedItem.entryDate,
            currentResponsibleId: respId,
            currentResponsibleName: respName,
            branchId: selectedItem.branchId,
            stock: qtyToExit
          };
          return [...updated, inUseItem];
        }
      });
    }

    setMovements(prev => [...prev, {
      id: `mv-${Date.now()}`,
      equipmentId: selectedItem.id,
      type: MovementType.OUT,
      quantity: qtyToExit,
      responsibleId: respId,
      responsibleName: respName,
      performedByUserId: user.id,
      branchId: selectedItem.branchId,
      timestamp,
      reason
    }]);

    setIsExitModalOpen(false);
  };

  const inputClasses = "w-full border border-gray-300 bg-white text-gray-900 p-2.5 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all font-medium";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Centro Logístico</h1>
          <p className="text-slate-500 font-medium">Control de Inventario</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEntryModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"
          >
            <i className="fas fa-plus-circle mr-2"></i> Nuevo Ingreso
          </button>
          <button 
            onClick={() => setActiveView(activeView === 'inventory' ? 'history' : 'inventory')}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all"
          >
            <i className={activeView === 'inventory' ? "fas fa-receipt mr-2" : "fas fa-warehouse mr-2"}></i>
            {activeView === 'inventory' ? 'Historial' : 'Bodega'}
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5 items-end">
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filtro de Búsqueda</label>
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              placeholder="Buscar por descripción, ID o responsable..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-56 space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="all">Cualquier Ubicación</option>
            <option value={LocationType.BODEGA}>En Bodega</option>
            <option value={LocationType.EN_USO}>Asignado (En Uso)</option>
          </select>
        </div>
        <div className="w-full md:w-56 space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Área / Sucursal</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="all">Todas las Bodegas</option>
            {mockBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      {activeView === 'inventory' ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Control Logístico</th>
                  <th className="px-8 py-5">Descripción del Bien</th>
                  <th className="px-8 py-5 text-center">Ubicación Actual</th>
                  <th className="px-8 py-5 text-center">Stock</th>
                  <th className="px-8 py-5">Custodio / Responsable</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-indigo-600 font-black">
                          {item.hasIndividualId ? (item.inventoryId || 'N/A') : 'CANTIDAD'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                          {item.hasIndividualId ? 'Identificación Unitaria' : 'Control Acumulado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-slate-800">{item.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase border border-slate-200 px-1.5 rounded">
                          {item.unit}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          item.condition === EquipmentCondition.SERVIBLE ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {item.condition}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        item.locationType === LocationType.BODEGA ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <i className={`fas ${item.locationType === LocationType.BODEGA ? 'fa-warehouse' : 'fa-user-tag'}`}></i>
                        {item.locationType === LocationType.BODEGA 
                          ? mockBranches.find(b => b.id === item.branchId)?.name || 'BODEGA'
                          : item.locationType}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className={`text-lg font-black ${item.stock <= 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                         {item.stock}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700">{item.currentResponsibleName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{item.currentResponsibleId}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {item.locationType === LocationType.BODEGA && (
                          <button 
                            onClick={() => { setSelectedItem(item); setIsExitModalOpen(true); }}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white p-2 rounded-xl transition-all shadow-sm"
                            title="Registrar Egreso"
                          >
                            <i className="fas fa-sign-out-alt"></i>
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedItem(item); setIsEditModalOpen(true); }}
                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white p-2 rounded-xl transition-all shadow-sm"
                          title="Editar Registro"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item); setIsDeleteConfirmOpen(true); }}
                          className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white p-2 rounded-xl transition-all shadow-sm"
                          title="Eliminar Registro"
                        >
                          <i className="fas fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInventory.length === 0 && (
              <div className="p-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-slate-200 text-3xl"></i>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No se encontraron registros activos</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-10">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Registro Maestro de Auditoría</h2>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full">Trazabilidad de Activos</div>
           </div>
           <div className="space-y-4">
             {movements.length === 0 ? (
               <p className="text-center py-10 text-slate-400 italic">No hay movimientos registrados.</p>
             ) : (
               [...movements].reverse().map(m => (
                 <div key={m.id} className="flex items-center gap-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-xs hover:border-indigo-100 transition-all">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <i className={`fas ${m.type === MovementType.OUT ? 'fa-arrow-up text-rose-500' : 'fa-arrow-down text-emerald-500'}`}></i>
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 uppercase">{m.type} DE {m.quantity} UNIDADES</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400 font-mono">{new Date(m.timestamp).toLocaleString()}</span>
                     </div>
                     <p className="mt-1 text-slate-500">Bien entregado a <span className="font-bold text-slate-700">{m.responsibleName}</span></p>
                   </div>
                   <div className="text-right">
                     <span className="block text-[10px] font-black text-slate-400 uppercase">Autorizado por</span>
                     <span className="font-bold text-indigo-600">{m.performedByUserId}</span>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>
      )}

      {/* Modal: Ingreso de Activos */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="p-10 bg-indigo-600 text-white flex justify-between items-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-tight">Nuevo Ingreso</h2>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setEntryType('individual')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${entryType === 'individual' ? 'bg-white text-indigo-600 shadow-lg' : 'bg-indigo-500/50 text-indigo-200 hover:bg-indigo-500'}`}>Unitario</button>
                  <button onClick={() => setEntryType('quantity')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${entryType === 'quantity' ? 'bg-white text-indigo-600 shadow-lg' : 'bg-indigo-500/50 text-indigo-200 hover:bg-indigo-500'}`}>Por Cantidad</button>
                  <button onClick={() => setEntryType('bulk')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${entryType === 'bulk' ? 'bg-white text-indigo-600 shadow-lg' : 'bg-indigo-500/50 text-indigo-200 hover:bg-indigo-500'}`}>Masivo</button>
                </div>
              </div>
              <button onClick={() => setIsEntryModalOpen(false)} className="relative z-10 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all group">
                <i className="fas fa-times text-xl group-hover:rotate-90 transition-all"></i>
              </button>
            </div>

            <form onSubmit={handleEntry} className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Técnica del Bien</label>
                  <input name="description" placeholder="Ej: Chaleco Táctico III-A" required className={inputClasses} />
                </div>

                {entryType === 'individual' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID / Serial de Fábrica</label>
                    <input name="inventoryId" placeholder="Ej: CH-2024-001" required className={inputClasses} />
                  </div>
                )}

                {entryType !== 'individual' && (
                  <div className="flex gap-5">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad Recibida</label>
                      <input name="quantity" type="number" min="1" required defaultValue="1" className={inputClasses} />
                    </div>
                    <div className="w-32">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidad</label>
                      <select name="unit" className={inputClasses}>
                        {Object.values(UnitType).map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {entryType === 'bulk' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prefijo de Seriales</label>
                    <input name="prefix" placeholder="Ej: FAL-" required className={inputClasses} />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condición Actual</label>
                  <select name="condition" className={inputClasses}>
                    <option value={EquipmentCondition.SERVIBLE}>Servible</option>
                    <option value={EquipmentCondition.CONDENADO}>Condenado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bodega Receptora</label>
                  <select name="branchId" className={inputClasses}>
                    {mockBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-8 flex justify-end gap-5 border-t border-slate-50">
                <button type="button" onClick={() => setIsEntryModalOpen(false)} className="px-8 py-4 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-600 transition-all">Cancelar</button>
                <button type="submit" className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">Validar e Ingresar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edición de Activo */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="p-10 bg-indigo-800 text-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Editar Activo</h2>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2">Sistema ID: {selectedItem.id}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-10 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción del Bien</label>
                  <input name="description" defaultValue={selectedItem.description} required className={inputClasses} />
                </div>

                {selectedItem.hasIndividualId ? (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Inventario</label>
                    <input name="inventoryId" defaultValue={selectedItem.inventoryId} required className={inputClasses} />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Actual</label>
                    <input name="stock" type="number" defaultValue={selectedItem.stock} required className={inputClasses} />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condición</label>
                  <select name="condition" defaultValue={selectedItem.condition} className={inputClasses}>
                    <option value={EquipmentCondition.SERVIBLE}>Servible</option>
                    <option value={EquipmentCondition.CONDENADO}>Condenado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación Actual</label>
                  <select name="locationType" defaultValue={selectedItem.locationType} className={inputClasses}>
                    <option value={LocationType.BODEGA}>BODEGA</option>
                    <option value={LocationType.EN_USO}>EN USO</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asignación de Bodega</label>
                  <select name="branchId" defaultValue={selectedItem.branchId} className={inputClasses}>
                    {mockBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl">
                   <div className="col-span-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsable Asignado</div>
                   <input name="currentResponsibleName" defaultValue={selectedItem.currentResponsibleName} placeholder="Nombre Responsable" className={inputClasses} />
                   <input name="currentResponsibleId" defaultValue={selectedItem.currentResponsibleId} placeholder="Cédula Responsable" className={inputClasses} />
                </div>
              </div>

              <div className="pt-8 flex justify-end gap-5 border-t border-slate-50">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 py-4 text-slate-400 font-black uppercase text-xs tracking-widest">Cancelar</button>
                <button type="submit" className="bg-indigo-800 text-white px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-900 transition-all">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmación de Eliminación */}
      {isDeleteConfirmOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-exclamation-triangle text-3xl"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">¿Eliminar Registro?</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Esta acción eliminará permanentemente el bien <span className="font-bold text-slate-800">"{selectedItem.description}"</span> de la base de datos logística. Esta operación no se puede deshacer.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-100 transition-all"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Egreso de Activos */}
      {isExitModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="p-10 bg-emerald-600 text-white">
              <h2 className="text-3xl font-black tracking-tight">Orden de Egreso</h2>
              <div className="flex items-center gap-3 mt-2 opacity-80">
                 <i className="fas fa-box-open text-xs"></i>
                 <span className="text-[10px] font-black uppercase tracking-widest">{selectedItem.description}</span>
              </div>
            </div>
            <form onSubmit={handleExit} className="p-10 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Saldo en Bodega</span>
                  <p className="text-xs font-medium text-emerald-600 italic">Ala {selectedItem.branchId.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-600">{selectedItem.stock}</span>
                  <span className="text-xs font-black text-emerald-500 ml-1">{selectedItem.unit}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad a Entregar</label>
                  <input 
                    name="quantity" 
                    type="number" 
                    max={selectedItem.stock} 
                    min="1" 
                    defaultValue={selectedItem.hasIndividualId ? 1 : ''} 
                    readOnly={selectedItem.hasIndividualId}
                    required 
                    className={inputClasses} 
                    placeholder="Ingrese cantidad..."
                  />
                </div>

                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información del Receptor</p>
                   <div>
                     <input name="responsibleName" placeholder="Nombre completo y Rango" required className={`${inputClasses} bg-white`} />
                   </div>
                   <div>
                     <input name="responsibleId" placeholder="Número de Cédula" required className={`${inputClasses} bg-white`} />
                   </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Justificación del Movimiento</label>
                  <textarea name="reason" placeholder="Ej: Dotación para operativo..." className={`${inputClasses} h-24 resize-none`}></textarea>
                </div>
              </div>

              <div className="pt-8 flex justify-end gap-5 border-t border-slate-50">
                <button type="button" onClick={() => setIsExitModalOpen(false)} className="px-6 py-4 text-slate-400 font-black uppercase text-xs tracking-widest">Cancelar</button>
                <button type="submit" className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all">Firmar Entrega</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
