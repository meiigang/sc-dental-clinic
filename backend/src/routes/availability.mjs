import { Router } from "express";
import updateAvailabilityHandler from "../api/availability/availabilityHandler.mjs"
import { 
    getAvailabilityHandler,
    getBookedDatesHandler,
    getUnavailableSlotsHandler,
    getAvailableWorkdaysHandler,
    getStaffAvailabilityForDate,
    getSharedAvailabilityHandler
} from "../api/availability/availabilityHandler.mjs";
import { authenticateToken } from "../utils/middleware/middleware.mjs";

const router = Router();

// Staff-only routes (protected)
router.get("/", authenticateToken, getAvailabilityHandler);
router.put("/", authenticateToken, updateAvailabilityHandler);

// --- NEW PUBLIC ROUTES FOR RESERVATION FORM ---
// These are public because any visitor needs to see what's available.
router.get("/booked-dates", getBookedDatesHandler);
router.get("/unavailable-slots", getUnavailableSlotsHandler); // 2. Add the new route
router.get('/available-workdays', getAvailableWorkdaysHandler);
router.get('/staff-slots', getStaffAvailabilityForDate);
router.get("/shared", getSharedAvailabilityHandler);

export default router;