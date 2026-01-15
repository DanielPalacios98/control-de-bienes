"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEquipment = exports.updateEquipment = exports.createEquipment = exports.getEquipmentById = exports.getEquipment = void 0;
const Equipment_1 = __importDefault(require("../models/Equipment"));
// Get all equipment for a user's branch
const getEquipment = async (req, res) => {
    try {
        // @ts-ignore
        const user = req.user;
        const query = user.role === 'SUPER_ADMIN'
            ? {}
            : { branchId: user.branchId };
        const equipment = await Equipment_1.default.find(query)
            .populate('currentResponsibleId', 'name email')
            .populate('branchId', 'name location')
            .sort({ createdAt: -1 });
        res.json(equipment);
    }
    catch (error) {
        console.error('Error getting equipment:', error);
        res.status(500).json({ message: 'Error al obtener el inventario' });
    }
};
exports.getEquipment = getEquipment;
// Get single equipment item
const getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment_1.default.findById(req.params.id)
            .populate('currentResponsibleId', 'name email')
            .populate('branchId', 'name location');
        if (!equipment) {
            res.status(404).json({ message: 'Equipo no encontrado' });
            return;
        }
        res.json(equipment);
    }
    catch (error) {
        console.error('Error getting equipment:', error);
        res.status(500).json({ message: 'Error al obtener el equipo' });
    }
};
exports.getEquipmentById = getEquipmentById;
// Create new equipment
const createEquipment = async (req, res) => {
    try {
        // @ts-ignore
        const user = req.user;
        const equipmentData = {
            ...req.body,
            branchId: user.role === 'SUPER_ADMIN' ? req.body.branchId : user.branchId,
            currentResponsibleId: req.body.currentResponsibleId || user._id
        };
        const equipment = await Equipment_1.default.create(equipmentData);
        // Populate before returning
        await equipment.populate('currentResponsibleId', 'name email');
        await equipment.populate('branchId', 'name location');
        res.status(201).json(equipment);
    }
    catch (error) {
        console.error('Error creating equipment:', error);
        res.status(400).json({
            message: error.message || 'Error al crear el equipo',
            errors: error.errors
        });
    }
};
exports.createEquipment = createEquipment;
// Update equipment
const updateEquipment = async (req, res) => {
    try {
        const equipment = await Equipment_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('currentResponsibleId', 'name email')
            .populate('branchId', 'name location');
        if (!equipment) {
            res.status(404).json({ message: 'Equipo no encontrado' });
            return;
        }
        res.json(equipment);
    }
    catch (error) {
        console.error('Error updating equipment:', error);
        res.status(400).json({
            message: error.message || 'Error al actualizar el equipo',
            errors: error.errors
        });
    }
};
exports.updateEquipment = updateEquipment;
// Delete equipment
const deleteEquipment = async (req, res) => {
    try {
        const equipment = await Equipment_1.default.findByIdAndDelete(req.params.id);
        if (!equipment) {
            res.status(404).json({ message: 'Equipo no encontrado' });
            return;
        }
        res.json({ message: 'Equipo eliminado correctamente' });
    }
    catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ message: 'Error al eliminar el equipo' });
    }
};
exports.deleteEquipment = deleteEquipment;
