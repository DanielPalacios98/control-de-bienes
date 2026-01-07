import mongoose, { Schema, Document } from 'mongoose';

export enum MovementType {
    IN = 'Ingreso',
    OUT = 'Egreso',
    ADJUSTMENT = 'Ajuste'
}

export interface IMovement extends Document {
    equipmentId: mongoose.Types.ObjectId;
    type: MovementType;
    quantity: number;
    responsibleId: mongoose.Types.ObjectId;
    performedById: mongoose.Types.ObjectId;
    branchId: mongoose.Types.ObjectId;
    timestamp: Date;
    reason?: string;
    // Virtual fields
    equipment?: any;
    responsible?: any;
    performedBy?: any;
    branch?: any;
}

const MovementSchema: Schema = new Schema({
    equipmentId: {
        type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El responsable es requerido']
    },
    performedById: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario que realizó la acción es requerido']
    },
    branchId: {
        type: Schema.Types.ObjectId,
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

export default mongoose.model<IMovement>('Movement', MovementSchema);
