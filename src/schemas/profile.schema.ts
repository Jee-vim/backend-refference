import { z } from "zod";

export const updateProfleSchema = z.object({
  email: z.email({ message: "Invalid email format" }),
  name: z.string().min(3, "Min 3 Character")
});
