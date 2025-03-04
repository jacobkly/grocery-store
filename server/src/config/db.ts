import mssql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

const mssqlConfig = {
    user: getEnvVariable('DB_USER'),
    password: getEnvVariable('DB_PASSWORD'),
    server: getEnvVariable('DB_SERVER'),
    database: getEnvVariable('DB_DATABASE'),
    options: {
        trustServerCertificate: true,
        trustedConnection: false,
        enableArithAbort: true,
    },
    port: parseInt(getEnvVariable('DB_PORT'))
}

let pool: mssql.ConnectionPool | null = null;

// Connect to database
export const connectDB = async () => {
    try {
        if (!pool) {
            pool = await mssql.connect(mssqlConfig);
            console.log('Connected to SQL Server');
        }
        return pool;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

connectDB();

export { mssql, pool };