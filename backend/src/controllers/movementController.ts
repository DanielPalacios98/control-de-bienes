import { Request, Response } from 'express';
import Movement from '../models/Movement';

// Get all movements (with optional filtering)
export const getMovements = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const user = req.user;

        const query = user.role === 'SUPER_ADMIN'
            ? {}
            : { branchId: user.branchId };

        const movements = await Movement.find(query)
            .populate('equipmentId', 'description tipo')
            .populate('responsibleId', 'name email')
            .populate('performedById', 'name email')
            .populate('branchId', 'name')
            .sort({ timestamp: -1 })
            .limit(100);

        res.json(movements);
    } catch (error) {
        console.error('Error getting movements:', error);
        res.status(500).json({ message: 'Error al obtener movimientos' });
    }
};

// Create new movement
export const createMovement = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const user = req.user;

        const movementData = {
            ...req.body,
            performedById: user._id,
            timestamp: new Date()
        };

        const movement = await Movement.create(movementData);

        // Populate before returning
        await movement.populate('equipmentId', 'description tipo');
        await movement.populate('responsibleId', 'name email');
        await movement.populate('performedById', 'name email');
        await movement.populate('branchId', 'name');

        res.status(201).json(movement);
    } catch (error: any) {
        console.error('Error creating movement:', error);
        res.status(400).json({
            message: error.message || 'Error al crear movimiento',
            errors: error.errors
        });
    }
};
