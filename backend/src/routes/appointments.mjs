import { Router } from "express";
import { authenticateToken } from "../utils/middleware/middleware.mjs";
import {
    getAllAppointmentsHandler, 
    updateAppointmentDetailsHandler,
    getMyAppointmentsHandler,
    confirmRescheduleHandler,
    declineRescheduleHandler,
} from "../api/appointments/appointmentHandler.mjs";

const router = Router();

// --- GET ROUTES ---

// GET all appointments (for staff view, can be filtered by patientId)
router.get("/", authenticateToken, getAllAppointmentsHandler);

// GET appointments for the logged-in patient
router.get("/my-appointments", authenticateToken, getMyAppointmentsHandler);


// --- ACTION ROUTES ---

// Handles rescheduling, status changes (confirm, complete, cancel), etc.
router.patch("/:id", authenticateToken, updateAppointmentDetailsHandler);

// --- PATIENT RESCHEDULE RESPONSE ROUTES ---

// For a patient to CONFIRM a reschedule request from the clinic
router.post("/:id/confirm-reschedule", authenticateToken, confirmRescheduleHandler);

// For a patient to DECLINE a reschedule request from the clinic
router.post("/:id/decline-reschedule", authenticateToken, declineRescheduleHandler);


export default router;