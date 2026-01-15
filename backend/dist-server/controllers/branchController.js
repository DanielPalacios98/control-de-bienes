"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranch = exports.updateBranch = exports.createBranch = exports.getBranchById = exports.getBranches = void 0;
const Branch_1 = __importDefault(require("../models/Branch"));
// Get all branches
const getBranches = async (req, res) => {
    try {
        const branches = await Branch_1.default.find()
            .populate('managerId', 'name email')
            .sort({ name: 1 });
        res.json(branches);
    }
    catch (error) {
        console.error('Error getting branches:', error);
        res.status(500).json({ message: 'Error al obtener las sucursales' });
    }
};
exports.getBranches = getBranches;
// Get single branch
const getBranchById = async (req, res) => {
    try {
        const branch = await Branch_1.default.findById(req.params.id)
            .populate('managerId', 'name email');
        if (!branch) {
            res.status(404).json({ message: 'Sucursal no encontrada' });
            return;
        }
        res.json(branch);
    }
    catch (error) {
        console.error('Error getting branch:', error);
        res.status(500).json({ message: 'Error al obtener la sucursal' });
    }
};
exports.getBranchById = getBranchById;
// Create new branch
const createBranch = async (req, res) => {
    try {
        const branch = await Branch_1.default.create(req.body);
        await branch.populate('managerId', 'name email');
        res.status(201).json(branch);
    }
    catch (error) {
        console.error('Error creating branch:', error);
        res.status(400).json({
            message: error.message || 'Error al crear la sucursal',
            errors: error.errors
        });
    }
};
exports.createBranch = createBranch;
// Update branch
const updateBranch = async (req, res) => {
    try {
        const branch = await Branch_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('managerId', 'name email');
        if (!branch) {
            res.status(404).json({ message: 'Sucursal no encontrada' });
            return;
        }
        res.json(branch);
    }
    catch (error) {
        console.error('Error updating branch:', error);
        res.status(400).json({
            message: error.message || 'Error al actualizar la sucursal',
            errors: error.errors
        });
    }
};
exports.updateBranch = updateBranch;
// Delete branch
const deleteBranch = async (req, res) => {
    try {
        const branch = await Branch_1.default.findByIdAndDelete(req.params.id);
        if (!branch) {
            res.status(404).json({ message: 'Sucursal no encontrada' });
            return;
        }
        res.json({ message: 'Sucursal eliminada correctamente' });
    }
    catch (error) {
        console.error('Error deleting branch:', error);
        res.status(500).json({ message: 'Error al eliminar la sucursal' });
    }
};
exports.deleteBranch = deleteBranch;
