import express from 'express';
import {
    getBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch
} from '../controllers/branchController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getBranches)
    .post(createBranch);

router.route('/:id')
    .get(getBranchById)
    .put(updateBranch)
    .delete(deleteBranch);

export default router;
