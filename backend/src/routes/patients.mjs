import { Router } from "express";
import checkPatientRecordHandler from "../api/patients/checkPatientRecord.mjs";
import { supabaseMiddleware } from "../utils/middleware/middleware.mjs";
import { getAllPatientsHandler } from "../api/patients/getAllPatients.mjs";
import { getPatientByIdHandler } from "../api/patients/getPatientById.mjs";
import patientPersonalInfoHandler  from "../api/patients/patientPersonalInfo.mjs";
import {getPatientPersonalInfoHandler} from "../api/patients/patientPersonalInfo.mjs";
import {updatePatientPersonalInfoHandler} from "../api/patients/patientPersonalInfo.mjs";
import patientDentalHistoryHandler from "../api/patients/patientDentalHistory.mjs";
import { getPatientDentalHistory} from "../api/patients/patientDentalHistory.mjs";
import { updatePatientDentalHistory } from  "../api/patients/patientDentalHistory.mjs";
import patientMedicalHistoryHandler from "../api/patients/patientMedicalHistory.mjs";
import { getPatientMedicalHistory } from "../api/patients/patientMedicalHistory.mjs";
import { updatePatientMedicalHistory } from "../api/patients/patientMedicalHistory.mjs";
import { getPatientChartHistory } from '../api/patients/patientChartHandler.mjs';
import { getPatientBillingHistory } from '../api/billing/billingHistoryHandler.mjs';

const router = Router();
router.use(supabaseMiddleware);

// --- Specific text-based routes must come BEFORE general routes with parameters ---
router.get("/check-record/:userId", checkPatientRecordHandler);
router.get("/all", getAllPatientsHandler);
router.get('/billing-history/:userId', getPatientBillingHistory); // This is the route for the summary list

// --- General routes with parameters like /:id come AFTER ---
router.get("/:id", getPatientByIdHandler);
router.get('/:id/chart-history', getPatientChartHistory);

//POST to create patient personal info
router.post("/patientPersonalInfo", patientPersonalInfoHandler);

//GET patient personal info
router.get("/patientPersonalInfo/:userId", getPatientPersonalInfoHandler);

//PATCH patient personal info
router.patch("/patientPersonalInfo/:userId", updatePatientPersonalInfoHandler);

//POST to create dental history info
router.post("/patientDentalHistory", patientDentalHistoryHandler);

//GET patient dental info
router.get("/patientDentalHistory/:patientId", getPatientDentalHistory);

//PATCH patient dental info
router.patch("/patientDentalHistory/:dentalHistoryId", updatePatientDentalHistory);

//POST to create medical history info
router.post("/patientMedicalHistory", patientMedicalHistoryHandler);

//GET patient medical info
router.get("/patientMedicalHistory/:patientId", getPatientMedicalHistory);

//PATCH patient medical info
router.patch("/patientMedicalHistory/:medicalHistoryId", updatePatientMedicalHistory);

export default router;
