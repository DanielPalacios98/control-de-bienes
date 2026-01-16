import express from 'express';
import { getCustodians, getDefaultCustodian, createCustodian } from '../controllers/custodianController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getCustodians);
router.get('/default', getDefaultCustodian);
router.post('/', createCustodian);

export default router;
