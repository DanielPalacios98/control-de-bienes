import mongoose, { Schema, Document } from 'mongoose';

export enum MovementType {
    IN = 'Ingreso',
    OUT = 'Egreso',
    ADJUSTMENT = 'Ajuste'
}

export interface IMovement extends Document {
    id: string;
    equipmentId: string;
    type: MovementType;
    quantity: number;
    responsibleId: string;
    responsibleName: string;
    performedByUserId: string;
    branchId: string;
    timestamp: string;
    reason?: string;
}

const MovementSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    equipmentId: { type: String, required: true },
    type: { type: String, enum: Object.values(MovementType), required: true },
    quantity: { type: Number, required: true },
    responsibleId: { type: String, required: true },
    responsibleName: { type: String, required: true },
    performedByUserId: { type: String, required: true },
    branchId: { type: String, required: true },
    timestamp: { type: String, required: true },
    reason: { type: String }
}, { timestamps: true });

export default mongoose.model<IMovement>('Movement', MovementSchema);
