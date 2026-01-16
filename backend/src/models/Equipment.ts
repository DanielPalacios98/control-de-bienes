import mongoose, { Schema, Document } from 'mongoose';

export enum UnitType {
    UNIDAD = 'UN',
    CUARTO = 'QT',
    ROLLO = 'RL',
    PAR = 'PR',
    GALON = 'GL'
}

export enum LocationType {
    BODEGA = 'BODEGA',
    EN_USO = 'EN USO'
}

export enum EquipmentCondition {
    SERVIBLE = 'Servible',
    CONDENADO = 'Condenado'
}

export enum EquipmentStatus {
    AVAILABLE = 'Disponible',
    IN_USE = 'En Uso',
    MAINTENANCE = 'Mantenimiento',
    RETIRED = 'Retirado'
}

export interface IEquipment extends Document {
    inventoryId?: string;
    hasIndividualId: boolean;
    description: string;
    unit: UnitType;
    condition: EquipmentCondition;
    status: EquipmentStatus;
    locationType: LocationType;
    entryDate: Date;
    currentResponsibleId: string; // Ahora es string (número de cédula)
    branchId: mongoose.Types.ObjectId;
    stock: number;
    // Virtual fields
    currentResponsible?: any;
    branch?: any;
}

const EquipmentSchema: Schema = new Schema({
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
        type: String,
        required: [true, 'El responsable es requerido'],
        trim: true
    },
    branchId: {
        type: Schema.Types.ObjectId,
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
EquipmentSchema.pre('save', async function (next) {
    if (this.hasIndividualId && !this.inventoryId) {
        return next(new Error('El ID de inventario es requerido para items individuales'));
    }
    
    // Validar que el inventoryId sea único para items individuales
    if (this.hasIndividualId && this.inventoryId && this.isNew) {
        const existingItem = await mongoose.model('Equipment').findOne({ 
            inventoryId: this.inventoryId,
            hasIndividualId: true 
        });
        if (existingItem) {
            return next(new Error(`El ID de inventario "${this.inventoryId}" ya existe`));
        }
    }
    
    next();
});

// Nota: currentResponsible virtual eliminado porque currentResponsibleId ahora es un string (cédula)

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

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);
