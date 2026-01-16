"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importStar(require("./models/User"));
const Branch_1 = __importDefault(require("./models/Branch"));
const Equipment_1 = __importDefault(require("./models/Equipment"));
const Movement_1 = __importDefault(require("./models/Movement"));
const Custodian_1 = __importDefault(require("./models/Custodian"));
const db_1 = __importDefault(require("./db"));
dotenv_1.default.config();
const seedDB = async () => {
    try {
        await (0, db_1.default)();
        console.log('🌱 Iniciando seed de la base de datos...');
        // 1. Limpiar datos existentes
        await User_1.default.deleteMany({});
        await Branch_1.default.deleteMany({});
        await Equipment_1.default.deleteMany({});
        await Movement_1.default.deleteMany({});
        await Custodian_1.default.deleteMany({});
        console.log('✅ Datos anteriores eliminados');
        // 2. Crear única sucursal operativa primero
        const branch = await Branch_1.default.create({
            name: 'Bodega Equipo y Vestuario',
            location: 'Base Aérea Simón Bolívar',
            managerId: new mongoose_1.default.Types.ObjectId() // temporal
        });
        console.log(`✅ Sucursal creada: ${branch.name} (ID: ${branch._id})`);
        // 3. Crear Super Admin con branchId
        const admin = await User_1.default.create({
            name: 'Cbos. Rios Siulin',
            email: 'admin@fae.com',
            password: 'admin123',
            role: User_1.UserRole.SUPER_ADMIN,
            branchId: branch._id,
            status: 'active'
        });
        console.log(`✅ Super administradora creada: ${admin.name}`);
        // 4. Actualizar sucursal con el managerId correcto
        branch.managerId = admin._id;
        await branch.save();
        console.log(`✅ Sucursal actualizada con managerId correcto`);
        // 5. Crear custodio por defecto (Cbos. Rios Siulin)
        const custodian = await Custodian_1.default.create({
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
    }
    catch (error) {
        console.error('❌ Error en seed:', error);
        process.exit(1);
    }
};
seedDB();
