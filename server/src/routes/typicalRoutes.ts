import { Router } from 'express';
import { testController } from '../controllers/typicalController';

const router = Router();

router.get('/test', testController);

export default router;