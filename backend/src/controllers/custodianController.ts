import { Request, Response } from 'express';
import Custodian from '../models/Custodian';

// Get all custodians
export const getCustodians = async (req: Request, res: Response): Promise<void> => {
    try {
        const custodians = await Custodian.find({ isActive: true }).sort({ name: 1 });
        res.json(custodians);
    } catch (error) {
        console.error('Error getting custodians:', error);
        res.status(500).json({ message: 'Error al obtener custodios' });
    }
};

// Get default custodian
export const getDefaultCustodian = async (req: Request, res: Response): Promise<void> => {
    try {
        const custodian = await Custodian.findOne({ isDefault: true, isActive: true });
        if (!custodian) {
            res.status(404).json({ message: 'Custodio por defecto no encontrado' });
            return;
        }
        res.json(custodian);
    } catch (error) {
        console.error('Error getting default custodian:', error);
        res.status(500).json({ message: 'Error al obtener custodio por defecto' });
    }
};

// Create custodian
export const createCustodian = async (req: Request, res: Response): Promise<void> => {
    try {
        const custodian = await Custodian.create(req.body);
        res.status(201).json(custodian);
    } catch (error: any) {
        console.error('Error creating custodian:', error);
        res.status(400).json({
            message: error.message || 'Error al crear custodio',
            errors: error.errors
        });
    }
};
