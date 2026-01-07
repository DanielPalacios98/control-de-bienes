import mongoose from 'mongoose';
import Equipment from '../models/Equipment';
import Movement from '../models/Movement';
import { MovementType } from '../models/Movement';

interface ExitEquipmentParams {
    equipmentId: string;
    quantity: number;
    responsibleId: string;
    performedById: string;
    branchId: string;
    reason?: string;
}

/**
 * Procesa un egreso de equipo usando transacciones para garantizar consistencia
 */
export const processEquipmentExit = async (params: ExitEquipmentParams) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { equipmentId, quantity, responsibleId, performedById, branchId, reason } = params;

        // 1. Obtener el equipo
        const equipment = await Equipment.findById(equipmentId).session(session);
        if (!equipment) {
            throw new Error('Equipo no encontrado');
        }

        // 2. Validar stock
        if (equipment.stock < quantity) {
            throw new Error(`Stock insuficiente. Disponible: ${equipment.stock}, Solicitado: ${quantity}`);
        }

        // 3. Actualizar o eliminar equipo de bodega
        const newStock = equipment.stock - quantity;
        if (newStock > 0) {
            equipment.stock = newStock;
            await equipment.save({ session });
        } else {
            await Equipment.findByIdAndDelete(equipmentId).session(session);
        }

        // 4. Buscar o crear equipo "en uso"
        let inUseEquipment = await Equipment.findOne({
            description: equipment.description,
            currentResponsibleId: responsibleId,
            locationType: 'EN USO',
            hasIndividualId: false
        }).session(session);

        if (inUseEquipment) {
            // Actualizar existente
            inUseEquipment.stock += quantity;
            await inUseEquipment.save({ session });
        } else {
            // Crear nuevo
            const newEquipment = await Equipment.create([{
                hasIndividualId: false,
                description: equipment.description,
                unit: equipment.unit,
                condition: equipment.condition,
                status: 'En Uso',
                locationType: 'EN USO',
                entryDate: equipment.entryDate,
                currentResponsibleId: responsibleId,
                branchId: branchId,
                stock: quantity
            }], { session });
            inUseEquipment = newEquipment[0];
        }

        // 5. Crear registro de movimiento
        await Movement.create([{
            equipmentId: equipmentId,
            type: MovementType.OUT,
            quantity: quantity,
            responsibleId: responsibleId,
            performedById: performedById,
            branchId: branchId,
            timestamp: new Date(),
            reason: reason
        }], { session });

        // 6. Commit de la transacción
        await session.commitTransaction();

        return { success: true, message: 'Egreso procesado correctamente' };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
