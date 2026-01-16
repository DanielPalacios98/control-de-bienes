import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LoanRecord from './models/LoanRecord';
import Custodian from './models/Custodian';

// Cargar variables de entorno
dotenv.config();

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

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Buscar custodio por defecto
    const defaultCustodian = await Custodian.findOne({ isDefault: true });
    
    if (!defaultCustodian) {
      throw new Error('❌ No se encontró custodio por defecto. Ejecute seed.ts primero.');
    }

    console.log(`📋 Custodio por defecto encontrado: ${defaultCustodian.name}`);
    console.log(`📋 ID del custodio: ${defaultCustodian._id}`);

    // Buscar todos los LoanRecords sin custodianId
    const loansWithoutCustodian = await LoanRecord.find({
      $or: [
        { custodianId: { $exists: false } },
        { custodianId: null }
      ]
    });

    console.log(`\n📊 Registros de préstamos encontrados sin custodio: ${loansWithoutCustodian.length}`);

    if (loansWithoutCustodian.length === 0) {
      console.log('✅ Todos los registros ya tienen custodio asignado. No se requiere migración.');
      await mongoose.connection.close();
      return;
    }

    // Actualizar todos los registros sin custodio
    const result = await LoanRecord.updateMany(
      {
        $or: [
          { custodianId: { $exists: false } },
          { custodianId: null }
        ]
      },
      {
        $set: { custodianId: defaultCustodian._id }
      }
    );

    console.log(`\n✅ Migración completada:`);
    console.log(`   - Registros actualizados: ${result.modifiedCount}`);
    console.log(`   - Custodio asignado: ${defaultCustodian.name}`);
    console.log(`   - ID del custodio: ${defaultCustodian._id}`);

    // Verificar que no queden registros sin custodio
    const remaining = await LoanRecord.countDocuments({
      $or: [
        { custodianId: { $exists: false } },
        { custodianId: null }
      ]
    });

    if (remaining > 0) {
      console.warn(`⚠️  Advertencia: Aún quedan ${remaining} registros sin custodio.`);
    } else {
      console.log('\n🎉 Verificación exitosa: Todos los registros tienen custodio asignado.');
    }

    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n✅ Conexión a MongoDB cerrada.');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar migración
migrateLoanRecords();
