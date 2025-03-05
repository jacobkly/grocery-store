import { Request, Response } from 'express';
import { pool } from '../config/db';

/* Rank the high-value customers in the store based on total spending over time. */
export const highValueCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ message: 'Database connection is not initialized' });
            return;
        }

        const highValueCustomerResult = await pool.request().query(`
            SELECT r.CustomerID, c.FirstName, c.LastName, 
                COUNT(ReceiptID) AS StoreVisitCount, SUM(Total) AS TotalSpending
            FROM Receipts r
            JOIN Customers c ON r.CustomerID = c.CustomerID
            GROUP BY r.CustomerID, c.FirstName, c.LastName
            ORDER BY TotalSpending DESC  
        `);

        res.status(200).json({ highValueCustomers: highValueCustomerResult.recordset });
    } catch (error: any) {
        console.error('Error fetching high value customers:', error);
        res.status(500).json({ message: "Error fetching high value customers", error: error.message });
    }
};

/* 
Determine the cashier with the fastest customer transaction time at their register, 
factoring in product quantity or weight. 
*/
export const fastestCashier = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ message: 'Database connection is not initialized' });
            return;
        }

        const fastestCashiersResult = await pool.request().query(`
            WITH CashierTransactionTimes AS (
	            SELECT EmployeeID, Min(TransactionTime) AS MinTime, Max(TransactionTime) AS MaxTime,
			        SUM(NumItems) AS TotalItems, COUNT(*) AS TotalNumTransactions
	            FROM Receipts
	            WHERE RegisterNumber IS NOT NULL
	            GROUP BY EmployeeID
            )
            SELECT 
                EmployeeID, 
                DATEDIFF(MINUTE, MinTime, MaxTime) AS TotalMinutes, 
                TotalItems, 
                TotalNumTransactions, 
		        (TotalItems * 1.0) / DATEDIFF(HOUR, MinTime, MaxTime) AS AvgItemsPerHour
            FROM CashierTransactionTimes
            ORDER BY AvgItemsPerHour DESC
        `);

        res.status(200).json({ fastestCashiers: fastestCashiersResult.recordset });
    } catch (error: any) {
        console.error('Error fetching fastest cashiers:', error);
        res.status(500).json({ message: "Error fetching fastest cashiers", error: error.message });
    }
};

/* Check the trend of stars given in reviews since a certain date. */
export const reviewsTrend = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ message: 'Database connection is not initialized' });
            return;
        }

        // format: '2025-02-22 00:00:00.000'
        const { startDateTime } = req.body;
        if (!startDateTime || isNaN(Date.parse(startDateTime))) {
            res.status(400).json({ message: 'Invalid startDateTime format. Please provide a valid date.' });
            return;
        }

        const reviewsTrendResult = await pool.request()
            .input('startDateTime', startDateTime)
            .query(`
            SELECT 
                DATEPART(YEAR, [DateTime]) AS Year, 
                DATEPART(MONTH, [DateTime]) AS Month, 
		        DATEPART(DAY, [DateTime]) AS Day, 
                AVG(NumStars) AS AvgDailyStars
            FROM Reviews
            WHERE [DateTime] >= @startDateTime
            GROUP BY 
                DATEPART(YEAR, [DateTime]), 
                DATEPART(MONTH, [DateTime]), 
                DATEPART(DAY, [DateTime])
            ORDER BY Year, Month, Day;
        `);

        res.status(200).json({ reviewsTrend: reviewsTrendResult.recordset });
    } catch (error: any) {
        console.error('Error fetching reviews trend:', error);
        res.status(500).json({ message: "Error fetching reviews trend", error: error.message });
    }
};

/* 
Find all warehouse workers with forklift certification, and that are working between 
6 and 10 am (morning shift). 
*/
export const certifiedMorningWarehouseWorkers = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ message: 'Database connection is not initialized' });
            return;
        }

        const certifiedMorningWarehouseWorkersResult = await pool.request().query(`
            SELECT EmployeeID, FirstName, LastName, ShiftTiming, RoleName
            FROM Employees
            JOIN Roles ON Employees.RoleID = Roles.RoleID
            WHERE ShiftTiming = 'Morning' AND RoleName = 'Warehouse Worker';
        `);

        res.status(200).json({ certifiedMorningWarehouseWorkers: certifiedMorningWarehouseWorkersResult.recordset });
    } catch (error: any) {
        console.error('Error fetching certified morning warehouse workers:', error);
        res.status(500).json({ message: "Error fetching certified morning warehouse workers", error: error.message });
    }
};

/* 
Compare customer spending behavior between members and non-members determining if membership 
increases revenue. 
*/
export const customerSpendingBehavior = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ message: 'Database connection is not initialized' });
            return;
        }

        const customerSpendingBehaviorResult = await pool.request().query(`
            SELECT 
                Receipts.CustomerID, 
                Customers.FirstName, 
                Customers.LastName, 
                SUM(Total) AS TotalSpending, 
                Customers.MemberStatus
            FROM Receipts
            JOIN Customers ON Receipts.CustomerID = Customers.CustomerID
            GROUP BY 
                Receipts.CustomerID, 
                Customers.FirstName, 
                Customers.LastName, 
                Customers.MemberStatus
            ORDER BY TotalSpending DESC;
        `);

        res.status(200).json({ customerSpendingBehavior: customerSpendingBehaviorResult.recordset });
    } catch (error: any) {
        console.error('Error fetching customer spending behaviors:', error);
        res.status(500).json({ message: "Error fetching customer spending behaviors", error: error.message });
    }
};

/* Find all products with low inventory from highest to lowest priority based on quantity. */
export const lowInventoryProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ message: 'Database connection is not initialized' });
            return;
        }

        const lowInventoryProductsResult = await pool.request().query(`
            SELECT i.ProductID, p.[Name], i.Quantity, c.[Name], i.LastRestockDate
            FROM Inventory i
            JOIN Products p ON i.ProductID = p.ProductID
            JOIN Categories c ON p.CategoryID = c.CategoryID
            WHERE i.Quantity <= 20
            ORDER BY Quantity, LastRestockDate DESC;
        `);

        res.status(200).json({ lowInventoryProducts: lowInventoryProductsResult.recordset });
    } catch (error: any) {
        console.error('Error fetching low inventory products:', error);
        res.status(500).json({ message: "Error fetching low inventory products", error: error.message });
    }
};