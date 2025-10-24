import { Router } from "express";
import { fetchUserProfile, updateUserProfile } from "../api/editProfile/editProfileHandler.mjs";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

//GET method
router.get('/:userId', fetchUserProfile);

//PATCH method
router.patch('/:userId', upload.any(), updateUserProfile);

export default router;