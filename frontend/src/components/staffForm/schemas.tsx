import { z } from "zod";

export const staffRegistrationSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    middle_name: z.string().optional(),
    suffix: z.string().optional(),
    email: z.string().email("Invalid email address"),
    contact_number: z.string().min(11, "Contact number must be 11 characters").regex(/^[0-9]+$/, "Invalid contact number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
});