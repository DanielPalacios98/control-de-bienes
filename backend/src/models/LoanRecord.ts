import mongoose, { Schema, Document } from 'mongoose';

/**
 * Registro de Material Prestado (Egreso)
 * Mantiene el historial y control de material fuera de bodega
 */
export interface ILoanRecord extends Document {
    equipmentId: mongoose.Types.ObjectId;
    cantidad: number;
    responsibleName: string;  // Nombre del responsable que recibe
    responsibleIdentification?: string;  // Cédula del responsable
    responsibleArea?: string;  // Área o unidad del responsable
    custodianId: mongoose.Types.ObjectId;  // Custodio que autoriza
    performedById: mongoose.Types.ObjectId;  // Usuario que registra
    branchId: mongoose.Types.ObjectId;
    loanDate: Date;
    returnDate?: Date;  // Fecha de devolución (si aplica)
    status: 'prestado' | 'devuelto';  // Estado del préstamo
    observacion?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LoanRecordSchema: Schema = new Schema({
    equipmentId: {
        type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
        ref: 'Custodian',
        required: [true, 'El custodio es requerido']
    },
    performedById: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario que registra es requerido']
    },
    branchId: {
        type: Schema.Types.ObjectId,
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

export default mongoose.model<ILoanRecord>('LoanRecord', LoanRecordSchema);
