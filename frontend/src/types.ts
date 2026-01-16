
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_ADMIN = 'BRANCH_ADMIN'
}

export enum UnitType {
  EA = 'EA',  // Each (Unidad)
  UN = 'UN',  // Unidad
  QT = 'QT',  // Cuarto
  RL = 'RL',  // Rollo
  PR = 'PR',  // Par
  GL = 'GL'   // Galón
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  managerId: string;
  managerName: string;
}

export interface Custodian {
  id: string;
  name: string;
  rank?: string;
  identification: string;
  area?: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  branchId?: string;
  name: string;
  status: 'active' | 'inactive';
}

/**
 * Modelo de Equipment alineado con Excel
 * Inventario de Existencias de la Bodega de Equipo y Vestuario
 */
export interface Equipment {
  id: string;
  
  // Clasificación
  esigeft: boolean;
  esbye: boolean;
  tipo: string;
  description: string;
  unit: UnitType;
  
  // Cantidades
  materialServible: number;
  materialCaducado: number;
  materialPrestado: number;
  
  // Calculados
  totalEnBodega: number;  // materialServible + materialCaducado
  total: number;          // totalEnBodega + materialPrestado
  
  // Metadata
  observacion?: string;
  custodianId?: string;
  branchId: string;
  entryDate: string;
}

export enum MovementType {
  IN = 'Ingreso',
  OUT = 'Egreso',
  ADJUSTMENT = 'Ajuste'
}

export interface Movement {
  id: string;
  equipmentId: string;
  type: MovementType;
  quantity: number;
  responsibleId: string;
  responsibleName: string;
  performedByUserId: string;
  branchId: string;
  timestamp: string;
  reason?: string;
}

export interface LoanRecord {
  _id: string;
  equipmentId: {
    _id: string;
    description: string;
    tipo: string;
    unit: UnitType;
  };
  cantidad: number;
  responsibleName: string;
  responsibleIdentification?: string;
  responsibleArea?: string;
  custodianId: {
    _id: string;
    name: string;
    rank?: string;
    identification: string;
    area?: string;
  };
  performedById: {
    _id: string;
    name: string;
    email: string;
  };
  branchId: {
    _id: string;
    name: string;
    code: string;
  };
  loanDate: string;
  returnDate?: string;
  status: 'prestado' | 'devuelto';
  observacion?: string;
  createdAt: string;
  updatedAt: string;
}
