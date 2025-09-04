import { Router } from "express";
import checkPatientRecordHandler from "../api/patients/checkPatientRecord.mjs";
import { supabaseMiddleware } from "../utils/middleware/middleware.mjs";

const router = Router();

router.use(supabaseMiddleware);

router.get("/check-record/:userId", checkPatientRecordHandler);

export default router;
