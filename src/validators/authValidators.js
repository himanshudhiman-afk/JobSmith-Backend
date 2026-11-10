import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  password: z.string().min(8).max(100)
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100)
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  preferences: z
    .object({
      targetRole: z.string().trim().max(120).optional(),
      experienceLevel: z.enum(["student", "entry", "mid", "senior", "lead"]).optional(),
      preferredPace: z.enum(["relaxed", "steady", "intensive"]).optional(),
      theme: z.enum(["light", "dark", "system"]).optional()
    })
    .partial()
    .optional()
});
