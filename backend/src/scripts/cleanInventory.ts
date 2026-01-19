import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Equipment from '../models/Equipment';
import LoanRecord from '../models/LoanRecord';
import Movement from '../models/Movement';

// Cargar variables de entorno
dotenv.config();

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

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Contar registros antes de eliminar
    const equipmentCount = await Equipment.countDocuments();
    const loanRecordCount = await LoanRecord.countDocuments();
    const movementCount = await Movement.countDocuments();

    console.log('\n📊 Registros actuales:');
    console.log(`   - Equipos: ${equipmentCount}`);
    console.log(`   - Préstamos: ${loanRecordCount}`);
    console.log(`   - Movimientos: ${movementCount}`);

    if (equipmentCount === 0 && loanRecordCount === 0 && movementCount === 0) {
      console.log('\n✅ La base de datos ya está limpia. No hay datos de inventario.');
      await mongoose.connection.close();
      return;
    }

    // Confirmación
    console.log('\n⚠️  Se eliminarán todos los registros de inventario.');
    console.log('⚠️  Los usuarios, custodios y branches NO se eliminarán.');

    // Eliminar datos
    console.log('\n🗑️  Eliminando datos...');
    
    const deleteResults = await Promise.all([
      Equipment.deleteMany({}),
      LoanRecord.deleteMany({}),
      Movement.deleteMany({})
    ]);

    console.log('\n✅ Limpieza completada:');
    console.log(`   - Equipos eliminados: ${deleteResults[0].deletedCount}`);
    console.log(`   - Préstamos eliminados: ${deleteResults[1].deletedCount}`);
    console.log(`   - Movimientos eliminados: ${deleteResults[2].deletedCount}`);

    // Verificar limpieza
    const remainingEquipment = await Equipment.countDocuments();
    const remainingLoans = await LoanRecord.countDocuments();
    const remainingMovements = await Movement.countDocuments();

    if (remainingEquipment === 0 && remainingLoans === 0 && remainingMovements === 0) {
      console.log('\n🎉 Base de datos limpia exitosamente!');
      console.log('📝 El sistema está listo para empezar desde cero.');
    } else {
      console.warn('\n⚠️  Advertencia: Algunos registros no fueron eliminados.');
    }

    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n✅ Conexión a MongoDB cerrada.');

  } catch (error) {
    console.error('❌ Error en la limpieza:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar limpieza
cleanInventoryData();
