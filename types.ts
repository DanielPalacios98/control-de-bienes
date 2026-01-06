
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_ADMIN = 'BRANCH_ADMIN'
}

export enum UnitType {
  UNIDAD = 'UN',
  CUARTO = 'QT',
  ROLLO = 'RL',
  PAR = 'PR',
  GALON = 'GL'
}

export enum LocationType {
  BODEGA = 'BODEGA',
  EN_USO = 'EN USO'
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  managerId: string;
  managerName: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  branchId?: string;
  name: string;
  status: 'active' | 'inactive';
}

export enum EquipmentCondition {
  SERVIBLE = 'Servible',
  CONDENADO = 'Condenado'
}

export enum EquipmentStatus {
  AVAILABLE = 'Disponible',
  IN_USE = 'En Uso',
  MAINTENANCE = 'Mantenimiento',
  RETIRED = 'Retirado'
}

export enum MovementType {
  IN = 'Ingreso',
  OUT = 'Egreso',
  ADJUSTMENT = 'Ajuste'
}

export interface Equipment {
  id: string; // ID de sistema
  inventoryId?: string; // ID único (Opcional si es por cantidad)
  hasIndividualId: boolean; // Define si se controla por serial o por stock acumulado
  description: string;
  unit: UnitType;
  condition: EquipmentCondition;
  status: EquipmentStatus;
  locationType: LocationType; // Ubicación actual: BODEGA o EN USO
  entryDate: string;
  currentResponsibleId: string;
  currentResponsibleName: string;
  branchId: string;
  stock: number; // 1 para individuales, N para artículos por cantidad
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
