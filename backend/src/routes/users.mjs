//ROUTER API
import {Router} from "express";
import {registerValidation} from "../utils/middleware/validationSchemas.mjs"
import registerHandler from "../api/user/register.mjs"
import {loginValidation} from "../utils/middleare/validationSchemas.mjs";
import loginHandler from "../api/user/login.mjs";

const router = Router();

//LOGIN ROUTING
router.post("/login", loginValidation, loginHandler);

//REGISTER ROUTING
router.post("/register", registerValidation, registerHandler);

export default router;