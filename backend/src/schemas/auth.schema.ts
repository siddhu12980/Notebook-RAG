import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});
