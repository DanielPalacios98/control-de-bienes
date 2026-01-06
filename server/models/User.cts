import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    BRANCH_ADMIN = 'BRANCH_ADMIN'
}

export interface IUser extends Document {
    id: string; // Keeping the string ID for consistency with frontend
    email: string;
    role: UserRole;
    branchId?: string;
    name: string;
    status: 'active' | 'inactive';
}

const UserSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    branchId: { type: String },
    name: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
