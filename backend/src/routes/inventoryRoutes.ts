import express from 'express';
import {
    getEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    registerIncome,
    registerOutcome
} from '../controllers/inventoryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getEquipment)
    .post(createEquipment);

// Registrar ingresos y egresos
router.post('/income', registerIncome);
router.post('/outcome', registerOutcome);

router.route('/:id')
    .get(getEquipmentById)
    .put(updateEquipment)
    .delete(deleteEquipment);

export default router;
