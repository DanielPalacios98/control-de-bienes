import { Request, Response } from 'express';
import Equipment from '../models/Equipment';
import { processOutcome } from '../services/equipmentService';

/**
 * Controlador de Inventario - Sistema de Excel Bodega de Equipo y Vestuario
 */

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
            .sort({ tipo: 1, ord: 1 }); // Ordenar por TIPO y luego por ORD

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

        // Validar que las cantidades sean no-negativas
        const { materialServible = 0, materialCaducado = 0, materialPrestado = 0 } = req.body;
        
        if (materialServible < 0 || materialCaducado < 0 || materialPrestado < 0) {
            res.status(400).json({ message: 'Las cantidades no pueden ser negativas' });
            return;
        }

        const equipmentData = {
            ...req.body,
            branchId: user.role === 'SUPER_ADMIN' ? req.body.branchId : user.branchId,
            materialServible,
            materialCaducado,
            materialPrestado
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
        // Validar que las cantidades sean no-negativas si se están actualizando
        const { materialServible, materialCaducado, materialPrestado } = req.body;
        
        if ((materialServible !== undefined && materialServible < 0) ||
            (materialCaducado !== undefined && materialCaducado < 0) ||
            (materialPrestado !== undefined && materialPrestado < 0)) {
            res.status(400).json({ message: 'Las cantidades no pueden ser negativas' });
            return;
        }

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

/**
 * Registrar un ingreso de material
 * Incrementa materialServible o materialCaducado según corresponda
 */
export const registerIncome = async (req: Request, res: Response): Promise<void> => {
    try {
        const { equipmentId, cantidad, tipo } = req.body; // tipo: 'servible' o 'caducado'

        if (!equipmentId || !cantidad || cantidad <= 0) {
            res.status(400).json({ message: 'Datos inválidos para el ingreso' });
            return;
        }

        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            res.status(404).json({ message: 'Equipo no encontrado' });
            return;
        }

        // Actualizar según el tipo
        if (tipo === 'caducado') {
            equipment.materialCaducado += cantidad;
        } else {
            equipment.materialServible += cantidad;
        }

        await equipment.save();
        await equipment.populate('branchId', 'name location');

        res.json({
            message: 'Ingreso registrado correctamente',
            equipment
        });
    } catch (error) {
        console.error('Error registering income:', error);
        res.status(500).json({ message: 'Error al registrar el ingreso' });
    }
};

/**
 * Registrar un egreso de material
 * Decrementa materialServible y incrementa materialPrestado
 */
export const registerOutcome = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const user = req.user;
        const { 
            equipmentId, 
            cantidad, 
            responsibleName,
            responsibleIdentification,
            responsibleArea,
            custodianId,
            observacion 
        } = req.body;

        // Validaciones
        if (!equipmentId || !cantidad || cantidad <= 0) {
            res.status(400).json({ message: 'Equipo y cantidad son requeridos' });
            return;
        }

        if (!responsibleName) {
            res.status(400).json({ message: 'El nombre del responsable es requerido' });
            return;
        }

        if (!custodianId) {
            res.status(400).json({ message: 'El custodio es requerido' });
            return;
        }

        const result = await processOutcome({
            equipmentId,
            cantidad,
            responsibleName,
            responsibleIdentification,
            responsibleArea,
            custodianId,
            performedById: user._id,
            branchId: user.branchId,
            observacion
        });

        const equipment = await Equipment.findById(equipmentId)
            .populate('branchId', 'name location')
            .populate('custodianId', 'name rank');

        res.json({
            message: result.message,
            equipment
        });
    } catch (error: any) {
        console.error('Error registering outcome:', error);
        res.status(400).json({ 
            message: error.message || 'Error al registrar el egreso'
        });
    }
};
