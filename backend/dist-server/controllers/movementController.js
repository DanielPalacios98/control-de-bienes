"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMovement = exports.getMovements = void 0;
const Movement_1 = __importDefault(require("../models/Movement"));
// Get all movements (with optional filtering)
const getMovements = async (req, res) => {
    try {
        // @ts-ignore
        const user = req.user;
        const query = user.role === 'SUPER_ADMIN'
            ? {}
            : { branchId: user.branchId };
        const movements = await Movement_1.default.find(query)
            .populate('equipmentId', 'description tipo')
            .populate('responsibleId', 'name email')
            .populate('performedById', 'name email')
            .populate('branchId', 'name')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(movements);
    }
    catch (error) {
        console.error('Error getting movements:', error);
        res.status(500).json({ message: 'Error al obtener movimientos' });
    }
};
exports.getMovements = getMovements;
// Create new movement
const createMovement = async (req, res) => {
    try {
        // @ts-ignore
        const user = req.user;
        const movementData = {
            ...req.body,
            performedById: user._id,
            timestamp: new Date()
        };
        const movement = await Movement_1.default.create(movementData);
        // Populate before returning
        await movement.populate('equipmentId', 'description tipo');
        await movement.populate('responsibleId', 'name email');
        await movement.populate('performedById', 'name email');
        await movement.populate('branchId', 'name');
        res.status(201).json(movement);
    }
    catch (error) {
        console.error('Error creating movement:', error);
        res.status(400).json({
            message: error.message || 'Error al crear movimiento',
            errors: error.errors
        });
    }
};
exports.createMovement = createMovement;
