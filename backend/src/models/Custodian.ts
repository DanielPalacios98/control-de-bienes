import mongoose, { Schema, Document } from 'mongoose';

/**
 * Modelo de Custodio - Persona responsable del inventario en bodega
 */
export interface ICustodian extends Document {
    name: string;
    rank?: string;  // Rango militar
    identification: string;  // Cédula o identificación
    area?: string;  // Área o dependencia
    isActive: boolean;
    isDefault: boolean;  // Si es el custodio por defecto
    createdAt: Date;
    updatedAt: Date;
}

const CustodianSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del custodio es requerido'],
        trim: true
    },
    rank: {
        type: String,
        trim: true
    },
    identification: {
        type: String,
        required: [true, 'La identificación es requerida'],
        unique: true,
        trim: true
    },
    area: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    collection: 'custodians'
});

CustodianSchema.index({ isDefault: 1 });

export default mongoose.model<ICustodian>('Custodian', CustodianSchema);
