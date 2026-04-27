import { z } from "zod"

export const createProductSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(3),
  price: z.coerce.number().positive(),
  images: z.array(z.url()).min(1),
  categoryId: z.string().min(1),
  stock: z.coerce.number().int().min(0),
})

