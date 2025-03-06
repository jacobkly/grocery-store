import { Request, Response } from 'express';
import { pool } from '../config/db';

/*
A certain department manager can register a new employee in the grocery store system. 
The new employee must fill out their information and be assigned an employee role. The 
manager will assign them to a department and provide their shift timing and responsibilities 
within the system.
*/
export const registerEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ message: 'Database connection is not initialized' });
            return;
        }

        const { firstName, lastName, shiftTiming, roleName, roleAssignments } = req.body;

        const roleResult = await pool.request()
            .input('roleName', roleName)
            .query(`SELECT RoleID, MaxSalary FROM Roles WHERE RoleName = @roleName`);

        if (roleResult.recordset.length === 0) {
            res.status(400).json({ message: 'Invalid role name' });
            return;
        }

        const { RoleID, MaxSalary } = roleResult.recordset[0];

        let result = await pool.request()
            .input('firstName', firstName)
            .input('lastName', lastName)
            .input('shiftTiming', shiftTiming)
            .input('roleID', RoleID)
            .query(`
                INSERT INTO Employees (FirstName, LastName, ShiftTiming, RoleID)
                OUTPUT INSERTED.EmployeeID
                VALUES (@firstName, @lastName, @shiftTiming, @roleID)
            `);

        const newEmployeeID = result.recordset[0].EmployeeID;

        const tableName = roleName.replace(/\s+/g, '') + 's';

        let roleSpecificAssignment: string | null = null;
        if (tableName === 'Managers') {
            roleSpecificAssignment = 'Department';
        } else if (tableName === 'Cashiers') {
            roleSpecificAssignment = 'AssignedRegister';
        } else if (tableName === 'Drivers') {
            roleSpecificAssignment = 'VehicleType';
        } else if (tableName === 'WarehouseWorkers') {
            roleSpecificAssignment = 'EquipmentCertification';
        } else if (tableName === 'Stockers') {
            roleSpecificAssignment = 'AssignedAisle';
        } else if (tableName === 'Janitors') {
            roleSpecificAssignment = 'StoreSection';
        }

        if (roleSpecificAssignment) {
            const insertRoleSpecificQuery = `
                INSERT INTO ${tableName} (EmployeeID, ${roleSpecificAssignment}) 
                VALUES (@employeeID, @roleValue)
            `;

            await pool.request()
                .input('employeeID', newEmployeeID)
                .input('roleValue', roleAssignments?.[roleSpecificAssignment] || null)
                .query(insertRoleSpecificQuery);
        }

        const newEmployeeSalary: number = MaxSalary - 10000;

        await pool.request()
            .input('employeeID', newEmployeeID)
            .input('salary', newEmployeeSalary)
            .query('INSERT INTO EmployeeSalaries (EmployeeID, Salary) VALUES (@employeeID, @salary)');

        result = await pool.request()
            .input('employeeID', newEmployeeID)
            .query(`
                SELECT TOP 1 
                    e.EmployeeID, 
                    e.FirstName, 
                    e.LastName, 
                    e.ShiftTiming, 
                    r.RoleName, 
                    r.Description, 
                    es.Salary
                FROM Employees e
                JOIN Roles r ON e.RoleID = r.RoleID
                JOIN EmployeeSalaries es ON e.EmployeeID = es.EmployeeID
                WHERE e.EmployeeID = @employeeID
            `);

        res.status(201).json({ employeeInformation: result.recordset });
    } catch (error: any) {
        console.error('Error registering employee:', error);
        res.status(500).json({ message: 'Error registering employee', error: error.message });
    }
};

/*
A cashier must be able to and or enter items into the register system, process payments, 
and create a receipt for the customer and a separate one for the grocery. The cashier will 
need to get the customer details, apply any compatible discounts, and process the transaction.
*/
export const processReceipts = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ error: 'Database connection is not initialized' });
            return;
        }

        const {
            numItems, subtotal, tax, total, transactionTime, paymentType,
            registerNumber, employeeID, customerID, discountID
        } = req.body;

        const result = await pool.request()
            .input('numItems', numItems)
            .input('subtotal', subtotal)
            .input('tax', tax)
            .input('total', total)
            .input('transactionTime', transactionTime)
            .input('paymentType', paymentType)
            .input('registerNumber', registerNumber)
            .input('employeeID', employeeID)
            .input('customerID', customerID)
            .input('discountID', discountID)
            .query(`
                INSERT INTO Receipts 
                    (NumItems, SubTotal, Tax, Total, TransactionTime, PaymentType, 
                     RegisterNumber, EmployeeID, CustomerID, DiscountID)
                OUTPUT INSERTED.ReceiptID
                VALUES 
                    (@numItems, @subtotal, @tax, @total, @transactionTime, @paymentType, 
                     @registerNumber, @employeeID, @customerID, @discountID)
            `);

        const receiptID = result.recordset[0].ReceiptID;

        const newReceiptResult = await pool.request()
            .input('receiptID', receiptID)
            .query(`
            SELECT *
            FROM Receipts
            WHERE ReceiptID = @receiptID
        `);

        res.status(201).json({
            receipt: newReceiptResult.recordset
        });
    } catch (error: any) {
        console.error('Error processing receipt:', error);
        res.status(500).json({ message: 'Error processing receipt', error: error.message });
    }
};

/*
Part 1 of Typical Scenario 3:
A manager of the grocery store must be able to make a stock order to suppliers. The order will be made 
depending on the store’s inventory levels. The system will allow the manager to select a supplier, 
obtain their information, order necessary items, and track the status of the order.
*/
export const checkStock = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ error: 'Database connection is not initialized' });
            return;
        }

        const checkStockResult = await pool.request().query(`
            SELECT i.ProductID, p.[Name], i.Quantity, c.[Name] AS CategoryName, i.LastRestockDate
            FROM Inventory i
            JOIN Products p ON i.ProductID = p.ProductID
            JOIN Categories c ON p.CategoryID = c.CategoryID
            WHERE i.Quantity <= 20
            ORDER BY Quantity, LastRestockDate DESC
        `);

        res.status(200).json({ stockLevels: checkStockResult.recordset });
    } catch (error: any) {
        console.error('Error checking stock:', error);
        res.status(500).json({ message: 'Error checking stock', error: error.message });
    }
};

/*
Part 2 of Typical Scenario 3:
A manager of the grocery store must be able to make a stock order to suppliers. The order will be made 
depending on the store’s inventory levels. The system will allow the manager to select a supplier, 
obtain their information, order necessary items, and track the status of the order.
*/
export const createStockOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ error: 'Database connection is not initialized' });
            return;
        }

        const { invoicePDF, subtotal, tax, total, paymentType, employeeID, supplierID } = req.body;

        const stockOrderID = await pool.request()
            .input('invoicePDF', invoicePDF)
            .input('subtotal', subtotal)
            .input('tax', tax)
            .input('total', total)
            .input('paymentType', paymentType)
            .input('employeeID', employeeID)
            .input('supplierID', supplierID)
            .query(`
            INSERT INTO StockOrders (
                OrderDate,
                ExpectedDeliveryDate,
                Invoice,
                Subtotal,
                Tax,
                Total,
                PaymentType,
                EmployeeID,
                SupplierID
            )
            OUTPUT INSERTED.StockOrderID
            VALUES (
                GETDATE(),
                GETDATE() + 7,
                @invoicePDF,
                @subtotal,
                @tax,
                @total,
                @paymentType,
                @employeeID,
                @supplierID
            )
        `);

        const stockOrderStatusResult = await pool.request()
            .input('stockOrderID', stockOrderID.recordset[0].StockOrderID)
            .query(`
                SELECT TOP 1 
                    so.StockOrderID,
                    s.Company AS SupplierCompany,
                    sp.FirstName,
                    sp.LastName,
                    spn.PhoneNumber AS SalesPhoneNumber,
                    so.OrderDate,
                    so.ExpectedDeliveryDate,
                    so.Total,
                    so.DeliveryStatus
                FROM StockOrders so 
                JOIN Suppliers s ON so.SupplierID = s.SupplierID
                JOIN SalesPeople sp ON s.SupplierID = sp.SupplierID
                JOIN SalesPhoneNumbers spn ON sp.SalesPersonID = spn.SalesPersonID
                WHERE so.StockOrderID = @stockOrderID
                ORDER BY spn.PhoneNumber 
    `);

        for (let i = 0; i < stockOrderStatusResult.recordset.length; i++) {
            stockOrderStatusResult.recordset[i].DeliveryStatus =
                stockOrderStatusResult.recordset[i].DeliveryStatus ? 'Delivered' : 'Not Delivered';
        }

        res.status(201).json({ stockOrderStatus: stockOrderStatusResult.recordset });
    } catch (error: any) {
        console.error('Error creating stock order:', error);
        res.status(500).json({ message: 'Error creating stock order', error: error.message });
    }
};

/*
Part 1 of Typical Scenario 4:
Customers must have the ability to leave feedback/reviews of the store.
*/
export const submitReview = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ error: 'Database connection is not initialized' });
            return;
        }

        const { reviewText, numStars, customerID } = req.body;

        if (!reviewText || !numStars || !customerID) {
            res.status(400).json({ error: 'Missing required fields: reviewText, numStars, customerID' });
            return;
        }

        await pool.request()
            .input('reviewText', reviewText)
            .input('numStars', numStars)
            .input('customerID', customerID)
            .query(`
                INSERT INTO Reviews (ReviewText, NumStars, [DateTime], CustomerID)
                VALUES (@reviewText, @numStars, GETDATE(), @customerID)
            `);

        res.status(201);
    } catch (error: any) {
        console.error('Error submitting customer review:', error);
        res.status(500).json({ message: 'Error submitting customer review', error: error.message });
    }
};

/*
Part 2 of Typical Scenario 4:
A manager will need the ability to check reviews left by customers anonymously. This would include 
the number of stars given by an individual reviewer, the average number of stars given by all 
reviewers, and also any message left by any individual reviewer.
*/
export const reviewStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ error: 'Database connection is not initialized' });
            return;
        }

        const allReviewsResult = await pool.request().query(`
            SELECT r.ReviewText, r.NumStars, r.[DateTime], c.FirstName AS CustomerName
            FROM Reviews r
            JOIN Customers c ON r.CustomerID = c.CustomerID
        `);

        const avgNumStarsResult = await pool.request().query(`
            SELECT AVG(NumStars) AS AvgStarsByCustomer 
            FROM Reviews
        `);

        res.status(200).json({
            allReviews: allReviewsResult.recordset,
            avgNumStars: avgNumStarsResult.recordset,
        });
    } catch (error: any) {
        console.error('Error fetching review statistics:', error);
        res.status(500).json({ message: 'Error fetching review statistics', error: error.message });
    }
};

/*
Stockers must be able to find out which aisle they are supposed to be restocking, and what items 
are to be stocked in that aisle.
*/
export const stockerAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ error: 'Database connection is not initialized' });
            return;
        }

        const result = await pool.request().query(`
            SELECT e.EmployeeID, e.FirstName, e.LastName, s.AssignedAisle
            FROM Employees e
            JOIN Stockers s ON e.EmployeeID = s.EmployeeID
        `);

        for (let i = 0; i < result.recordset.length; i++) {
            if (result.recordset[i].AssignedAisle === null) {
                result.recordset[i].AssignedAisle = 'New stocker in training.';
            }
        }

        res.status(200).json({ stockerAssignments: result.recordset });
    } catch (error: any) {
        console.error('Error retrieving stocker assignments:', error);
        res.status(500).json({ message: 'Error retrieving stocker assignments', error: error.message });
    }
};

/*
An employee should be able to find their shift time, and a manager should be able to check what 
shift time an employee has.
*/
export const employeeShifts = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ message: 'Database connection is not initialized' });
            return;
        }

        const result = await pool.request().query(`
            SELECT EmployeeID, FirstName, LastName, ShiftTiming
            FROM Employees
        `);

        res.status(200).json({ employeeShifts: result.recordset });
    } catch (error: any) {
        console.error('Error retrieving employee shift times:', error);
        res.status(500).json({ message: 'Error retrieving employee shift times', error: error.message });
    }
};

/*
A delivery driver should be able to keep track of delivery orders. This would include the payment 
method, address, and total price.
*/
export const deliveryOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!pool) {
            res.status(500).json({ message: 'Database connection is not initialized' });
            return;
        }

        const result = await pool.request().query(`
            SELECT 
                d.DeliveryOrderID, 
                r.Total AS TotalPrice, 
                r.PaymentType, 
                a.BuildingNumber, 
                a.Street, 
                a.City, 
                a.[State], 
                a.ZipCode, 
                d.ExpectedDeliveryTime 
            FROM DeliveryOrders d
            JOIN Receipts r ON d.ReceiptID = r.ReceiptID
            JOIN Addresses a ON d.AddressID = a.AddressID
        `);

        res.status(200).json({ deliveryOrders: result.recordset });
    } catch (error: any) {
        console.error('Error retrieving delivery orders:', error);
        res.status(500).json({ message: 'Error retrieving delivery orders', error: error.message });
    }
};
