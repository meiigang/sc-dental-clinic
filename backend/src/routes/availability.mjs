import {Router} from "express";
import updateAvailabilityHandler from "../api/availability/availabilityHandler.mjs";
import { getAvailabilityHandler } from "../api/availability/availabilityHandler.mjs";
import { authenticateToken } from "../utils/middleware/middleware.mjs";

const router = Router();

//PUT REQUEST
router.put("/", authenticateToken, updateAvailabilityHandler);

//GET REQUEST
router.get("/", authenticateToken, getAvailabilityHandler);

export default router;