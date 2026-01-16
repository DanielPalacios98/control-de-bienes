import mongoose from 'mongoose';
import Equipment from '../models/Equipment';
import LoanRecord from '../models/LoanRecord';
import Movement, { MovementType } from '../models/Movement';

/**
 * Procesar devolución de material prestado
 * Actualiza LoanRecord a 'devuelto' e incrementa materialServible en Equipment
 */
export const processReturn = async (
    loanRecordId: string,
    performedById: string,
    branchId: string,
    observacion?: string
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Buscar el registro de préstamo
        const loanRecord = await LoanRecord.findById(loanRecordId).session(session);
        
        if (!loanRecord) {
            throw new Error('Registro de préstamo no encontrado');
        }

        if (loanRecord.status === 'devuelto') {
            throw new Error('Este material ya fue devuelto');
        }

        // 2. Buscar el equipo
        const equipment = await Equipment.findById(loanRecord.equipmentId).session(session);
        
        if (!equipment) {
            throw new Error('Equipo no encontrado');
        }

        // 3. Actualizar cantidades del equipo
        equipment.materialServible += loanRecord.cantidad;
        equipment.materialPrestado -= loanRecord.cantidad;

        if (equipment.materialPrestado < 0) {
            throw new Error('Error en cantidades: Material prestado no puede ser negativo');
        }

        await equipment.save({ session });

        // 4. Actualizar el LoanRecord
        loanRecord.status = 'devuelto';
        loanRecord.returnDate = new Date();
        if (observacion) {
            loanRecord.observacion = observacion;
        }
        await loanRecord.save({ session });

        // 5. Crear registro de movimiento (Ingreso por devolución)
        await Movement.create([{
            equipmentId: equipment._id,
            type: MovementType.IN,
            quantity: loanRecord.cantidad,
            responsibleId: loanRecord.custodianId,  // ✅ El custodio es el responsable
            performedById: performedById,  // ✅ Campo correcto
            branchId: branchId,
            reason: `Devolución de ${loanRecord.responsibleName} - ${loanRecord.responsibleArea || 'Sin área especificada'}`
        }], { session });

        await session.commitTransaction();

        return {
            equipment: await Equipment.findById(equipment._id)
                .populate('branchId', 'name location')
                .populate('custodianId', 'name rank'),
            loanRecord: await LoanRecord.findById(loanRecord._id)
                .populate('equipmentId', 'description tipo unit')
                .populate('custodianId', 'name rank')
                .populate('performedById', 'name email')
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};