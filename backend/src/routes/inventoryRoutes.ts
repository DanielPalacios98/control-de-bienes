import express from 'express';
import {
    getEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getNextInventoryId
} from '../controllers/inventoryController';
import { exitEquipment } from '../controllers/exitController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getEquipment)
    .post(createEquipment);

router.get('/next-id', getNextInventoryId);

router.post('/exit', exitEquipment);

router.route('/:id')
    .get(getEquipmentById)
    .put(updateEquipment)
    .delete(deleteEquipment);

export default router;
