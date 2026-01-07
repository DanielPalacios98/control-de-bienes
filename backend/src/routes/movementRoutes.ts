import express from 'express';
import { getMovements, createMovement } from '../controllers/movementController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getMovements)
    .post(createMovement);

export default router;
