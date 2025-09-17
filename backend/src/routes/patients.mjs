import { Router } from "express";
import checkPatientRecordHandler from "../api/patients/checkPatientRecord.mjs";
import { supabaseMiddleware } from "../utils/middleware/middleware.mjs";
import { getAllPatientsHandler } from "../api/patients/getAllPatients.mjs";

const router = Router();

router.use(supabaseMiddleware);

router.get("/check-record/:userId", checkPatientRecordHandler);

router.get("/all", getAllPatientsHandler);

export default router;
