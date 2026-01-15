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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var MovementType;
(function (MovementType) {
    MovementType["IN"] = "Ingreso";
    MovementType["OUT"] = "Egreso";
    MovementType["ADJUSTMENT"] = "Ajuste";
})(MovementType || (exports.MovementType = MovementType = {}));
const MovementSchema = new mongoose_1.Schema({
    equipmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: [true, 'El equipo es requerido']
    },
    type: {
        type: String,
        enum: {
            values: Object.values(MovementType),
            message: 'Tipo de movimiento no válido'
        },
        required: [true, 'El tipo de movimiento es requerido']
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1']
    },
    responsibleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El responsable es requerido']
    },
    performedById: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario que realizó la acción es requerido']
    },
    branchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'La sucursal es requerida']
    },
    timestamp: {
        type: Date,
        required: [true, 'La fecha es requerida'],
        default: Date.now
    },
    reason: {
        type: String,
        trim: true,
        maxlength: [500, 'La razón no puede exceder 500 caracteres']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'movements'
});
// Virtuals para obtener datos relacionados
MovementSchema.virtual('equipment', {
    ref: 'Equipment',
    localField: 'equipmentId',
    foreignField: '_id',
    justOne: true
});
MovementSchema.virtual('responsible', {
    ref: 'User',
    localField: 'responsibleId',
    foreignField: '_id',
    justOne: true
});
MovementSchema.virtual('performedBy', {
    ref: 'User',
    localField: 'performedById',
    foreignField: '_id',
    justOne: true
});
MovementSchema.virtual('branch', {
    ref: 'Branch',
    localField: 'branchId',
    foreignField: '_id',
    justOne: true
});
// Índices para búsquedas rápidas
MovementSchema.index({ equipmentId: 1, timestamp: -1 });
MovementSchema.index({ branchId: 1, timestamp: -1 });
MovementSchema.index({ timestamp: -1 });
exports.default = mongoose_1.default.model('Movement', MovementSchema);
