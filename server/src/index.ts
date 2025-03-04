import express, { Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import typicalRoutes from './routes/typicalRoutes';
import analyticalRoutes from './routes/analyticalRoutes';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.SERVER_PORT) || 3000;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.get("/", (req: Request, res: Response): void => {
    res.json({ message: "Hello, world! Server is running." });
});

app.use('/typical', typicalRoutes);
app.use('/analytical', analyticalRoutes);

// start server
app.listen(PORT, () => {
    console.log(`Server starting at http://localhost:${PORT}`);
});