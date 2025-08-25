import { body, validationResult } from "express-validator";

//Validation schema for registration 
export const registerValidation = [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("middleName").trim().notEmpty().withMessage("Middle name is required"),
    body("suffix").trim().notEmpty().withMessage("Suffix is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("contact").trim().notEmpty().withMessage("Contact number is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
    
    //Middleware to handle validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        next
    }
]

//Validation schema for login
export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
]