import { Router } from 'express';
import * as typicalController from '../controllers/typicalController';

const router = Router();

/* Seven total typical scenerio queries. */

// 1.
router.post('/employees/register', typicalController.registerEmployee);

// 2.
router.post('/receipts/process', typicalController.processReceipts);

// 3.
router.get('/stock-order/check', typicalController.checkStock);
router.post('/stock-order/create', typicalController.createStockOrder);

// 4.
router.post('/reviews/submit', typicalController.submitReview);
router.get('/reviews/statistics', typicalController.reviewStatistics);

// 5.
router.get('/stockers/assignments', typicalController.stockerAssignments);

// 6.
router.get('/employees/shift', typicalController.employeeShifts);

// 7.
router.get('/delivery/orders', typicalController.deliveryOrders);

export default router;