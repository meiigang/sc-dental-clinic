import { Router } from "express";
import { authenticateToken } from "../utils/middleware/middleware.mjs";
import {
    getAllAppointmentsHandler, 
    updateAppointmentDetailsHandler,
    cancelAppointmentHandler,
    getMyAppointmentsHandler,
    updateAppointmentStatusHandler

} from "../api/appointments/appointmentHandler.mjs";

const router = Router();

// Route for updating an appointment's status

//PATCH METHOD
router.patch("/:id/status", authenticateToken, updateAppointmentDetailsHandler);

//GET METHOD
router.get("/", authenticateToken, getAllAppointmentsHandler);

//GENERAL UPDATE
router.patch("/:id", authenticateToken, updateAppointmentDetailsHandler);

//CANCEL APPOINTMENT
router.patch("/:id/cancel", authenticateToken, cancelAppointmentHandler)

//APPOINTMENT RESCHEDULING
router.patch('/:id', authenticateToken, updateAppointmentDetailsHandler); // This is for rescheduling

//APPOINTMENT STATUS UPDATING
router.patch('/:id/status', authenticateToken, updateAppointmentStatusHandler); // <-- Add this new route


//Patient-side: GET APPOINTMENTS
router.get("/my-appointments", authenticateToken, getMyAppointmentsHandler)

export default router;