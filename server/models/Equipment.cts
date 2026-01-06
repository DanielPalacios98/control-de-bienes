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
    id: string;
    inventoryId?: string;
    hasIndividualId: boolean;
    description: string;
    unit: UnitType;
    condition: EquipmentCondition;
    status: EquipmentStatus;
    locationType: LocationType;
    entryDate: string;
    currentResponsibleId: string;
    currentResponsibleName: string;
    branchId: string;
    stock: number;
}

const EquipmentSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    inventoryId: { type: String },
    hasIndividualId: { type: Boolean, required: true },
    description: { type: String, required: true },
    unit: { type: String, enum: Object.values(UnitType), required: true },
    condition: { type: String, enum: Object.values(EquipmentCondition), required: true },
    status: { type: String, enum: Object.values(EquipmentStatus), required: true },
    locationType: { type: String, enum: Object.values(LocationType), required: true },
    entryDate: { type: String, required: true },
    currentResponsibleId: { type: String, required: true },
    currentResponsibleName: { type: String, required: true },
    branchId: { type: String, required: true },
    stock: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);
