"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Equipment_1 = __importDefault(require("./models/Equipment"));
const LoanRecord_1 = __importDefault(require("./models/LoanRecord"));
const Movement_1 = __importDefault(require("./models/Movement"));
// Cargar variables de entorno
dotenv_1.default.config();
/**
 * Script de limpieza: Elimina SOLO datos de inventario y préstamos
 * Mantiene: Usuarios, Custodios, Branches
 * Elimina: Equipment, LoanRecords, Movements
 */
async function cleanInventoryData() {
    try {
        // Conectar a MongoDB
        const mongoUri = process.env.MONGODB_URI || '';
        if (!mongoUri) {
            throw new Error('MONGODB_URI no está definida en .env');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Conectado a MongoDB');
        // Contar registros antes de eliminar
        const equipmentCount = await Equipment_1.default.countDocuments();
        const loanRecordCount = await LoanRecord_1.default.countDocuments();
        const movementCount = await Movement_1.default.countDocuments();
        console.log('\n📊 Registros actuales:');
        console.log(`   - Equipos: ${equipmentCount}`);
        console.log(`   - Préstamos: ${loanRecordCount}`);
        console.log(`   - Movimientos: ${movementCount}`);
        if (equipmentCount === 0 && loanRecordCount === 0 && movementCount === 0) {
            console.log('\n✅ La base de datos ya está limpia. No hay datos de inventario.');
            await mongoose_1.default.connection.close();
            return;
        }
        // Confirmación
        console.log('\n⚠️  Se eliminarán todos los registros de inventario.');
        console.log('⚠️  Los usuarios, custodios y branches NO se eliminarán.');
        // Eliminar datos
        console.log('\n🗑️  Eliminando datos...');
        const deleteResults = await Promise.all([
            Equipment_1.default.deleteMany({}),
            LoanRecord_1.default.deleteMany({}),
            Movement_1.default.deleteMany({})
        ]);
        console.log('\n✅ Limpieza completada:');
        console.log(`   - Equipos eliminados: ${deleteResults[0].deletedCount}`);
        console.log(`   - Préstamos eliminados: ${deleteResults[1].deletedCount}`);
        console.log(`   - Movimientos eliminados: ${deleteResults[2].deletedCount}`);
        // Verificar limpieza
        const remainingEquipment = await Equipment_1.default.countDocuments();
        const remainingLoans = await LoanRecord_1.default.countDocuments();
        const remainingMovements = await Movement_1.default.countDocuments();
        if (remainingEquipment === 0 && remainingLoans === 0 && remainingMovements === 0) {
            console.log('\n🎉 Base de datos limpia exitosamente!');
            console.log('📝 El sistema está listo para empezar desde cero.');
        }
        else {
            console.warn('\n⚠️  Advertencia: Algunos registros no fueron eliminados.');
        }
        // Cerrar conexión
        await mongoose_1.default.connection.close();
        console.log('\n✅ Conexión a MongoDB cerrada.');
    }
    catch (error) {
        console.error('❌ Error en la limpieza:', error);
        await mongoose_1.default.connection.close();
        process.exit(1);
    }
}
// Ejecutar limpieza
cleanInventoryData();
