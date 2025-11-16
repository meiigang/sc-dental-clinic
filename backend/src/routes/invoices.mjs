import { Router } from 'express';
import { supabaseMiddleware } from '../utils/middleware/middleware.mjs';
import { getInvoiceDetails } from '../api/billing/billingHistoryHandler.mjs';

const router = Router();
router.use(supabaseMiddleware);

// Route to get full details for a single invoice by its ID
// This will respond to GET /api/invoices/:id
router.get('/:id', getInvoiceDetails);

export default router;