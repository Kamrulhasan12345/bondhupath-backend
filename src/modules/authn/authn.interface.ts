import z from "zod";

export const registerRequestBodySchema = {
  email: z.email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  gender: z.enum(['male', 'female']),
  role: z.enum(['student', 'teacher', 'staff']),
  buet_id: z.string().min(1),
  department: z.enum(["CSE", "EEE", "BME", "ME", "MME", "IPE", "WRE", "NAME", "CE", "URP", "CHE", "NCE", "PMRE", "CHEM", "MATH", "PHYS", "HUM", "ARCH"]),
}

export const loginRequestBodySchema = {
  buet_id: z.string().min(1),
  password: z.string().min(6),
}
