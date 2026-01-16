import mongoose from 'mongoose';
import Equipment from '../models/Equipment';
import Movement from '../models/Movement';
import LoanRecord from '../models/LoanRecord';
import { MovementType } from '../models/Movement';

/**
 * Servicio para manejar ingresos y egresos del sistema de inventario Excel
 */

interface RegisterIncomeParams {
    equipmentId: string;
    cantidad: number;
    tipo: 'servible' | 'caducado';
    performedById: string;
    branchId: string;
    observacion?: string;
}

interface RegisterOutcomeParams {
    equipmentId: string;
    cantidad: number;
    responsibleName: string;
    responsibleIdentification?: string;
    responsibleArea?: string;
    custodianId: string;
    performedById: string;
    branchId: string;
    observacion?: string;
}

/**
 * Registra un ingreso de material
 */
export const processIncome = async (params: RegisterIncomeParams) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { equipmentId, cantidad, tipo, performedById, branchId, observacion } = params;

        const equipment = await Equipment.findById(equipmentId).session(session);
        if (!equipment) {
            throw new Error('Equipo no encontrado');
        }

        // Actualizar cantidades según el tipo
        if (tipo === 'caducado') {
            equipment.materialCaducado += cantidad;
        } else {
            equipment.materialServible += cantidad;
        }

        if (observacion) {
            equipment.observacion = observacion;
        }

        await equipment.save({ session });

        // Crear registro de movimiento
        await Movement.create([{
            equipmentId: equipmentId,
            type: MovementType.IN,
            quantity: cantidad,
            responsibleId: performedById,
            performedById: performedById,
            branchId: branchId,
            timestamp: new Date(),
            reason: `Ingreso de material ${tipo}`
        }], { session });

        await session.commitTransaction();

        return { success: true, message: 'Ingreso procesado correctamente', equipment };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Registra un egreso de material (dotación/préstamo)
 */
export const processOutcome = async (params: RegisterOutcomeParams) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { 
            equipmentId, 
            cantidad, 
            responsibleName,
            responsibleIdentification,
            responsibleArea,
            custodianId,
            performedById, 
            branchId, 
            observacion 
        } = params;

        const equipment = await Equipment.findById(equipmentId).session(session);
        if (!equipment) {
            throw new Error('Equipo no encontrado');
        }

        // Validar que haya suficiente material servible
        if (equipment.materialServible < cantidad) {
            throw new Error(`Stock insuficiente. Disponible: ${equipment.materialServible}, Solicitado: ${cantidad}`);
        }

        // Decrementar servible e incrementar prestado
        equipment.materialServible -= cantidad;
        equipment.materialPrestado += cantidad;

        await equipment.save({ session });

        // Crear registro de préstamo
        await LoanRecord.create([{
            equipmentId: equipmentId,
            cantidad: cantidad,
            responsibleName: responsibleName,
            responsibleIdentification: responsibleIdentification,
            responsibleArea: responsibleArea,
            custodianId: custodianId,
            performedById: performedById,
            branchId: branchId,
            loanDate: new Date(),
            status: 'prestado',
            observacion: observacion
        }], { session });

        // Crear registro de movimiento
        await Movement.create([{
            equipmentId: equipmentId,
            type: MovementType.OUT,
            quantity: cantidad,
            responsibleId: performedById,
            performedById: performedById,
            branchId: branchId,
            timestamp: new Date(),
            reason: `Egreso a: ${responsibleName}`
        }], { session });

        await session.commitTransaction();

        return { success: true, message: 'Egreso procesado correctamente', equipment };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
