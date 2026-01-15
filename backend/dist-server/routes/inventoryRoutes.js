"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryController_1 = require("../controllers/inventoryController");
const exitController_1 = require("../controllers/exitController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.protect);
router.route('/')
    .get(inventoryController_1.getEquipment)
    .post(inventoryController_1.createEquipment);
router.post('/exit', exitController_1.exitEquipment);
router.route('/:id')
    .get(inventoryController_1.getEquipmentById)
    .put(inventoryController_1.updateEquipment)
    .delete(inventoryController_1.deleteEquipment);
exports.default = router;
