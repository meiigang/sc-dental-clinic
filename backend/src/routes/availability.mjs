import {Router} from "express";
import availabilityHandler from "../api/availability/availabilityHandler.mjs";
import { authenticateToken } from "../utils/middleware/middleware.mjs";

const router = Router();

//PUT REQUEST
router.put("/", authenticateToken, availabilityHandler);

export default router;