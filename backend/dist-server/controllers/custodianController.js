"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustodian = exports.getDefaultCustodian = exports.getCustodians = void 0;
const Custodian_1 = __importDefault(require("../models/Custodian"));
// Get all custodians
const getCustodians = async (req, res) => {
    try {
        const custodians = await Custodian_1.default.find({ isActive: true }).sort({ name: 1 });
        res.json(custodians);
    }
    catch (error) {
        console.error('Error getting custodians:', error);
        res.status(500).json({ message: 'Error al obtener custodios' });
    }
};
exports.getCustodians = getCustodians;
// Get default custodian
const getDefaultCustodian = async (req, res) => {
    try {
        const custodian = await Custodian_1.default.findOne({ isDefault: true, isActive: true });
        if (!custodian) {
            res.status(404).json({ message: 'Custodio por defecto no encontrado' });
            return;
        }
        res.json(custodian);
    }
    catch (error) {
        console.error('Error getting default custodian:', error);
        res.status(500).json({ message: 'Error al obtener custodio por defecto' });
    }
};
exports.getDefaultCustodian = getDefaultCustodian;
// Create custodian
const createCustodian = async (req, res) => {
    try {
        const custodian = await Custodian_1.default.create(req.body);
        res.status(201).json(custodian);
    }
    catch (error) {
        console.error('Error creating custodian:', error);
        res.status(400).json({
            message: error.message || 'Error al crear custodio',
            errors: error.errors
        });
    }
};
exports.createCustodian = createCustodian;
