"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                branchId: user.branchId,
                token: generateToken(user._id.toString()),
            });
        }
        else {
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    // @ts-ignore
    const user = req.user;
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            branchId: user.branchId
        });
    }
    else {
        res.status(404).json({ message: 'Usuario no encontrado' });
    }
};
exports.getMe = getMe;
