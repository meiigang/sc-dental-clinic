import { z } from "zod";

export const accountInfoSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    middle_name: z.string().optional(),
    suffix: z.string().optional(),
    email: z.string().email("Invalid email address"),
    contact_number: z.string().min(1, "Contact number is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirm_password: z.string().min(1, "Please confirm your password"),
    }).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
})

export const personalSchema = z.object({
  birthDate: z.date().min(new Date("1900-01-01"), "Invalid date").max(new Date(), "Invalid date"),
  age: z.string().min(1, "Required"),
  sex: z.string().min(1, "Required"),
  religion: z.string().min(1, "Required"),
  nationality: z.string().min(1, "Required"),
  nickname: z.string().optional(),
  homeAddress: z.string().min(1, "Required"),
  occupation: z.string().optional(),
  hasDentalInsurance: z.boolean(),
  dentalInsurance: z.string().optional(),
  effectiveDate: z.date().optional(),
  patientSince: z.date().min(new Date("1900-01-01"), "Invalid date"),
  emergencyContactName: z.string().min(1, "Required"),
  emergencyContactOccupation: z.string().min(1, "Required"),
  emergencyContactNumber: z.string().min(1, "Required").max(11, "Invalid contact number"),
}).superRefine((data, ctx) => {
  if (data.hasDentalInsurance) {
    if (!data.dentalInsurance) {
      ctx.addIssue({
        path: ["dentalInsurance"],
        message: "Please provide your dental insurance details.",
        code: z.ZodIssueCode.custom,
      });
    }
    if (!data.effectiveDate) {
      ctx.addIssue({
        path: ["effectiveDate"],
        message: "Please provide the effective date of your dental insurance.",
        code: z.ZodIssueCode.custom,
      });
    }
  }
});

export const dentistSchema = z.object({
  previousDentist: z.string().optional(),
  lastDentalVisit: z.date().optional(),
});

export const medicalSchema = z.object({
  physicianName: z.string().optional(),
  officeAddress: z.string().optional(),
  specialty: z.string().optional(),
  officeNumber: z.string().optional(),
  goodHealth: z.enum(["yes", "no"]),
  underMedicalTreatment: z.enum(["yes", "no"]),
  medicalTreatmentCondition: z.string().optional(),
  hadSurgery: z.enum(["yes", "no"]),
  surgeryDetails: z.string().optional(),
  wasHospitalized: z.enum(["yes", "no"]),
  hospitalizationDetails: z.string().optional(),
  onMedication: z.enum(["yes", "no"]),
  medicationDetails: z.string().optional(),
  usesTobacco: z.string().optional(),
  usesDrugs: z.string().optional(),
  allergies: z.array(z.string()),
  bleedingTime: z.string().optional(),
  isPregnant: z.enum(["yes", "no"]),
  isNursing: z.enum(["yes", "no"]),
  isTakingBirthControl: z.enum(["yes", "no"]),
  bloodType: z.string().min(1, "Required"),
  bloodPressure: z.string().optional(),
  diseases: z.array(z.string())
}).superRefine((data, ctx) => {
  if (data.underMedicalTreatment === "yes" && !data.medicalTreatmentCondition) {
    ctx.addIssue({
      path: ["medicalTreatmentCondition"],
      message: "Please specify the condition being treated.",
      code: z.ZodIssueCode.custom,
    });
  }
  if (data.hadSurgery === "yes" && !data.surgeryDetails) {
    ctx.addIssue({
      path: ["surgeryDetails"],
      message: "Please specify the surgery details.",
      code: z.ZodIssueCode.custom,
    });
  }
  if (data.wasHospitalized === "yes" && !data.hospitalizationDetails) {
    ctx.addIssue({
      path: ["hospitalizationDetails"],
      message: "Please specify when and why.",
      code: z.ZodIssueCode.custom,
    });
  }
  if (data.onMedication === "yes" && !data.medicationDetails) {
    ctx.addIssue({
      path: ["medicationDetails"],
      message: "Please specify your current medication.",
      code: z.ZodIssueCode.custom,
    });
  }
});