import React, { useState, useEffect } from 'react';
import { Equipment, User, UnitType, Custodian, LoanRecord } from '../types';
import { inventoryAPI, custodianAPI, loanRecordAPI, CustodianResponse } from '../services/api';
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

const DashboardExcel: React.FC<DashboardExcelProps> = ({ user }) => {
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [defaultCustodian, setDefaultCustodian] = useState<Custodian | null>(null);
  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryData, custodiansData, defaultCust, loanRecordsData] = await Promise.all([
        inventoryAPI.getAll(),
        custodianAPI.getAll(),
        custodianAPI.getDefault(),
        loanRecordAPI.getActive()
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
      
      setLoanRecords(loanRecordsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      console.error('Error registrando ingreso:', error);
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
      console.error('Error registrando egreso:', error);
      alert(error.response?.data?.message || 'Error al registrar egreso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async (loanRecordId: string, responsibleName: string) => {
    if (!window.confirm(`¿Confirmar devolución de ${responsibleName}?`)) return;

    try {
      setIsSubmitting(true);
      await loanRecordAPI.registerReturn(loanRecordId);
      alert('Devolución registrada exitosamente');
      loadData();
    } catch (error: any) {
      console.error('Error registrando devolución:', error);
      alert(error.response?.data?.message || 'Error al registrar devolución');
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
      console.error('Error eliminando equipo:', error);
      alert('Error al eliminar equipo');
    }
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

  // Agrupar equipos por tipo
  const groupedByTipo = inventory.reduce((acc, item) => {
    if (!acc[item.tipo]) {
      acc[item.tipo] = [];
    }
    acc[item.tipo].push(item);
    return acc;
  }, {} as Record<string, Equipment[]>);

  const inputClass = "w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide";
  const buttonPrimary = "px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm text-sm";
  const buttonSecondary = "px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm";
  const buttonDanger = "px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventario de Existencias</h1>
              <p className="text-sm text-gray-600 mt-1">Bodega de Equipo y Vestuario - Sistema de Control</p>
            </div>
            <button
              onClick={() => setIsNewEquipmentModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Nuevo Equipo
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Tabla de inventario */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ESIGEF</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ESBYE</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">UND</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider bg-green-50">Mat. Servible</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-red-700 uppercase tracking-wider bg-red-50">Mat. Caducado</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50">Total Bodega</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-orange-700 uppercase tracking-wider bg-orange-50">Mat. Prestado</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider bg-blue-50">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Observación</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(groupedByTipo).map(([tipo, items]) => (
                    <React.Fragment key={tipo}>
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-center text-sm">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${item.esigeft ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                              {item.esigeft ? 'SÍ' : 'NO'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${item.esbye ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                              {item.esbye ? 'SÍ' : 'NO'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-medium">{item.tipo}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{item.description}</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600 font-mono">{item.unit}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-green-700 bg-green-50">{item.materialServible}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-red-700 bg-red-50">{item.materialCaducado}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-emerald-700 bg-emerald-50">{item.totalEnBodega}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-orange-700 bg-orange-50">{item.materialPrestado}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-blue-700 bg-blue-50">{item.total}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 italic">{item.observacion || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openIncomeModal(item)}
                                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium"
                                title="Registrar Ingreso"
                              >
                                <i className="fas fa-arrow-down mr-1"></i>
                                Ingreso
                              </button>
                              <button
                                onClick={() => openOutcomeModal(item)}
                                className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-xs font-medium"
                                title="Registrar Egreso"
                              >
                                <i className="fas fa-arrow-up mr-1"></i>
                                Egreso
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className={buttonDanger}
                                title="Eliminar"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        {/* Bloque: Custodio Actual */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-user-shield text-white"></i>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Custodio Actual</h3>
          </div>
          
          {defaultCustodian ? (
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Nombre y Avatar */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-user text-blue-600 text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Nombre</p>
                    <p className="text-sm font-bold text-gray-900">{defaultCustodian.name}</p>
                  </div>
                </div>

                {/* Rol */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Rol</p>
                  <p className="text-sm text-gray-900 font-medium">Custodio de Bodega</p>
                </div>

                {/* Estado */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Estado</p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Activo
                  </span>
                </div>

                {/* Área */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Área</p>
                  <p className="text-sm text-gray-900">{defaultCustodian.area}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              <i className="fas fa-exclamation-circle text-xl mb-2"></i>
              <p className="text-xs">No hay custodio asignado</p>
            </div>
          )}
        </div>

        {/* Tabla de Material Prestado */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-box-open text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Detalle de Material Prestado</h3>
                <p className="text-xs text-orange-100">Registro de material en préstamo activo</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-bold">
              {loanRecords.length} {loanRecords.length === 1 ? 'Préstamo' : 'Préstamos'}
            </span>
          </div>

          {loanRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-orange-700 uppercase tracking-wider bg-orange-50">Cantidad</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Responsable</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unidad / Área</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha Egreso</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Custodio</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loanRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">{record.equipmentId.tipo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{record.equipmentId.description}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                          <i className="fas fa-box"></i>
                          {record.cantidad} {record.equipmentId.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        <div>
                          <p className="font-semibold">{record.responsibleName}</p>
                          {record.responsibleIdentification && (
                            <p className="text-xs text-gray-500 font-mono">CI: {record.responsibleIdentification}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.responsibleArea || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {new Date(record.loanDate).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-shield-alt text-blue-600"></i>
                          <span className="font-medium">{record.custodianId.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                          Mat. Prestado
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleReturn(record._id, record.responsibleName)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Registrar Devolución"
                        >
                          <i className="fas fa-undo mr-1"></i>
                          Devolver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-box-open text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-600 font-medium mb-1">No hay material prestado</p>
              <p className="text-sm text-gray-400">Todos los equipos están en bodega</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuevo Equipo */}
      {isNewEquipmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Nuevo Equipo</h2>
              <button onClick={() => {
                setIsNewEquipmentModalOpen(false);
                resetForm();
              }} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleCreateEquipment} className="p-6 space-y-5">
              {/* Clasificación */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Sistema ESIGEF</label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.esigeft}
                      onChange={(e) => setFormData({...formData, esigeft: e.target.checked})}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Pertenece al sistema ESIGEF</span>
                  </label>
                </div>
                <div>
                  <label className={labelClass}>Sistema ESBYE</label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.esbye}
                      onChange={(e) => setFormData({...formData, esbye: e.target.checked})}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Pertenece al sistema ESBYE</span>
                  </label>
                </div>
              </div>

              {/* Tipo y Descripción */}
              <div>
                <label className={labelClass}>Tipo de Equipo *</label>
                <input
                  type="text"
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className={inputClass}
                  placeholder="Ej: Equipo de Protección Balístico"
                />
              </div>

              <div>
                <label className={labelClass}>Descripción *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={inputClass}
                  placeholder="Ej: CASCO BALÍSTICO NIVEL III"
                />
              </div>

              {/* Unidad */}
              <div>
                <label className={labelClass}>Unidad de Medida *</label>
                <select
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value as UnitType})}
                  className={inputClass}
                >
                  <option value={UnitType.EA}>EA - Each (Unidad)</option>
                  <option value={UnitType.UN}>UN - Unidad</option>
                  <option value={UnitType.QT}>QT - Cuarto</option>
                  <option value={UnitType.RL}>RL - Rollo</option>
                  <option value={UnitType.PR}>PR - Par</option>
                  <option value={UnitType.GL}>GL - Galón</option>
                </select>
              </div>

              {/* Custodio */}
              <div>
                <label className={labelClass}>Custodio *</label>
                <select
                  required
                  value={formData.custodianId}
                  onChange={(e) => setFormData({...formData, custodianId: e.target.value})}
                  className={inputClass}
                >
                  <option value="">Seleccione custodio...</option>
                  {custodians.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.isDefault ? '(Por defecto)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cantidades */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Material Servible</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.materialServible}
                    onChange={(e) => setFormData({...formData, materialServible: parseInt(e.target.value) || 0})}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Material Caducado</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.materialCaducado}
                    onChange={(e) => setFormData({...formData, materialCaducado: parseInt(e.target.value) || 0})}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Material Prestado</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.materialPrestado}
                    onChange={(e) => setFormData({...formData, materialPrestado: parseInt(e.target.value) || 0})}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Observación */}
              <div>
                <label className={labelClass}>Observación</label>
                <textarea
                  value={formData.observacion}
                  onChange={(e) => setFormData({...formData, observacion: e.target.value})}
                  className={inputClass}
                  rows={3}
                  placeholder="Notas adicionales..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewEquipmentModalOpen(false);
                    resetForm();
                  }}
                  className={buttonSecondary}
                >
                  Cancelar
                </button>
                <button type="submit" className={buttonPrimary}>
                  <i className="fas fa-check mr-2"></i>
                  Crear Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ingreso */}
      {isIncomeModalOpen && selectedEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-arrow-down"></i>
                Registrar Ingreso
              </h2>
            </div>
            <form onSubmit={handleIncome} className="p-6 space-y-5">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Equipo Seleccionado</p>
                <p className="text-sm font-bold text-gray-900">{selectedEquipment.description}</p>
                <p className="text-xs text-gray-600 mt-1">{selectedEquipment.tipo}</p>
              </div>

              <div>
                <label className={labelClass}>Tipo de Material *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${incomeForm.tipo === 'servible' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="tipoMaterial"
                      value="servible"
                      checked={incomeForm.tipo === 'servible'}
                      onChange={(e) => setIncomeForm({...incomeForm, tipo: e.target.value as 'servible' | 'caducado'})}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm font-semibold text-gray-700">Servible</span>
                  </label>
                  <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${incomeForm.tipo === 'caducado' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="tipoMaterial"
                      value="caducado"
                      checked={incomeForm.tipo === 'caducado'}
                      onChange={(e) => setIncomeForm({...incomeForm, tipo: e.target.value as 'servible' | 'caducado'})}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm font-semibold text-gray-700">Caducado</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClass}>Cantidad *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={incomeForm.cantidad}
                  onChange={(e) => setIncomeForm({...incomeForm, cantidad: parseInt(e.target.value) || 0})}
                  className={inputClass}
                  placeholder="Ingrese la cantidad"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsIncomeModalOpen(false);
                    setSelectedEquipment(null);
                  }}
                  className={buttonSecondary}
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm text-sm">
                  <i className="fas fa-check mr-2"></i>
                  Registrar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Egreso */}
      {isOutcomeModalOpen && selectedEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-arrow-up"></i>
                Registrar Egreso
              </h2>
            </div>
            <form onSubmit={handleOutcome} className="p-6 space-y-5">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Equipo Seleccionado</p>
                <p className="text-sm font-bold text-gray-900">{selectedEquipment.description}</p>
                <p className="text-xs text-gray-600 mt-1">{selectedEquipment.tipo}</p>
                <div className="mt-2 flex gap-4 text-xs">
                  <span className="text-green-700 font-semibold">Disponible: {selectedEquipment.materialServible}</span>
                  <span className="text-orange-700 font-semibold">Prestado: {selectedEquipment.materialPrestado}</span>
                </div>
              </div>

              <div>
                <label className={labelClass}>Cantidad a Egresar *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedEquipment.materialServible}
                  value={outcomeForm.cantidad}
                  onChange={(e) => setOutcomeForm({...outcomeForm, cantidad: parseInt(e.target.value) || 0})}
                  className={inputClass}
                  placeholder="Ingrese la cantidad"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  Disponible en bodega: <span className="font-bold text-green-700">{selectedEquipment.materialServible}</span>
                </p>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Datos del Responsable</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={outcomeForm.responsibleName}
                      onChange={(e) => setOutcomeForm({...outcomeForm, responsibleName: e.target.value})}
                      className={inputClass}
                      placeholder="Ej: Sgto. Juan Pérez"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Cédula / Identificación</label>
                      <input
                        type="text"
                        value={outcomeForm.responsibleIdentification}
                        onChange={(e) => setOutcomeForm({...outcomeForm, responsibleIdentification: e.target.value})}
                        className={inputClass}
                        placeholder="0123456789"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Área / Unidad</label>
                      <input
                        type="text"
                        value={outcomeForm.responsibleArea}
                        onChange={(e) => setOutcomeForm({...outcomeForm, responsibleArea: e.target.value})}
                        className={inputClass}
                        placeholder="Ej: Ala 21"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Autorización</h3>
                
                <div>
                  <label className={labelClass}>Custodio que Autoriza *</label>
                  <select
                    required
                    value={outcomeForm.custodianId}
                    onChange={(e) => setOutcomeForm({...outcomeForm, custodianId: e.target.value})}
                    className={inputClass}
                  >
                    <option value="">Seleccione custodio...</option>
                    {custodians.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.isDefault ? '(Por defecto)' : ''}
                      </option>
                    ))}
                  </select>
                  {defaultCustodian && outcomeForm.custodianId === defaultCustodian.id && (
                    <p className="text-xs text-gray-500 mt-1">
                      <i className="fas fa-shield-alt mr-1"></i>
                      Custodio por defecto seleccionado
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Observación</label>
                <textarea
                  value={outcomeForm.observacion}
                  onChange={(e) => setOutcomeForm({...outcomeForm, observacion: e.target.value})}
                  className={inputClass}
                  rows={3}
                  placeholder="Motivo del egreso, notas adicionales..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsOutcomeModalOpen(false);
                    setSelectedEquipment(null);
                  }}
                  className={buttonSecondary}
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors shadow-sm text-sm">
                  <i className="fas fa-check mr-2"></i>
                  Registrar Egreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardExcel;
