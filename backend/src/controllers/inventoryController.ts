import { Request, Response } from 'express';
import Equipment from '../models/Equipment';

// Get all equipment for a user's branch
export const getEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const user = req.user;

        const query = user.role === 'SUPER_ADMIN'
            ? {}
            : { branchId: user.branchId };

        const equipment = await Equipment.find(query)
            .populate('currentResponsibleId', 'name email')
            .populate('branchId', 'name location')
            .sort({ createdAt: -1 });

        res.json(equipment);
    } catch (error) {
        console.error('Error getting equipment:', error);
        res.status(500).json({ message: 'Error al obtener el inventario' });
    }
};

// Get single equipment item
export const getEquipmentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const equipment = await Equipment.findById(req.params.id)
            .populate('currentResponsibleId', 'name email')
            .populate('branchId', 'name location');

        if (!equipment) {
            res.status(404).json({ message: 'Equipo no encontrado' });
            return;
        }

        res.json(equipment);
    } catch (error) {
        console.error('Error getting equipment:', error);
        res.status(500).json({ message: 'Error al obtener el equipo' });
    }
};

// Create new equipment
export const createEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const user = req.user;

        const equipmentData = {
            ...req.body,
            branchId: user.role === 'SUPER_ADMIN' ? req.body.branchId : user.branchId,
            currentResponsibleId: req.body.currentResponsibleId || user._id
        };

        const equipment = await Equipment.create(equipmentData);

        // Populate before returning
        await equipment.populate('currentResponsibleId', 'name email');
        await equipment.populate('branchId', 'name location');

        res.status(201).json(equipment);
    } catch (error: any) {
        console.error('Error creating equipment:', error);
        res.status(400).json({
            message: error.message || 'Error al crear el equipo',
            errors: error.errors
        });
    }
};

// Update equipment
export const updateEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
        const equipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('currentResponsibleId', 'name email')
            .populate('branchId', 'name location');

        if (!equipment) {
            res.status(404).json({ message: 'Equipo no encontrado' });
            return;
        }

        res.json(equipment);
    } catch (error: any) {
        console.error('Error updating equipment:', error);
        res.status(400).json({
            message: error.message || 'Error al actualizar el equipo',
            errors: error.errors
        });
    }
};

// Delete equipment
export const deleteEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
        const equipment = await Equipment.findByIdAndDelete(req.params.id);

        if (!equipment) {
            res.status(404).json({ message: 'Equipo no encontrado' });
            return;
        }

        res.json({ message: 'Equipo eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ message: 'Error al eliminar el equipo' });
    }
};
