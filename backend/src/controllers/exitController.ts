import { Request, Response } from 'express';
import { processEquipmentExit } from '../services/equipmentService';

export const exitEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const user = req.user;

        const { equipmentId, quantity, responsibleId, reason } = req.body;

        if (!user.branchId) {
            res.status(400).json({
                message: 'El usuario no tiene una sucursal asignada'
            });
            return;
        }

        const result = await processEquipmentExit({
            equipmentId,
            quantity,
            responsibleId,
            performedById: user._id.toString(),
            branchId: user.branchId.toString(),
            reason
        });

        res.json(result);
    } catch (error: any) {
        console.error('Error processing exit:', error);
        res.status(400).json({
            message: error.message || 'Error al procesar el egreso'
        });
    }
};
