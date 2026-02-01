import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  price: z.number().positive(), // ensure greater than 0
  stock: z.number().int().nonnegative() // allow 0 but never less than 0
})
