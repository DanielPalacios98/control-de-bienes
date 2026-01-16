"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loanRecordController_1 = require("../controllers/loanRecordController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/**
 * Rutas para gestión de registros de material prestado
 * Todas las rutas requieren autenticación
 */
// Obtener registros activos (material prestado actualmente)
router.get('/active', authMiddleware_1.protect, loanRecordController_1.getActiveLoanRecords);
// Obtener todos los registros (con filtros opcionales)
router.get('/', authMiddleware_1.protect, loanRecordController_1.getAllLoanRecords);
// Obtener registros por equipo específico
router.get('/equipment/:equipmentId', authMiddleware_1.protect, loanRecordController_1.getLoanRecordsByEquipment);
// Registrar devolución
router.post('/:loanRecordId/return', authMiddleware_1.protect, loanRecordController_1.registerReturn);
exports.default = router;
