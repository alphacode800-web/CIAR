import { z } from "zod"

const phoneSchema = z.string().trim().regex(/^\+?[0-9]{8,15}$/)

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email().optional(),
  phone: phoneSchema.optional(),
  password: z.string().min(8).max(128),
  role: z.enum(["USER", "ADMIN", "SELLER"]).optional(),
}).refine((data) => Boolean(data.email || data.phone), {
  message: "Either email or phone is required",
  path: ["email"],
})

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(120),
  password: z.string().min(8).max(128),
})

