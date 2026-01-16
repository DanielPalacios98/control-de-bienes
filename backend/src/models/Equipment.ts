import mongoose, { Schema, Document } from 'mongoose';

/**
 * Modelo de Equipment alineado con la estructura de Excel
 * Inventario de Existencias de la Bodega de Equipo y Vestuario
 */

export enum UnitType {
    EA = 'EA',  // Each (Unidad)
    UN = 'UN',  // Unidad
    QT = 'QT',  // Cuarto
    RL = 'RL',  // Rollo
    PR = 'PR',  // Par
    GL = 'GL'   // Galón
}

export interface IEquipment extends Document {
    // Campos de clasificación
    esigeft: boolean;  // SI/NO - Sistema ESIGEF
    esbye: boolean;    // SI/NO - Sistema ESBYE
    tipo: string;      // Ej: "Equipo de Protección Balístico", "Equipo Antimotines y Disturbios"
    description: string;
    unit: UnitType;
    
    // Cantidades editables
    materialServible: number;      // Material en buen estado
    materialCaducado: number;      // Material caducado o en mal estado
    materialPrestado: number;      // Material prestado/dotación
    
    // Campos calculados (virtuales)
    totalEnBodega?: number;  // = materialServible + materialCaducado
    total?: number;          // = totalEnBodega + materialPrestado
    
    // Metadata
    observacion?: string;
    custodianId: mongoose.Types.ObjectId;  // Custodio responsable del inventario
    branchId: mongoose.Types.ObjectId;
    entryDate: Date;
    
    // Virtual fields
    branch?: any;
    custodian?: any;
}

const EquipmentSchema: Schema = new Schema({
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
        type: Schema.Types.ObjectId,
        ref: 'Custodian',
        required: [true, 'El custodio es requerido']
    },
    branchId: {
        type: Schema.Types.ObjectId,
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
EquipmentSchema.virtual('totalEnBodega').get(function(this: IEquipment) {
    return this.materialServible + this.materialCaducado;
});

// Virtual: TOTAL = totalEnBodega + materialPrestado
EquipmentSchema.virtual('total').get(function(this: IEquipment) {
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

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);
