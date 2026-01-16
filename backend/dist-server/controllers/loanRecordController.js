"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerReturn = exports.getLoanRecordsByEquipment = exports.getAllLoanRecords = exports.getActiveLoanRecords = void 0;
const LoanRecord_1 = __importDefault(require("../models/LoanRecord"));
const returnService_1 = require("../services/returnService");
/**
 * Controlador para gestión de registros de material prestado
 */
/**
 * Obtener todos los registros de material prestado (activos)
 * Incluye populación de relaciones para mostrar datos completos
 */
const getActiveLoanRecords = async (req, res) => {
    try {
        const loanRecords = await LoanRecord_1.default.find({ status: 'prestado' })
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
    }
    catch (error) {
        console.error('Error obteniendo registros de préstamos:', error);
        res.status(500).json({
            message: 'Error al obtener registros de material prestado',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getActiveLoanRecords = getActiveLoanRecords;
/**
 * Obtener todos los registros de préstamo (activos y devueltos)
 * Para reportes históricos
 */
const getAllLoanRecords = async (req, res) => {
    try {
        const { status, equipmentId, custodianId } = req.query;
        // Construir filtros dinámicos
        const filters = {};
        if (status) {
            filters.status = status;
        }
        if (equipmentId) {
            filters.equipmentId = equipmentId;
        }
        if (custodianId) {
            filters.custodianId = custodianId;
        }
        const loanRecords = await LoanRecord_1.default.find(filters)
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
    }
    catch (error) {
        console.error('Error obteniendo registros de préstamos:', error);
        res.status(500).json({
            message: 'Error al obtener registros de préstamos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getAllLoanRecords = getAllLoanRecords;
/**
 * Obtener registros de préstamo por equipo específico
 */
const getLoanRecordsByEquipment = async (req, res) => {
    try {
        const { equipmentId } = req.params;
        const loanRecords = await LoanRecord_1.default.find({ equipmentId })
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
    }
    catch (error) {
        console.error('Error obteniendo registros por equipo:', error);
        res.status(500).json({
            message: 'Error al obtener registros del equipo',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getLoanRecordsByEquipment = getLoanRecordsByEquipment;
/**
 * Registrar devolución de material prestado
 */
const registerReturn = async (req, res) => {
    try {
        const { loanRecordId } = req.params;
        const { observacion } = req.body;
        const userId = req.user.id;
        const branchId = req.user.branchId;
        const result = await (0, returnService_1.processReturn)(loanRecordId, userId, branchId, observacion);
        res.json({
            message: 'Devolución registrada exitosamente',
            equipment: result.equipment,
            loanRecord: result.loanRecord
        });
    }
    catch (error) {
        console.error('Error registrando devolución:', error);
        res.status(500).json({
            message: error instanceof Error ? error.message : 'Error al registrar devolución'
        });
    }
};
exports.registerReturn = registerReturn;
