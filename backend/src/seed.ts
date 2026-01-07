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
            name: 'Daniel Palacios',
            email: 'admin@fae.com',
            password: 'admin123',
            role: UserRole.SUPER_ADMIN,
            status: 'active'
        });
        console.log(`✅ Admin creado: ${admin.email} / admin123`);

        // 3. Crear Sucursales (Branches)
        const branches = await Branch.create([
            {
                name: 'Armamento',
                location: 'Base Aérea Mariscal Sucre',
                managerId: admin._id
            },
            {
                name: 'Intendencia',
                location: 'Base Aérea Mariscal Sucre',
                managerId: admin._id
            },
            {
                name: 'Logística',
                location: 'Base Aérea Mariscal Sucre',
                managerId: admin._id
            }
        ]);
        console.log(`✅ ${branches.length} sucursales creadas`);
        branches.forEach(b => console.log(`   - ${b.name} (ID: ${b._id})`));

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
