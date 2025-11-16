import { Router } from 'express';
import { authenticateToken } from '../utils/middleware/middleware.mjs';
import { logAppointmentHandler } from '../api/logging/logAppointmentHandler.mjs';

const router = Router();

// All routes in this file are protected and require authentication
router.use(authenticateToken);

// Route to handle the submission of a complete appointment log (dental chart + invoice)
router.post('/log-appointment', logAppointmentHandler);

export default router;