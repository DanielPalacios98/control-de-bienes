import { Router } from 'express';
import { getActiveLoanRecords, getAllLoanRecords, getLoanRecordsByEquipment, registerReturn } from '../controllers/loanRecordController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

/**
 * Rutas para gestión de registros de material prestado
 * Todas las rutas requieren autenticación
 */

// Obtener registros activos (material prestado actualmente)
router.get('/active', protect, getActiveLoanRecords);

// Obtener todos los registros (con filtros opcionales)
router.get('/', protect, getAllLoanRecords);

// Obtener registros por equipo específico
router.get('/equipment/:equipmentId', protect, getLoanRecordsByEquipment);

// Registrar devolución
router.post('/:loanRecordId/return', protect, registerReturn);

export default router;
