import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
    name: string;
    location: string;
    managerId: mongoose.Types.ObjectId;
    managerName?: string; // Virtual field
}

const BranchSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la sucursal es requerido'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'La ubicación es requerida'],
        trim: true
    },
    managerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El gerente es requerido']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'branches'
});

// Virtual para obtener el nombre del gerente
BranchSchema.virtual('managerName', {
    ref: 'User',
    localField: 'managerId',
    foreignField: '_id',
    justOne: true
});

// Índice para búsquedas rápidas
BranchSchema.index({ name: 1 });

export default mongoose.model<IBranch>('Branch', BranchSchema);
