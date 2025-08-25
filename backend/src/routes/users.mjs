//ROUTER API
import {Router} from "express";
import {registerValidation} from "../utils/middleware/validationSchemas.mjs"
import registerHandler from "../api/users/register.mjs"
import {loginValidation} from "../utils/middleware/validationSchemas.mjs";
import loginHandler from "../api/users/login.mjs";

const router = Router();

//LOGIN ROUTING
router.post("/login", loginValidation, loginHandler);

//REGISTER ROUTING
router.post("/register", registerValidation, registerHandler);

export default router;