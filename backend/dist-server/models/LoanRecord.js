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
const mongoose_1 = __importStar(require("mongoose"));
const LoanRecordSchema = new mongoose_1.Schema({
    equipmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: [true, 'El equipo es requerido']
    },
    cantidad: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1']
    },
    responsibleName: {
        type: String,
        required: [true, 'El nombre del responsable es requerido'],
        trim: true
    },
    responsibleIdentification: {
        type: String,
        trim: true
    },
    responsibleArea: {
        type: String,
        trim: true
    },
    custodianId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Custodian',
        required: [true, 'El custodio es requerido']
    },
    performedById: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario que registra es requerido']
    },
    branchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'La sucursal es requerida']
    },
    loanDate: {
        type: Date,
        required: [true, 'La fecha de préstamo es requerida'],
        default: Date.now
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['prestado', 'devuelto'],
        default: 'prestado'
    },
    observacion: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'loan_records'
});
// Índices para búsquedas y reportes
LoanRecordSchema.index({ equipmentId: 1, status: 1 });
LoanRecordSchema.index({ custodianId: 1, loanDate: -1 });
LoanRecordSchema.index({ responsibleName: 1 });
LoanRecordSchema.index({ branchId: 1, loanDate: -1 });
exports.default = mongoose_1.default.model('LoanRecord', LoanRecordSchema);
