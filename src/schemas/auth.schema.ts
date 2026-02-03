import { z } from "zod";

const email = z.email({ message: "Invalid email format" });

export const registerSchema = z.object({
  email,
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  name: z.string().min(3, "Min 3 Character")
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { message: "Password is required" }),
});
