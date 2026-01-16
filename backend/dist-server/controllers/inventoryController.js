"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOutcome = exports.registerIncome = exports.deleteEquipment = exports.updateEquipment = exports.createEquipment = exports.getEquipmentById = exports.getEquipment = void 0;
const Equipment_1 = __importDefault(require("../models/Equipment"));
const equipmentService_1 = require("../services/equipmentService");
/**
 * Controlador de Inventario - Sistema de Excel Bodega de Equipo y Vestuario
 */
// Get all equipment for a user's branch
const getEquipment = async (req, res) => {
    try {
        // @ts-ignore
        const user = req.user;
        const query = user.role === 'SUPER_ADMIN'
            ? {}
            : { branchId: user.branchId };
        const equipment = await Equipment_1.default.find(query)
            .populate('branchId', 'name location')
            .sort({ tipo: 1, ord: 1 }); // Ordenar por TIPO y luego por ORD
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
        // Validar que las cantidades sean no-negativas
        const { materialServible = 0, materialCaducado = 0, materialPrestado = 0 } = req.body;
        if (materialServible < 0 || materialCaducado < 0 || materialPrestado < 0) {
            res.status(400).json({ message: 'Las cantidades no pueden ser negativas' });
            return;
        }
        const equipmentData = {
            ...req.body,
            branchId: user.role === 'SUPER_ADMIN' ? req.body.branchId : user.branchId,
            materialServible,
            materialCaducado,
            materialPrestado
        };
        const equipment = await Equipment_1.default.create(equipmentData);
        // Populate before returning
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
        // Validar que las cantidades sean no-negativas si se están actualizando
        const { materialServible, materialCaducado, materialPrestado } = req.body;
        if ((materialServible !== undefined && materialServible < 0) ||
            (materialCaducado !== undefined && materialCaducado < 0) ||
            (materialPrestado !== undefined && materialPrestado < 0)) {
            res.status(400).json({ message: 'Las cantidades no pueden ser negativas' });
            return;
        }
        const equipment = await Equipment_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
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
/**
 * Registrar un ingreso de material
 * Incrementa materialServible o materialCaducado según corresponda
 */
const registerIncome = async (req, res) => {
    try {
        const { equipmentId, cantidad, tipo } = req.body; // tipo: 'servible' o 'caducado'
        if (!equipmentId || !cantidad || cantidad <= 0) {
            res.status(400).json({ message: 'Datos inválidos para el ingreso' });
            return;
        }
        const equipment = await Equipment_1.default.findById(equipmentId);
        if (!equipment) {
            res.status(404).json({ message: 'Equipo no encontrado' });
            return;
        }
        // Actualizar según el tipo
        if (tipo === 'caducado') {
            equipment.materialCaducado += cantidad;
        }
        else {
            equipment.materialServible += cantidad;
        }
        await equipment.save();
        await equipment.populate('branchId', 'name location');
        res.json({
            message: 'Ingreso registrado correctamente',
            equipment
        });
    }
    catch (error) {
        console.error('Error registering income:', error);
        res.status(500).json({ message: 'Error al registrar el ingreso' });
    }
};
exports.registerIncome = registerIncome;
/**
 * Registrar un egreso de material
 * Decrementa materialServible y incrementa materialPrestado
 */
const registerOutcome = async (req, res) => {
    try {
        // @ts-ignore
        const user = req.user;
        const { equipmentId, cantidad, responsibleName, responsibleIdentification, responsibleArea, custodianId, observacion } = req.body;
        // Validaciones
        if (!equipmentId || !cantidad || cantidad <= 0) {
            res.status(400).json({ message: 'Equipo y cantidad son requeridos' });
            return;
        }
        if (!responsibleName) {
            res.status(400).json({ message: 'El nombre del responsable es requerido' });
            return;
        }
        if (!custodianId) {
            res.status(400).json({ message: 'El custodio es requerido' });
            return;
        }
        const result = await (0, equipmentService_1.processOutcome)({
            equipmentId,
            cantidad,
            responsibleName,
            responsibleIdentification,
            responsibleArea,
            custodianId,
            performedById: user._id,
            branchId: user.branchId,
            observacion
        });
        const equipment = await Equipment_1.default.findById(equipmentId)
            .populate('branchId', 'name location')
            .populate('custodianId', 'name rank');
        res.json({
            message: result.message,
            equipment
        });
    }
    catch (error) {
        console.error('Error registering outcome:', error);
        res.status(400).json({
            message: error.message || 'Error al registrar el egreso'
        });
    }
};
exports.registerOutcome = registerOutcome;
