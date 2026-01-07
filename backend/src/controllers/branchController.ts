import { Request, Response } from 'express';
import Branch from '../models/Branch';

// Get all branches
export const getBranches = async (req: Request, res: Response): Promise<void> => {
    try {
        const branches = await Branch.find()
            .populate('managerId', 'name email')
            .sort({ name: 1 });

        res.json(branches);
    } catch (error) {
        console.error('Error getting branches:', error);
        res.status(500).json({ message: 'Error al obtener las sucursales' });
    }
};

// Get single branch
export const getBranchById = async (req: Request, res: Response): Promise<void> => {
    try {
        const branch = await Branch.findById(req.params.id)
            .populate('managerId', 'name email');

        if (!branch) {
            res.status(404).json({ message: 'Sucursal no encontrada' });
            return;
        }

        res.json(branch);
    } catch (error) {
        console.error('Error getting branch:', error);
        res.status(500).json({ message: 'Error al obtener la sucursal' });
    }
};

// Create new branch
export const createBranch = async (req: Request, res: Response): Promise<void> => {
    try {
        const branch = await Branch.create(req.body);
        await branch.populate('managerId', 'name email');

        res.status(201).json(branch);
    } catch (error: any) {
        console.error('Error creating branch:', error);
        res.status(400).json({
            message: error.message || 'Error al crear la sucursal',
            errors: error.errors
        });
    }
};

// Update branch
export const updateBranch = async (req: Request, res: Response): Promise<void> => {
    try {
        const branch = await Branch.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('managerId', 'name email');

        if (!branch) {
            res.status(404).json({ message: 'Sucursal no encontrada' });
            return;
        }

        res.json(branch);
    } catch (error: any) {
        console.error('Error updating branch:', error);
        res.status(400).json({
            message: error.message || 'Error al actualizar la sucursal',
            errors: error.errors
        });
    }
};

// Delete branch
export const deleteBranch = async (req: Request, res: Response): Promise<void> => {
    try {
        const branch = await Branch.findByIdAndDelete(req.params.id);

        if (!branch) {
            res.status(404).json({ message: 'Sucursal no encontrada' });
            return;
        }

        res.json({ message: 'Sucursal eliminada correctamente' });
    } catch (error) {
        console.error('Error deleting branch:', error);
        res.status(500).json({ message: 'Error al eliminar la sucursal' });
    }
};
