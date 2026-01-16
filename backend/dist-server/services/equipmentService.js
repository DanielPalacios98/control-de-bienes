"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOutcome = exports.processIncome = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Equipment_1 = __importDefault(require("../models/Equipment"));
const Movement_1 = __importDefault(require("../models/Movement"));
const LoanRecord_1 = __importDefault(require("../models/LoanRecord"));
const Movement_2 = require("../models/Movement");
/**
 * Registra un ingreso de material
 */
const processIncome = async (params) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { equipmentId, cantidad, tipo, performedById, branchId, observacion } = params;
        const equipment = await Equipment_1.default.findById(equipmentId).session(session);
        if (!equipment) {
            throw new Error('Equipo no encontrado');
        }
        // Actualizar cantidades según el tipo
        if (tipo === 'caducado') {
            equipment.materialCaducado += cantidad;
        }
        else {
            equipment.materialServible += cantidad;
        }
        if (observacion) {
            equipment.observacion = observacion;
        }
        await equipment.save({ session });
        // Crear registro de movimiento
        await Movement_1.default.create([{
                equipmentId: equipmentId,
                type: Movement_2.MovementType.IN,
                quantity: cantidad,
                responsibleId: performedById,
                performedById: performedById,
                branchId: branchId,
                timestamp: new Date(),
                reason: `Ingreso de material ${tipo}`
            }], { session });
        await session.commitTransaction();
        return { success: true, message: 'Ingreso procesado correctamente', equipment };
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.processIncome = processIncome;
/**
 * Registra un egreso de material (dotación/préstamo)
 */
const processOutcome = async (params) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { equipmentId, cantidad, responsibleName, responsibleIdentification, responsibleArea, custodianId, performedById, branchId, observacion } = params;
        const equipment = await Equipment_1.default.findById(equipmentId).session(session);
        if (!equipment) {
            throw new Error('Equipo no encontrado');
        }
        // Validar que haya suficiente material servible
        if (equipment.materialServible < cantidad) {
            throw new Error(`Stock insuficiente. Disponible: ${equipment.materialServible}, Solicitado: ${cantidad}`);
        }
        // Decrementar servible e incrementar prestado
        equipment.materialServible -= cantidad;
        equipment.materialPrestado += cantidad;
        await equipment.save({ session });
        // Crear registro de préstamo
        await LoanRecord_1.default.create([{
                equipmentId: equipmentId,
                cantidad: cantidad,
                responsibleName: responsibleName,
                responsibleIdentification: responsibleIdentification,
                responsibleArea: responsibleArea,
                custodianId: custodianId,
                performedById: performedById,
                branchId: branchId,
                loanDate: new Date(),
                status: 'prestado',
                observacion: observacion
            }], { session });
        // Crear registro de movimiento
        await Movement_1.default.create([{
                equipmentId: equipmentId,
                type: Movement_2.MovementType.OUT,
                quantity: cantidad,
                responsibleId: performedById,
                performedById: performedById,
                branchId: branchId,
                timestamp: new Date(),
                reason: `Egreso a: ${responsibleName}`
            }], { session });
        await session.commitTransaction();
        return { success: true, message: 'Egreso procesado correctamente', equipment };
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.processOutcome = processOutcome;
