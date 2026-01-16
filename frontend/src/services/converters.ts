import { Equipment } from '../types';
import { EquipmentResponse } from './api';

export const convertToEquipment = (apiEquipment: EquipmentResponse): Equipment => {
    const branchId = apiEquipment.branchId
        ? (typeof apiEquipment.branchId === 'string'
            ? apiEquipment.branchId
            : apiEquipment.branchId._id)
        : '';

    return {
        id: apiEquipment._id,
        ord: apiEquipment.ord,
        esigeft: apiEquipment.esigeft,
        esbye: apiEquipment.esbye,
        tipo: apiEquipment.tipo,
        description: apiEquipment.description,
        unit: apiEquipment.unit as any,
        materialServible: apiEquipment.materialServible,
        materialCaducado: apiEquipment.materialCaducado,
        materialPrestado: apiEquipment.materialPrestado,
        totalEnBodega: apiEquipment.totalEnBodega,
        total: apiEquipment.total,
        observacion: apiEquipment.observacion,
        branchId: branchId,
        entryDate: apiEquipment.entryDate
    };
};

export const convertFromEquipment = (equipment: Partial<Equipment>): Partial<EquipmentResponse> => {
    return {
        esigeft: equipment.esigeft,
        esbye: equipment.esbye,
        tipo: equipment.tipo,
        description: equipment.description,
        unit: equipment.unit,
        materialServible: equipment.materialServible,
        materialCaducado: equipment.materialCaducado,
        materialPrestado: equipment.materialPrestado,
        observacion: equipment.observacion,
        branchId: equipment.branchId,
        entryDate: equipment.entryDate
    };
};
