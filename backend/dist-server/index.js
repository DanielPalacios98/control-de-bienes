"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
// Import routes here later
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '8080', 10);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to Database
(0, db_1.default)();
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const movementRoutes_1 = __importDefault(require("./routes/movementRoutes"));
const branchRoutes_1 = __importDefault(require("./routes/branchRoutes"));
const custodianRoutes_1 = __importDefault(require("./routes/custodianRoutes"));
const loanRecordRoutes_1 = __importDefault(require("./routes/loanRecordRoutes"));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/inventory', inventoryRoutes_1.default);
app.use('/api/movements', movementRoutes_1.default);
app.use('/api/branches', branchRoutes_1.default);
app.use('/api/custodians', custodianRoutes_1.default);
app.use('/api/loan-records', loanRecordRoutes_1.default);
app.get('/', (req, res) => {
    res.send('API Bodega Equipo y Vestuario FAE is running');
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
