import express, { Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import checkDBConnection from './middleware/checkDBConnection';
import typicalRoutes from './routes/typicalRoutes';
import analyticalRoutes from './routes/analyticalRoutes';

dotenv.config();

// server initialization
const app = express();
const PORT: number = Number(process.env.SERVER_PORT) || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(checkDBConnection);

// routes for typical scenario and analytical queries
app.use('/typical', typicalRoutes);
app.use('/analytical', analyticalRoutes);

// start server
app.listen(PORT, () => {
    console.log(`Server starting at http://localhost:${PORT}`);
});