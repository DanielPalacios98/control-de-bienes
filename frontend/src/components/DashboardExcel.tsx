import React, { useState, useEffect, useMemo } from 'react';
import { Equipment, User, UnitType, Custodian, LoanRecord } from '../types';
import { inventoryAPI, custodianAPI, loanRecordAPI } from '../services/api';
import { convertToEquipment } from '../services/converters';

interface DashboardExcelProps {
  user: User;
}

interface FormDataEquipment {
  esigeft: boolean;
  esbye: boolean;
  tipo: string;
  description: string;
  unit: UnitType;
  materialServible: number;
  materialCaducado: number;
  materialPrestado: number;
  observacion: string;
  custodianId: string;
}

interface Column {
  id: keyof Equipment | 'actions' | 'totalEnBodega' | 'total';
  label: string;
  visible: boolean;
  order: number;
}

const DashboardExcel: React.FC<DashboardExcelProps> = ({ user }) => {
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [defaultCustodian, setDefaultCustodian] = useState<Custodian | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modals State
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Forms State
  const [formData, setFormData] = useState<FormDataEquipment>({
    esigeft: false,
    esbye: false,
    tipo: '',
    description: '',
    unit: UnitType.EA,
    materialServible: 0,
    materialCaducado: 0,
    materialPrestado: 0,
    observacion: '',
    custodianId: ''
  });

  const [incomeForm, setIncomeForm] = useState({
    cantidad: 0,
    tipo: 'servible' as 'servible' | 'caducado'
  });

  const [outcomeForm, setOutcomeForm] = useState({
    cantidad: 0,
    responsibleName: '',
    responsibleIdentification: '',
    responsibleArea: '',
    custodianId: '',
    observacion: ''
  });

  // Filters & Table State
  const [filters, setFilters] = useState({
    search: '',
    tipo: '',
    esigeft: 'all',
    esbye: 'all'
  });
  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  const [columns, setColumns] = useState<Column[]>([
    { id: 'esigeft', label: 'ESIGEF', visible: true, order: 0 },
    { id: 'esbye', label: 'ESBYE', visible: true, order: 1 },
    { id: 'tipo', label: 'TIPO', visible: true, order: 2 },
    { id: 'description', label: 'DESCRIPCIÓN', visible: true, order: 3 },
    { id: 'unit', label: 'UND', visible: true, order: 4 },
    { id: 'materialServible', label: 'MAT. SERVIBLE', visible: true, order: 5 },
    { id: 'materialCaducado', label: 'MAT. CADUCADO', visible: true, order: 6 },
    { id: 'totalEnBodega', label: 'TOTAL BODEGA', visible: true, order: 7 },
    { id: 'materialPrestado', label: 'MAT. PRESTADO', visible: true, order: 8 },
    { id: 'total', label: 'TOTAL', visible: true, order: 9 },
    { id: 'observacion', label: 'OBSERVACIÓN', visible: true, order: 10 },
    { id: 'actions', label: 'ACCIONES', visible: true, order: 11 },
  ]);

  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);

  // --- Logic ---

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryData, custodiansData, defaultCust] = await Promise.all([
        inventoryAPI.getAll(),
        custodianAPI.getAll(),
        custodianAPI.getDefault()
      ]);
      
      const converted = inventoryData.map(convertToEquipment);
      setInventory(converted);
      
      const mappedCustodians: Custodian[] = custodiansData.map(c => ({
        id: c._id,
        name: c.name,
        rank: c.rank,
        identification: c.identification,
        area: c.area,
        isActive: c.isActive,
        isDefault: c.isDefault
      }));
      setCustodians(mappedCustodians);
      
      const mappedDefault: Custodian = {
        id: defaultCust._id,
        name: defaultCust.name,
        rank: defaultCust.rank,
        identification: defaultCust.identification,
        area: defaultCust.area,
        isActive: defaultCust.isActive,
        isDefault: defaultCust.isDefault
      };
      setDefaultCustodian(mappedDefault);
      setFormData(prev => ({ ...prev, custodianId: mappedDefault.id }));
      setOutcomeForm(prev => ({ ...prev, custodianId: mappedDefault.id }));
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Memos for Filter/Sort ---

  const uniqueTipos = useMemo(() => Array.from(new Set(inventory.map(i => i.tipo))).sort(), [inventory]);

  const processedInventory = useMemo(() => {
    let result = [...inventory];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(item => 
        item.description.toLowerCase().includes(q) || 
        item.tipo.toLowerCase().includes(q)
      );
    }
    if (filters.tipo) {
      result = result.filter(item => item.tipo === filters.tipo);
    }
    if (filters.esigeft !== 'all') {
      result = result.filter(item => item.esigeft === (filters.esigeft === 'yes'));
    }
    if (filters.esbye !== 'all') {
      result = result.filter(item => item.esbye === (filters.esbye === 'yes'));
    }

    if (sortConfig) {
      result.sort((a, b) => {
        // @ts-ignore
        const valA = a[sortConfig.key] || '';
        // @ts-ignore
        const valB = b[sortConfig.key] || '';
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [inventory, filters, sortConfig]);

  // --- Handlers ---

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryAPI.create({
        ...formData,
        branchId: user.branchId || ''
      });
      resetForm();
      setIsNewEquipmentModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error creando equipo:', error);
      alert(error.response?.data?.message || 'Error al crear equipo');
    }
  };

  const handleIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await inventoryAPI.registerIncome({
        equipmentId: selectedEquipment.id,
        cantidad: incomeForm.cantidad,
        tipo: incomeForm.tipo
      });
      setIsIncomeModalOpen(false);
      setSelectedEquipment(null);
      setIncomeForm({ cantidad: 0, tipo: 'servible' });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al registrar ingreso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await inventoryAPI.registerOutcome({
        equipmentId: selectedEquipment.id,
        cantidad: outcomeForm.cantidad,
        responsibleName: outcomeForm.responsibleName,
        responsibleIdentification: outcomeForm.responsibleIdentification || undefined,
        responsibleArea: outcomeForm.responsibleArea || undefined,
        custodianId: outcomeForm.custodianId,
        observacion: outcomeForm.observacion || undefined
      });
      setIsOutcomeModalOpen(false);
      setSelectedEquipment(null);
      resetOutcomeForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al registrar egreso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este equipo?')) return;
    try {
      await inventoryAPI.delete(id);
      loadData();
    } catch (error) {
      alert('Error al eliminar equipo');
    }
  };

  const resetForm = () => {
    setFormData({
      esigeft: false,
      esbye: false,
      tipo: '',
      description: '',
      unit: UnitType.EA,
      materialServible: 0,
      materialCaducado: 0,
      materialPrestado: 0,
      observacion: '',
      custodianId: defaultCustodian?.id || ''
    });
  };

  const resetOutcomeForm = () => {
    setOutcomeForm({
      cantidad: 0,
      responsibleName: '',
      responsibleIdentification: '',
      responsibleArea: '',
      custodianId: defaultCustodian?.id || '',
      observacion: ''
    });
  };

  const openIncomeModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIncomeForm({ cantidad: 0, tipo: 'servible' });
    setIsIncomeModalOpen(true);
  };

  const openOutcomeModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    resetOutcomeForm();
    setIsOutcomeModalOpen(true);
  };

  // --- Sort & Drag Handlers ---

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumnIndex(index);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColumnIndex === null || draggedColumnIndex === dropIndex) return;
    const newColumns = [...columns];
    const draggedItem = newColumns[draggedColumnIndex];
    newColumns.splice(draggedColumnIndex, 1);
    newColumns.splice(dropIndex, 0, draggedItem);
    setColumns(newColumns.map((c, i) => ({ ...c, order: i })));
    setDraggedColumnIndex(null);
  };

  // --- UI Constants ---
  const inputClass = "w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide";
  const buttonPrimary = "px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm text-sm";
  const buttonSecondary = "px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm";
  const buttonDanger = "px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Inventario General</h1>
              <p className="text-xs text-gray-500">Gestión de existencias y movimientos</p>
            </div>
            <button
              onClick={() => setIsNewEquipmentModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 text-sm shadow-sm"
            >
              <i className="fas fa-plus"></i>
              Nuevo Ingreso de Material
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        
        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
             <div className="flex-1 w-full">
               <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Buscar</label>
               <div className="relative">
                 <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                 <input
                   type="text"
                   placeholder="Descripción, tipo, código..."
                   value={filters.search}
                   onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                   className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                 />
               </div>
             </div>
             
             <div className="w-full md:w-64">
               <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tipo</label>
               <select
                 value={filters.tipo}
                 onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
                 className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
               >
                 <option value="">Todas</option>
                 {uniqueTipos.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
             </div>

             <div className="w-full md:w-48">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Stock al día</label>
                <input 
                  type="date"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
             </div>
          </div>
          
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
             <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={filters.esigeft === 'yes'}
                  onChange={(e) => setFilters(prev => ({ ...prev, esigeft: e.target.checked ? 'yes' : 'all' }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">ESIGEF</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={filters.esbye === 'yes'}
                  onChange={(e) => setFilters(prev => ({ ...prev, esbye: e.target.checked ? 'yes' : 'all' }))}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">ESBYE</span>
             </label>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columns.map((col, index) => (
                    col.visible && (
                      <th 
                        key={col.id}
                        className={`px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none ${draggedColumnIndex === index ? 'opacity-50 bg-blue-50' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onClick={() => col.id !== 'actions' && handleSort(col.id as string)}
                        title="Click para ordenar, arrastrar para mover"
                      >
                         <div className="flex items-center gap-2">
                            <span>{col.label}</span>
                            {sortConfig?.key === col.id && (
                              <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} text-blue-600`}></i>
                            )}
                         </div>
                      </th>
                    )
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {processedInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      {columns.map((col) => {
                        if (!col.visible) return null;
                        
                        if (col.id === 'actions') {
                           return (
                             <td key={col.id} className="px-4 py-2 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openIncomeModal(item)}
                                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-bold"
                                    title="Registrar Ingreso"
                                  >
                                    <i className="fas fa-arrow-down mr-1"></i>
                                    Ingreso
                                  </button>
                                  <button
                                    onClick={() => openOutcomeModal(item)}
                                    className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-xs font-bold"
                                    title="Registrar Egreso"
                                  >
                                    <i className="fas fa-arrow-up mr-1"></i>
                                    Egreso
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs"
                                    title="Eliminar"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                             </td>
                           );
                        }

                        if (col.id === 'esigeft') {
                          return (
                            <td key={col.id} className="px-4 py-2 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${item.esigeft ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                {item.esigeft ? 'SÍ' : 'NO'}
                              </span>
                            </td>
                          );
                        }
                        if (col.id === 'esbye') {
                           return (
                             <td key={col.id} className="px-4 py-2 text-center">
                               <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${item.esbye ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                                 {item.esbye ? 'SÍ' : 'NO'}
                               </span>
                             </td>
                           );
                        }
                        
                        // Numeric columns styling
                        const isNumber = ['materialServible', 'materialCaducado', 'totalEnBodega', 'materialPrestado', 'total'].includes(col.id);
                        if (isNumber) {
                           // @ts-ignore
                           const val = Number(item[col.id]);
                           let colorClass = "text-gray-900";
                           if (col.id === 'materialServible') colorClass = "text-green-700 font-bold";
                           if (col.id === 'materialPrestado' && val > 0) colorClass = "text-orange-600 font-bold";
                           if (col.id === 'materialCaducado' && val > 0) colorClass = "text-red-600 font-bold";
                           
                           return (
                             <td key={col.id} className={`px-4 py-2 text-sm text-center ${colorClass}`}>
                                {val}
                             </td>
                           );
                        }

                        return (
                          <td key={col.id} className="px-4 py-2 text-sm text-gray-700">
                             {/* @ts-ignore */}
                             {item[col.id]}
                          </td>
                        );
                      })}
                    </tr>
                 ))}
                 {processedInventory.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                         <i className="fas fa-inbox text-4xl mb-3 block"></i>
                         No se encontraron registros
                      </td>
                    </tr>
                 )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Nuevo Equipo */}
      {isNewEquipmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-gray-900">Nuevo Ingreso de Material</h3>
               <button onClick={() => { setIsNewEquipmentModalOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                 <i className="fas fa-times"></i>
               </button>
             </div>
             <form onSubmit={handleCreateEquipment} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                     <input type="checkbox" checked={formData.esigeft} onChange={e => setFormData({...formData, esigeft: e.target.checked})} className="rounded text-blue-600" />
                     <span className="text-sm font-medium">ESIGEF</span>
                   </label>
                   <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                     <input type="checkbox" checked={formData.esbye} onChange={e => setFormData({...formData, esbye: e.target.checked})} className="rounded text-purple-600" />
                     <span className="text-sm font-medium">ESBYE</span>
                   </label>
                </div>
                
                <div>
                   <label className={labelClass}>Tipo</label>
                   <input type="text" required value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className={inputClass} placeholder="Ej: Vestuario, Táctico..." />
                </div>
                <div>
                   <label className={labelClass}>Descripción</label>
                   <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputClass} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Unidad</label>
                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value as UnitType})} className={inputClass}>
                       {Object.values(UnitType).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Custodio Default</label>
                    <select value={formData.custodianId} onChange={e => setFormData({...formData, custodianId: e.target.value})} className={inputClass} required>
                       <option value="">Seleccione...</option>
                       {custodians.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                   <div>
                      <label className={labelClass}>Servible</label>
                      <input type="number" min="0" value={formData.materialServible} onChange={e => setFormData({...formData, materialServible: +e.target.value})} className={inputClass} />
                   </div>
                   <div>
                      <label className={labelClass}>Caducado</label>
                      <input type="number" min="0" value={formData.materialCaducado} onChange={e => setFormData({...formData, materialCaducado: +e.target.value})} className={inputClass} />
                   </div>
                   <div>
                      <label className={labelClass}>Prestado</label>
                      <input type="number" min="0" value={formData.materialPrestado} onChange={e => setFormData({...formData, materialPrestado: +e.target.value})} className={inputClass} />
                   </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                   <button type="button" onClick={() => setIsNewEquipmentModalOpen(false)} className={buttonSecondary}>Cancelar</button>
                   <button type="submit" className={buttonPrimary}>Guardar</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Modal Ingreso */}
      {isIncomeModalOpen && selectedEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                 <i className="fas fa-arrow-down"></i> Ingreso de Material
              </h3>
              <form onSubmit={handleIncome} className="space-y-4">
                 <div className="p-3 bg-gray-50 rounded text-sm">
                    <p className="font-bold">{selectedEquipment.description}</p>
                 </div>
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2"><input type="radio" value="servible" checked={incomeForm.tipo === 'servible'} onChange={() => setIncomeForm(p => ({...p, tipo: 'servible'}))} /> Servible</label>
                    <label className="flex items-center gap-2"><input type="radio" value="caducado" checked={incomeForm.tipo === 'caducado'} onChange={() => setIncomeForm(p => ({...p, tipo: 'caducado'}))} /> Caducado</label>
                 </div>
                 <div>
                    <label className={labelClass}>Cantidad</label>
                    <input type="number" min="1" required value={incomeForm.cantidad} onChange={e => setIncomeForm(p => ({...p, cantidad: +e.target.value}))} className={inputClass} />
                 </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsIncomeModalOpen(false)} className={buttonSecondary}>Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Registrar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Modal Egreso */}
      {isOutcomeModalOpen && selectedEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
                 <i className="fas fa-arrow-up"></i> Egreso de Material
              </h3>
              <form onSubmit={handleOutcome} className="space-y-4">
                 <div className="p-3 bg-orange-50 text-orange-800 rounded text-sm">
                    <p className="font-bold">{selectedEquipment.description}</p>
                    <p className="text-xs mt-1">Stock Servible: {selectedEquipment.materialServible}</p>
                 </div>
                 
                 <div>
                    <label className={labelClass}>Cantidad</label>
                    <input type="number" min="1" max={selectedEquipment.materialServible} required value={outcomeForm.cantidad} onChange={e => setOutcomeForm(p => ({...p, cantidad: +e.target.value}))} className={inputClass} />
                 </div>
                 
                 <div className="border-t pt-4">
                    <label className={labelClass}>Responsable</label>
                    <input type="text" required placeholder="Grado y Nombre" value={outcomeForm.responsibleName} onChange={e => setOutcomeForm(p => ({...p, responsibleName: e.target.value}))} className={inputClass} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Cédula</label>
                      <input type="text" value={outcomeForm.responsibleIdentification} onChange={e => setOutcomeForm(p => ({...p, responsibleIdentification: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Área</label>
                      <input type="text" value={outcomeForm.responsibleArea} onChange={e => setOutcomeForm(p => ({...p, responsibleArea: e.target.value}))} className={inputClass} />
                    </div>
                 </div>

                 <div>
                    <label className={labelClass}>Autorizado Por</label>
                    <select required value={outcomeForm.custodianId} onChange={e => setOutcomeForm(p => ({...p, custodianId: e.target.value}))} className={inputClass}>
                       <option value="">Seleccione...</option>
                       {custodians.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>

                 <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setIsOutcomeModalOpen(false)} className={buttonSecondary}>Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Registrar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default DashboardExcel;
