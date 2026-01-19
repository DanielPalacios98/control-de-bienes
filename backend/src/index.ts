import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db';
// Import routes here later

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

import authRoutes from './routes/authRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import movementRoutes from './routes/movementRoutes';
import branchRoutes from './routes/branchRoutes';
import custodianRoutes from './routes/custodianRoutes';
import loanRecordRoutes from './routes/loanRecordRoutes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/custodians', custodianRoutes);
app.use('/api/loan-records', loanRecordRoutes);

app.get('/', (req, res) => {
    res.send('API Bodega Equipo y Vestuario FAE is running');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
