import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export const generalLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
});

export const loginLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.loginRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." }
});

export const uploadLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.uploadRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many uploads. Please try again later." }
});

export const aiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.uploadRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests. Please slow down." }
});
