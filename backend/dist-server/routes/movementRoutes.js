"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const movementController_1 = require("../controllers/movementController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.protect);
router.route('/')
    .get(movementController_1.getMovements)
    .post(movementController_1.createMovement);
exports.default = router;
