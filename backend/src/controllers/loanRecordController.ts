import { Request, Response } from 'express';
import LoanRecord from '../models/LoanRecord';
import { processReturn } from '../services/returnService';

/**
 * Controlador para gestión de registros de material prestado
 */

/**
 * Obtener todos los registros de material prestado (activos)
 * Incluye populación de relaciones para mostrar datos completos
 */
export const getActiveLoanRecords = async (req: Request, res: Response) => {
    try {
        const loanRecords = await LoanRecord.find({ status: 'prestado' })
            .populate({
                path: 'equipmentId',
                select: 'description tipo unit'
            })
            .populate({
                path: 'custodianId',
                select: 'name rank identification area'
            })
            .populate({
                path: 'performedById',
                select: 'name email'
            })
            .populate({
                path: 'branchId',
                select: 'name code'
            })
            .sort({ loanDate: -1 }); // Más recientes primero

        res.json(loanRecords);
    } catch (error) {
        console.error('Error obteniendo registros de préstamos:', error);
        res.status(500).json({ 
            message: 'Error al obtener registros de material prestado',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

/**
 * Obtener todos los registros de préstamo (activos y devueltos)
 * Para reportes históricos
 */
export const getAllLoanRecords = async (req: Request, res: Response) => {
    try {
        const { status, equipmentId, custodianId } = req.query;

        // Construir filtros dinámicos
        const filters: any = {};
        
        if (status) {
            filters.status = status;
        }
        
        if (equipmentId) {
            filters.equipmentId = equipmentId;
        }
        
        if (custodianId) {
            filters.custodianId = custodianId;
        }

        const loanRecords = await LoanRecord.find(filters)
            .populate({
                path: 'equipmentId',
                select: 'description tipo unit'
            })
            .populate({
                path: 'custodianId',
                select: 'name rank identification area'
            })
            .populate({
                path: 'performedById',
                select: 'name email'
            })
            .populate({
                path: 'branchId',
                select: 'name code'
            })
            .sort({ loanDate: -1 });

        res.json(loanRecords);
    } catch (error) {
        console.error('Error obteniendo registros de préstamos:', error);
        res.status(500).json({ 
            message: 'Error al obtener registros de préstamos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

/**
 * Obtener registros de préstamo por equipo específico
 */
export const getLoanRecordsByEquipment = async (req: Request, res: Response) => {
    try {
        const { equipmentId } = req.params;

        const loanRecords = await LoanRecord.find({ equipmentId })
            .populate({
                path: 'custodianId',
                select: 'name rank identification area'
            })
            .populate({
                path: 'performedById',
                select: 'name email'
            })
            .sort({ loanDate: -1 });

        res.json(loanRecords);
    } catch (error) {
        console.error('Error obteniendo registros por equipo:', error);
        res.status(500).json({ 
            message: 'Error al obtener registros del equipo',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

/**
 * Registrar devolución de material prestado
 */
export const registerReturn = async (req: Request, res: Response) => {
    try {
        const { loanRecordId } = req.params;
        const { observacion } = req.body;
        const userId = (req as any).user.id;
        const branchId = (req as any).user.branchId;

        const result = await processReturn(loanRecordId, userId, branchId, observacion);

        res.json({
            message: 'Devolución registrada exitosamente',
            equipment: result.equipment,
            loanRecord: result.loanRecord
        });
    } catch (error) {
        console.error('Error registrando devolución:', error);
        res.status(500).json({ 
            message: error instanceof Error ? error.message : 'Error al registrar devolución'
        });
    }
};
