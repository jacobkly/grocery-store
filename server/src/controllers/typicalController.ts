import { Request, Response } from 'express';
import { pool, connectDB } from '../config/db';

export const testController = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ message: 'Database connection is not initialized' });
            await connectDB();
            return;
        }

        const result = await pool.request().query('SELECT * FROM Reviews');

        res.status(200).json({
            message: 'Data fetched successfully',
            data: result.recordset,
        });
    } catch (error: any) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: "Test database query failed", error: error.message });
    }
};