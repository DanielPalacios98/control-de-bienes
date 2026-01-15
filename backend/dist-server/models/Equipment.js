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
exports.EquipmentStatus = exports.EquipmentCondition = exports.LocationType = exports.UnitType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var UnitType;
(function (UnitType) {
    UnitType["UNIDAD"] = "UN";
    UnitType["CUARTO"] = "QT";
    UnitType["ROLLO"] = "RL";
    UnitType["PAR"] = "PR";
    UnitType["GALON"] = "GL";
})(UnitType || (exports.UnitType = UnitType = {}));
var LocationType;
(function (LocationType) {
    LocationType["BODEGA"] = "BODEGA";
    LocationType["EN_USO"] = "EN USO";
})(LocationType || (exports.LocationType = LocationType = {}));
var EquipmentCondition;
(function (EquipmentCondition) {
    EquipmentCondition["SERVIBLE"] = "Servible";
    EquipmentCondition["CONDENADO"] = "Condenado";
})(EquipmentCondition || (exports.EquipmentCondition = EquipmentCondition = {}));
var EquipmentStatus;
(function (EquipmentStatus) {
    EquipmentStatus["AVAILABLE"] = "Disponible";
    EquipmentStatus["IN_USE"] = "En Uso";
    EquipmentStatus["MAINTENANCE"] = "Mantenimiento";
    EquipmentStatus["RETIRED"] = "Retirado";
})(EquipmentStatus || (exports.EquipmentStatus = EquipmentStatus = {}));
const EquipmentSchema = new mongoose_1.Schema({
    inventoryId: {
        type: String,
        trim: true
    },
    hasIndividualId: {
        type: Boolean,
        required: [true, 'Debe especificar si tiene ID individual']
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
        required: [true, 'La unidad es requerida']
    },
    condition: {
        type: String,
        enum: {
            values: Object.values(EquipmentCondition),
            message: 'Condición no válida'
        },
        required: [true, 'La condición es requerida']
    },
    status: {
        type: String,
        enum: {
            values: Object.values(EquipmentStatus),
            message: 'Estado no válido'
        },
        required: [true, 'El estado es requerido']
    },
    locationType: {
        type: String,
        enum: {
            values: Object.values(LocationType),
            message: 'Tipo de ubicación no válida'
        },
        required: [true, 'El tipo de ubicación es requerido']
    },
    entryDate: {
        type: Date,
        required: [true, 'La fecha de ingreso es requerida'],
        default: Date.now
    },
    currentResponsibleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El responsable es requerido']
    },
    branchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'La sucursal es requerida']
    },
    stock: {
        type: Number,
        required: [true, 'El stock es requerido'],
        min: [0, 'El stock no puede ser negativo'],
        default: 1
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'equipment'
});
// Validación personalizada: inventoryId requerido para items individuales
EquipmentSchema.pre('save', function (next) {
    if (this.hasIndividualId && !this.inventoryId) {
        return next(new Error('El ID de inventario es requerido para items individuales'));
    }
    next();
});
// Virtual para obtener datos del responsable
EquipmentSchema.virtual('currentResponsible', {
    ref: 'User',
    localField: 'currentResponsibleId',
    foreignField: '_id',
    justOne: true
});
// Virtual para obtener datos de la sucursal
EquipmentSchema.virtual('branch', {
    ref: 'Branch',
    localField: 'branchId',
    foreignField: '_id',
    justOne: true
});
// Índices para búsquedas rápidas
EquipmentSchema.index({ branchId: 1, status: 1 });
EquipmentSchema.index({ description: 'text' });
EquipmentSchema.index({ inventoryId: 1 });
exports.default = mongoose_1.default.model('Equipment', EquipmentSchema);
