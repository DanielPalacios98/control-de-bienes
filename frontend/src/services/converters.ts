import { Equipment } from '../types';
import { EquipmentResponse } from './api';

export const convertToEquipment = (apiEquipment: EquipmentResponse): Equipment => {
    // Extract IDs and names from populated fields safely
    const currentResponsibleId = apiEquipment.currentResponsibleId
        ? (typeof apiEquipment.currentResponsibleId === 'string'
            ? apiEquipment.currentResponsibleId
            : apiEquipment.currentResponsibleId._id)
        : '';

    const currentResponsibleName = apiEquipment.currentResponsibleId
        ? (typeof apiEquipment.currentResponsibleId === 'string'
            ? 'Unknown'
            : apiEquipment.currentResponsibleId.name)
        : 'Unknown';

    const branchId = apiEquipment.branchId
        ? (typeof apiEquipment.branchId === 'string'
            ? apiEquipment.branchId
            : apiEquipment.branchId._id)
        : '';

    return {
        id: apiEquipment._id,
        inventoryId: apiEquipment.inventoryId,
        hasIndividualId: apiEquipment.hasIndividualId,
        description: apiEquipment.description,
        unit: apiEquipment.unit as any,
        condition: apiEquipment.condition as any,
        status: apiEquipment.status as any,
        locationType: apiEquipment.locationType as any,
        entryDate: apiEquipment.entryDate,
        currentResponsibleId: currentResponsibleId,
        currentResponsibleName: currentResponsibleName,
        branchId: branchId,
        stock: apiEquipment.stock
    };
};

export const convertFromEquipment = (equipment: Partial<Equipment>): Partial<EquipmentResponse> => {
    return {
        inventoryId: equipment.inventoryId,
        hasIndividualId: equipment.hasIndividualId,
        description: equipment.description,
        unit: equipment.unit,
        condition: equipment.condition,
        status: equipment.status,
        locationType: equipment.locationType,
        entryDate: equipment.entryDate,
        currentResponsibleId: equipment.currentResponsibleId,
        branchId: equipment.branchId,
        stock: equipment.stock
    };
};
