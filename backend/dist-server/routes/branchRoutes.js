"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const branchController_1 = require("../controllers/branchController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.protect);
router.route('/')
    .get(branchController_1.getBranches)
    .post(branchController_1.createBranch);
router.route('/:id')
    .get(branchController_1.getBranchById)
    .put(branchController_1.updateBranch)
    .delete(branchController_1.deleteBranch);
exports.default = router;
