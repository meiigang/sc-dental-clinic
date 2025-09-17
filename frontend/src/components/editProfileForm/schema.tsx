import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(1, "Required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Required").max(100),
  suffix: z.enum(["none", "Jr.", "Sr.", "II", "III"]).optional(),
  email: z.string().email(),
  contactNumber: z.string().min(10).max(15),
  password: z.string().optional(),
});

export type Profile = z.infer<typeof profileSchema>;