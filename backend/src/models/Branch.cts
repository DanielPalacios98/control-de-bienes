import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
    id: string;
    name: string;
    location: string;
    managerId: string;
    managerName: string;
}

const BranchSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    managerId: { type: String, required: true },
    managerName: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IBranch>('Branch', BranchSchema);
