import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(128),
  role: z.enum(["USER", "ADMIN", "SELLER"]).optional(),
})

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
})

