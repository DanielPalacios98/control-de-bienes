import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db';
// Import routes here later

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
// app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => {
    res.send('API Control de Bienes FAE is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
