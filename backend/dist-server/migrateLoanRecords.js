"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const LoanRecord_1 = __importDefault(require("./models/LoanRecord"));
const Custodian_1 = __importDefault(require("./models/Custodian"));
// Cargar variables de entorno
dotenv_1.default.config();
/**
 * Script de migración: Asocia todos los LoanRecords sin custodianId al custodio por defecto
 *
 * Este script garantiza integridad referencial y cumple con la regla de negocio:
 * "Todo egreso debe tener un custodio asignado"
 */
async function migrateLoanRecords() {
    try {
        // Conectar a MongoDB
        const mongoUri = process.env.MONGODB_URI || '';
        if (!mongoUri) {
            throw new Error('MONGODB_URI no está definida en .env');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Conectado a MongoDB');
        // Buscar custodio por defecto
        const defaultCustodian = await Custodian_1.default.findOne({ isDefault: true });
        if (!defaultCustodian) {
            throw new Error('❌ No se encontró custodio por defecto. Ejecute seed.ts primero.');
        }
        console.log(`📋 Custodio por defecto encontrado: ${defaultCustodian.name}`);
        console.log(`📋 ID del custodio: ${defaultCustodian._id}`);
        // Buscar todos los LoanRecords sin custodianId
        const loansWithoutCustodian = await LoanRecord_1.default.find({
            $or: [
                { custodianId: { $exists: false } },
                { custodianId: null }
            ]
        });
        console.log(`\n📊 Registros de préstamos encontrados sin custodio: ${loansWithoutCustodian.length}`);
        if (loansWithoutCustodian.length === 0) {
            console.log('✅ Todos los registros ya tienen custodio asignado. No se requiere migración.');
            await mongoose_1.default.connection.close();
            return;
        }
        // Actualizar todos los registros sin custodio
        const result = await LoanRecord_1.default.updateMany({
            $or: [
                { custodianId: { $exists: false } },
                { custodianId: null }
            ]
        }, {
            $set: { custodianId: defaultCustodian._id }
        });
        console.log(`\n✅ Migración completada:`);
        console.log(`   - Registros actualizados: ${result.modifiedCount}`);
        console.log(`   - Custodio asignado: ${defaultCustodian.name}`);
        console.log(`   - ID del custodio: ${defaultCustodian._id}`);
        // Verificar que no queden registros sin custodio
        const remaining = await LoanRecord_1.default.countDocuments({
            $or: [
                { custodianId: { $exists: false } },
                { custodianId: null }
            ]
        });
        if (remaining > 0) {
            console.warn(`⚠️  Advertencia: Aún quedan ${remaining} registros sin custodio.`);
        }
        else {
            console.log('\n🎉 Verificación exitosa: Todos los registros tienen custodio asignado.');
        }
        // Cerrar conexión
        await mongoose_1.default.connection.close();
        console.log('\n✅ Conexión a MongoDB cerrada.');
    }
    catch (error) {
        console.error('❌ Error en la migración:', error);
        await mongoose_1.default.connection.close();
        process.exit(1);
    }
}
// Ejecutar migración
migrateLoanRecords();
