import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    BRANCH_ADMIN = 'BRANCH_ADMIN'
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // Optional because it might not be returned in queries
    role: UserRole;
    branchId?: string;
    status: 'active' | 'inactive';
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.BRANCH_ADMIN },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
    timestamps: true,
    collection: 'users'
});

// Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password!, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password!);
};

export default mongoose.model<IUser>('User', UserSchema);
