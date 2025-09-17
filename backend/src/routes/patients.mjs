import { Router } from "express";
import checkPatientRecordHandler from "../api/patients/checkPatientRecord.mjs";
import { supabaseMiddleware } from "../utils/middleware/middleware.mjs";
import { getAllPatientsHandler } from "../api/patients/getAllPatients.mjs";
import { getPatientByIdHandler } from "../api/patients/getPatientById.mjs";

const router = Router();

router.use(supabaseMiddleware);

router.get("/check-record/:userId", checkPatientRecordHandler);

router.get("/all", getAllPatientsHandler);

router.get("/:id", getPatientByIdHandler);

export default router;
