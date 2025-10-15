import {Router} from "express";
import reserveAppointmentHandler from "../api/reservation/reserveAppointmentHandler.mjs";
import { authenticateToken } from "../utils/middleware/middleware.mjs";

const router = Router();

//POST Request
router.post("/reserve-appointment", authenticateToken, reserveAppointmentHandler);

export default router;