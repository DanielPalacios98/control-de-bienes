import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from './models/User';
import Branch from './models/Branch';
import connectDB from './db';

dotenv.config();

const seedDB = async () => {
    try {
        await connectDB();

        console.log('🌱 Iniciando seed de la base de datos...');

        // 1. Limpiar datos existentes
        await User.deleteMany({});
        await Branch.deleteMany({});
        console.log('✅ Datos anteriores eliminados');

        // 2. Crear Super Admin
        const admin = await User.create({
            name: 'Cbos. Rios Siulin',
            email: 'admin@fae.com',
            password: 'admin123',
            role: UserRole.SUPER_ADMIN,
            status: 'active'
        });
        console.log(`✅ Super administradora creada: ${admin.name}`);

        // 3. Crear única sucursal operativa
        const branch = await Branch.create({
            name: 'Bodega Equipo y Vestuario',
            location: 'Base Aérea Simón Bolívar',
            managerId: admin._id
        });
        console.log(`✅ Sucursal creada: ${branch.name} (ID: ${branch._id})`);

        console.log('\n🎉 Seed completado exitosamente!');
        console.log('\n📋 Credenciales de acceso:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: admin123`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en seed:', error);
        process.exit(1);
    }
};

seedDB();
