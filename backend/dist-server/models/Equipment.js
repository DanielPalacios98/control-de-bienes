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
exports.UnitType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Modelo de Equipment alineado con la estructura de Excel
 * Inventario de Existencias de la Bodega de Equipo y Vestuario
 */
var UnitType;
(function (UnitType) {
    UnitType["EA"] = "EA";
    UnitType["UN"] = "UN";
    UnitType["QT"] = "QT";
    UnitType["RL"] = "RL";
    UnitType["PR"] = "PR";
    UnitType["GL"] = "GL"; // Galón
})(UnitType || (exports.UnitType = UnitType = {}));
const EquipmentSchema = new mongoose_1.Schema({
    esigeft: {
        type: Boolean,
        required: true,
        default: false
    },
    esbye: {
        type: Boolean,
        required: true,
        default: false
    },
    tipo: {
        type: String,
        required: [true, 'El tipo de equipo es requerido'],
        trim: true,
        // Ejemplos: "Equipo de Protección Balístico", "Equipo Antimotines y Disturbios"
    },
    description: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true,
        minlength: [3, 'La descripción debe tener al menos 3 caracteres']
    },
    unit: {
        type: String,
        enum: {
            values: Object.values(UnitType),
            message: 'Unidad no válida'
        },
        required: [true, 'La unidad es requerida'],
        default: 'EA'
    },
    materialServible: {
        type: Number,
        required: [true, 'Material servible es requerido'],
        min: [0, 'Material servible no puede ser negativo'],
        default: 0
    },
    materialCaducado: {
        type: Number,
        required: [true, 'Material caducado es requerido'],
        min: [0, 'Material caducado no puede ser negativo'],
        default: 0
    },
    materialPrestado: {
        type: Number,
        required: [true, 'Material prestado es requerido'],
        min: [0, 'Material prestado no puede ser negativo'],
        default: 0
    },
    observacion: {
        type: String,
        trim: true,
        default: ''
    },
    custodianId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Custodian',
        required: [true, 'El custodio es requerido']
    },
    branchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'La sucursal es requerida']
    },
    entryDate: {
        type: Date,
        required: [true, 'La fecha de ingreso es requerida'],
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'equipment'
});
// Virtual: TOTAL EN BODEGA = materialServible + materialCaducado
EquipmentSchema.virtual('totalEnBodega').get(function () {
    return this.materialServible + this.materialCaducado;
});
// Virtual: TOTAL = totalEnBodega + materialPrestado
EquipmentSchema.virtual('total').get(function () {
    const totalBodega = this.materialServible + this.materialCaducado;
    return totalBodega + this.materialPrestado;
});
// Virtual para obtener datos de la sucursal
EquipmentSchema.virtual('branch', {
    ref: 'Branch',
    localField: 'branchId',
    foreignField: '_id',
    justOne: true
});
// Virtual para obtener datos del custodio
EquipmentSchema.virtual('custodian', {
    ref: 'Custodian',
    localField: 'custodianId',
    foreignField: '_id',
    justOne: true
});
// Índices para búsquedas rápidas
EquipmentSchema.index({ branchId: 1, tipo: 1 });
EquipmentSchema.index({ description: 'text' });
exports.default = mongoose_1.default.model('Equipment', EquipmentSchema);
