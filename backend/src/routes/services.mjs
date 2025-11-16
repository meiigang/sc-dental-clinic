import { Router } from "express";
import { getServicesHandler, createServiceHandler, updateServiceHandler, getBillingServicesHandler } from "../api/services/serviceHandler.mjs";
import { supabaseMiddleware } from "../utils/middleware/middleware.mjs";

const router = Router();
router.use(supabaseMiddleware);

//POST method for services
router.post("/", createServiceHandler);

//GET method for services on billing page
router.get("/billing", getBillingServicesHandler);

//GET method for services
router.get("/", getServicesHandler);

//PATCH method for services
router.patch("/:id", updateServiceHandler);


export default router;
