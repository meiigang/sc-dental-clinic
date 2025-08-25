import { body, validationResult } from "express-validator";

export default async function registerHandler(req, res) {
    console.log("Incoming registration data:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
  }

//Validation schema for registration 
export const registerValidation = [
  body("firstName")
    .trim()
    .notEmpty().withMessage("First name is required"),
  body("lastName")
    .trim()
    .notEmpty().withMessage("Last name is required"),
  body("middleName")
    .trim()
    .notEmpty().withMessage("Middle name is required"),
  body("nameSuffix")
    .optional({ checkFalsy: true })
    .custom((value) => !value || nameCase(value)).withMessage("Suffix must start with an uppercase letter"),
  body("email")
    .isEmail().withMessage("Valid email is required"),
  body("contactNumber")
    .trim()
    .isLength({ min: 11, max: 11 }).withMessage("Contact number must be exactly 11 digits")
    .isNumeric().withMessage("Contact number must contain only digits"),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

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