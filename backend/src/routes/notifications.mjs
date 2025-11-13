import { Router } from 'express';
import { getNotification, markAsRead } from '../api/notifications/notificationsHandler.mjs';
import { authenticateToken } from '../utils/middleware/middleware.mjs';

const router = Router();

router.use(authenticateToken);

// Handles GET requests to /api/notifications/
router.get('/', getNotification); 

// Handles PATCH requests to /api/notifications/:id/read
router.patch('/:id/read', markAsRead);

export default router;