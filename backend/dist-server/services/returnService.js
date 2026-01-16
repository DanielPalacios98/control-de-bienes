"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReturn = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Equipment_1 = __importDefault(require("../models/Equipment"));
const LoanRecord_1 = __importDefault(require("../models/LoanRecord"));
const Movement_1 = __importStar(require("../models/Movement"));
/**
 * Procesar devolución de material prestado
 * Actualiza LoanRecord a 'devuelto' e incrementa materialServible en Equipment
 */
const processReturn = async (loanRecordId, performedById, branchId, observacion) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // 1. Buscar el registro de préstamo
        const loanRecord = await LoanRecord_1.default.findById(loanRecordId).session(session);
        if (!loanRecord) {
            throw new Error('Registro de préstamo no encontrado');
        }
        if (loanRecord.status === 'devuelto') {
            throw new Error('Este material ya fue devuelto');
        }
        // 2. Buscar el equipo
        const equipment = await Equipment_1.default.findById(loanRecord.equipmentId).session(session);
        if (!equipment) {
            throw new Error('Equipo no encontrado');
        }
        // 3. Actualizar cantidades del equipo
        equipment.materialServible += loanRecord.cantidad;
        equipment.materialPrestado -= loanRecord.cantidad;
        if (equipment.materialPrestado < 0) {
            throw new Error('Error en cantidades: Material prestado no puede ser negativo');
        }
        await equipment.save({ session });
        // 4. Actualizar el LoanRecord
        loanRecord.status = 'devuelto';
        loanRecord.returnDate = new Date();
        if (observacion) {
            loanRecord.observacion = observacion;
        }
        await loanRecord.save({ session });
        // 5. Crear registro de movimiento (Ingreso por devolución)
        await Movement_1.default.create([{
                equipmentId: equipment._id,
                type: Movement_1.MovementType.IN,
                quantity: loanRecord.cantidad,
                responsibleId: loanRecord.performedById,
                responsibleName: loanRecord.responsibleName,
                performedByUserId: performedById,
                branchId: branchId,
                reason: `Devolución de ${loanRecord.responsibleName} - ${loanRecord.responsibleArea || 'Sin área especificada'}`
            }], { session });
        await session.commitTransaction();
        return {
            equipment: await Equipment_1.default.findById(equipment._id)
                .populate('branchId', 'name location')
                .populate('custodianId', 'name rank'),
            loanRecord: await LoanRecord_1.default.findById(loanRecord._id)
                .populate('equipmentId', 'description tipo unit')
                .populate('custodianId', 'name rank')
                .populate('performedById', 'name email')
        };
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.processReturn = processReturn;
