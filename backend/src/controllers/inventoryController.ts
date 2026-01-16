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

// Get next available sequential ID for a prefix
export const getNextInventoryId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { prefix } = req.query;

        if (!prefix || typeof prefix !== 'string') {
            res.status(400).json({ message: 'El prefijo es requerido' });
            return;
        }

        // Buscar todos los equipos con este prefijo
        const equipment = await Equipment.find({
            inventoryId: { $regex: `^${prefix}-`, $options: 'i' },
            hasIndividualId: true
        }).select('inventoryId');

        // Extraer números de los IDs
        const numbers = equipment
            .map(item => {
                const parts = item.inventoryId?.split('-') || [];
                const lastPart = parts[parts.length - 1];
                return parseInt(lastPart) || 0;
            })
            .filter(num => !isNaN(num));

        // Obtener el siguiente número
        const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
        const nextNum = maxNum + 1;
        
        // Formatear con padding de 4 dígitos
        const nextId = `${prefix}-${String(nextNum).padStart(4, '0')}`;

        res.json({ 
            prefix,
            nextId,
            lastNumber: maxNum,
            nextNumber: nextNum
        });
    } catch (error) {
        console.error('Error getting next inventory ID:', error);
        res.status(500).json({ message: 'Error al obtener el siguiente ID' });
    }
};
