import { body, validationResult } from "express-validator";
import { z } from "zod";

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
  body("first_name")
    .trim()
    .notEmpty().withMessage("First name is required"),
  body("last_name")
    .trim()
    .notEmpty().withMessage("Last name is required"),
  body("middle_name")
    .optional({ checkFalsy: true })
    .trim(),
  body("suffix")
    .optional({ checkFalsy: true }),
  body("email")
    .isEmail().withMessage("Valid email is required"),
  body("contact_number")
    .trim()
    .isLength({ min: 11, max: 11 }).withMessage("Contact number must be exactly 11 digits")
    .isNumeric().withMessage("Contact number must contain only digits"),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirm_password")
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
  body("email")
    .custom(value => {
      // Accept valid email or 11-digit contact number
      return (
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
        /^\d{11}$/.test(value)
      );
    })
    .withMessage("Enter a valid email or 11-digit contact number"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

//Validation schema for patient personal info
export const personalInfoSchema = z.object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    middleName: z.string().optional(),
    suffix: z.enum(["none", "Jr", "Sr", "II", "III"]).optional(),
    birthDate: z.string().refine(
      val => !isNaN(Date.parse(val)),
      { message: "Invalid date" }
    ),
    age: z.string().min(1, "Required"),
    sex: z.string().min(1, "Required"),
    religion: z.string().min(1, "Required"),
    nationality: z.string().min(1, "Required"),
    nickname: z.string().optional(),
    homeAddress: z.string().min(1, "Required"),
    occupation: z.string().optional(),
    dentalInsurance: z.string().optional(),
    effectiveDate: z.string().refine(
      val => !isNaN(Date.parse(val)),
      { message: "Invalid date" }
    ),
    patientSince: z.string().refine(
      val => !isNaN(Date.parse(val)),
      { message: "Invalid date" }
    ),
    emergencyContactName: z.string().min(1, "Required"),
    emergencyContactOccupation: z.string().min(1, "Required"),
    emergencyContactNumber: z.string().min(1, "Required").max(11, "Invalid contact number"),
})

export const dentalHistorySchema = z.object({
   previousDentist: z.string().optional(),
    lastDentalVisit: z.string().refine(
      val => !isNaN(Date.parse(val)),
      { message: "Invalid date" }
    ),
})

export const medicalHistorySchema = z.object({
    physicianName: z.string().optional(),
    officeAddress: z.string().optional(),
    specialty: z.string().optional(),
    officeNumber: z.string().optional(),
    goodHealth: z.boolean(),
    underMedicalTreatment: z.boolean(),
    medicalTreatmentCondition: z.string().optional(),
    hadSurgery: z.boolean(),
    surgeryDetails: z.string().optional(),
    wasHospitalized: z.boolean(),
    hospitalizationDetails: z.string().optional(),
    onMedication: z.boolean(),
    medicationDetails: z.string().optional(),
    usesTobacco: z.boolean(),
    usesDrugs: z.boolean(),
    allergies: z.array(z.string()),
    bleedingTime: z.string().optional(),
    isPregnant: z.boolean(),
    isNursing: z.boolean(),
    isTakingBirthControl: z.boolean(),
    bloodType: z.string().min(1, "Required"),
    bloodPressure: z.string().optional(),
    diseases: z.array(z.string())
});