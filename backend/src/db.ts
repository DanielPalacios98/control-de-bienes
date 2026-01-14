import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn('MONGODB_URI no está definido. Arrancando sin conexión a base de datos.');
        return;
    }
    const maxAttempts = 3;
    let attempt = 1;
    while (attempt <= maxAttempts) {
        try {
            const conn = await mongoose.connect(uri);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error: any) {
            const delayMs = Math.min(30000, 2000 * Math.pow(2, attempt - 1));
            console.warn(`Fallo conexión a MongoDB (intento ${attempt}/${maxAttempts}): ${error.message}. Reintentando en ${delayMs}ms`);
            attempt += 1;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    console.error('No se pudo conectar a MongoDB tras varios intentos. Arrancando sin DB.');
};

export default connectDB;
