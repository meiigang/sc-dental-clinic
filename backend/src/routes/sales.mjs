import { Router } from 'express';
import { getSalesSummary } from '../api/sales/salesHandler.mjs';

const router = Router();

// This route will provide all sales data.
router.get('/', getSalesSummary);

export default router;