
import { Branch, Equipment, EquipmentStatus, EquipmentCondition, User, UserRole, Movement, MovementType, UnitType, LocationType } from '../types';

export const mockBranches: Branch[] = [
  { 
    id: 'armamento', 
    name: 'Armamento', 
    location: 'Sector A', 
    managerId: '0911223344',
    managerName: 'Cap. Carlos Rodríguez'
  },
  { 
    id: 'infanteria', 
    name: 'Bodega Infantería', 
    location: 'Sector B', 
    managerId: '0922334455',
    managerName: 'Tnt. María López'
  },
  { 
    id: 'armerillo', 
    name: 'Bodega Armerillo', 
    location: 'Sector C', 
    managerId: '0933445566',
    managerName: 'Sgto. Juan Pérez'
  },
];

export const initialUsers: User[] = [
  {
    id: 'u-super',
    name: 'Administrador General',
    email: 'super@invtrack.com',
    role: UserRole.SUPER_ADMIN,
    status: 'active'
  }
];

export const initialInventory: Equipment[] = [
  {
    id: 'sys-101',
    inventoryId: 'FAL-001',
    hasIndividualId: true,
    description: 'Fusil FAL 7.62mm',
    unit: UnitType.UNIDAD,
    condition: EquipmentCondition.SERVIBLE,
    status: EquipmentStatus.AVAILABLE,
    locationType: LocationType.BODEGA,
    entryDate: '2024-01-10',
    currentResponsibleId: '0911223344',
    currentResponsibleName: 'Cap. Carlos Rodríguez',
    branchId: 'armamento',
    stock: 1
  },
  {
    id: 'sys-102',
    hasIndividualId: false,
    description: 'Ponchos de Agua (Pixelado)',
    unit: UnitType.UNIDAD,
    condition: EquipmentCondition.SERVIBLE,
    status: EquipmentStatus.AVAILABLE,
    locationType: LocationType.BODEGA,
    entryDate: '2024-02-15',
    currentResponsibleId: '0922334455',
    currentResponsibleName: 'Tnt. María López',
    branchId: 'infanteria',
    stock: 150
  },
  {
    id: 'sys-103',
    hasIndividualId: false,
    description: 'Aceite de 3 tiempos',
    unit: UnitType.CUARTO,
    condition: EquipmentCondition.SERVIBLE,
    status: EquipmentStatus.AVAILABLE,
    locationType: LocationType.BODEGA,
    entryDate: '2024-03-01',
    currentResponsibleId: '0933445566',
    currentResponsibleName: 'Sgto. Juan Pérez',
    branchId: 'armerillo',
    stock: 24
  }
];

export const mockMovements: Movement[] = [];
