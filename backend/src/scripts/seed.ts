import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User';
import Branch from '../models/Branch';
import Equipment from '../models/Equipment';
import Movement from '../models/Movement';
import Custodian from '../models/Custodian';
import connectDB from '../db';

dotenv.config();

const seedDB = async () => {
    try {
        await connectDB();

        console.log('🌱 Iniciando seed de la base de datos...');

        // 1. Limpiar datos existentes
        await User.deleteMany({});
        await Branch.deleteMany({});
        await Equipment.deleteMany({});
        await Movement.deleteMany({});
        await Custodian.deleteMany({});
        console.log('✅ Datos anteriores eliminados');

        // 2. Crear única sucursal operativa primero
        const branch = await Branch.create({
            name: 'Bodega Equipo y Vestuario',
            location: 'Base Aérea Simón Bolívar',
            managerId: new mongoose.Types.ObjectId() // temporal
        });
        console.log(`✅ Sucursal creada: ${branch.name} (ID: ${branch._id})`);

        // 3. Crear Super Admin con branchId
        const admin = await User.create({
            name: 'Cbos. Rios Siulin',
            email: 'admin@fae.com',
            password: 'admin123',
            role: UserRole.SUPER_ADMIN,
            branchId: branch._id,
            status: 'active'
        });
        console.log(`✅ Super administradora creada: ${admin.name}`);

        // 4. Actualizar sucursal con el managerId correcto
        branch.managerId = admin._id;
        await branch.save();
        console.log(`✅ Sucursal actualizada con managerId correcto`);

        // 5. Crear custodio por defecto (Cbos. Rios Siulin)
        const custodian = await Custodian.create({
            name: 'Cbos. Rios Siulin',
            rank: 'Cabo Segundo',
            identification: '0123456789',
            area: 'Bodega de Equipo y Vestuario',
            isActive: true,
            isDefault: true
        });
        console.log(`✅ Custodio por defecto creado: ${custodian.name}`);

        // 6. NO crear equipos de ejemplo - El usuario los agregará manualmente
        console.log('📝 Base de datos inicializada sin equipos de ejemplo');
        console.log('📝 Puede comenzar a agregar equipos desde la interfaz');

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
