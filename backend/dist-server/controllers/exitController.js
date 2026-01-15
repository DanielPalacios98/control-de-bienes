"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitEquipment = void 0;
const equipmentService_1 = require("../services/equipmentService");
const exitEquipment = async (req, res) => {
    try {
        // @ts-ignore
        const user = req.user;
        const { equipmentId, quantity, responsibleId, reason } = req.body;
        const result = await (0, equipmentService_1.processEquipmentExit)({
            equipmentId,
            quantity,
            responsibleId,
            performedById: user._id.toString(),
            branchId: user.branchId.toString(),
            reason
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error processing exit:', error);
        res.status(400).json({
            message: error.message || 'Error al procesar el egreso'
        });
    }
};
exports.exitEquipment = exitEquipment;
