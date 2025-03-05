import { Router } from 'express';
import * as analyticalController from '../controllers/analyticalController';

const router = Router();

/* Six total analytical queries. */

// 1.
router.get('/customers/high-value', analyticalController.highValueCustomers);

// 2.
router.get('/cashiers/fastest', analyticalController.fastestCashier);

// 3.
router.get('/reviews/trend', analyticalController.reviewsTrend);

// 4.
router.get('/warehouse-workers/certified',
    analyticalController.certifiedMorningWarehouseWorkers);

// 5.
router.get('/customers/spending-behavior', analyticalController.customerSpendingBehavior);

// 6.
router.get('/products/low-inventory', analyticalController.lowInventoryProducts);

export default router;