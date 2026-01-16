"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const custodianController_1 = require("../controllers/custodianController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Todas las rutas requieren autenticación
router.use(authMiddleware_1.protect);
router.get('/', custodianController_1.getCustodians);
router.get('/default', custodianController_1.getDefaultCustodian);
router.post('/', custodianController_1.createCustodian);
exports.default = router;
