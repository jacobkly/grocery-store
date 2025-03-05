import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

const checkDBConnection = (req: Request, res: Response, next: NextFunction): void => {
    if (!pool) {
        res.status(500).json({ error: 'Database connection is not initialized' });
        return;
    }
    next();
};

export default checkDBConnection;