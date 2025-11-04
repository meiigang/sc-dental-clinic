import { Router } from "express";
import { getNotification, markAsRead } from '../api/notifications/notificationsHandler.mjs';
import router from "./users.mjs";

//GET Method
router.get('/', getNotification);

//UPDATE Method
router.patch('/:id/read', markAsRead);

export default router;