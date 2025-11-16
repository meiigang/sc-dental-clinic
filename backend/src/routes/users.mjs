//ROUTER API
import {Router} from "express";
import {registerValidation} from "../utils/middleware/validationSchemas.mjs"
import registerHandler, {fullRegistrationHandler} from "../api/users/register.mjs"
import {loginValidation} from "../utils/middleware/validationSchemas.mjs";
import loginHandler from "../api/users/login.mjs";

const router = Router();

//GET USERS (for staff table)
router.get("/", async (req, res) => {
  try {
    const { role } = req.query;
    let query = req.supabase.from("users").select("*");
    
    if (role) {
      query = query.eq("role", role);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
    
    res.json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//LOGIN ROUTING
router.post("/login", loginValidation, loginHandler);

//REGISTER ROUTING
router.post("/", registerValidation, registerHandler); // Add this for staff registration
router.post("/register", registerValidation, registerHandler);
router.post("/register/full", fullRegistrationHandler);

export default router;