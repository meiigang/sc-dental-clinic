import { Router } from "express";
import { authenticateToken } from "../utils/middleware/middleware.mjs";
import { updateAppointmentStatusHandler, 
    getAllAppointmentsHandler, 
    updateAppointmentDetailsHandler,
    getMyAppointmentsHandler } from "../api/appointments/appointmentHandler.mjs";

const router = Router();

// Route for updating an appointment's status

//PATCH METHOD
router.patch("/:id/status", authenticateToken, updateAppointmentStatusHandler);

//GET METHOD
router.get("/", authenticateToken, getAllAppointmentsHandler);

//GENERAL UPDATE
router.patch("/:id", authenticateToken, updateAppointmentDetailsHandler);

//Patient-side: GET APPOINTMENTS
router.get("/my-appointments", authenticateToken, getMyAppointmentsHandler)

export default router;