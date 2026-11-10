import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  deleteAccount,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { loginLimiter } from "../middleware/rateLimiters.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", loginLimiter, validateBody(registerSchema), register);
router.post("/login", loginLimiter, validateBody(loginSchema), login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getMe);
router.patch("/profile", requireAuth, validateBody(updateProfileSchema), updateProfile);
router.delete("/account", requireAuth, deleteAccount);
router.post("/forgot-password", loginLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", loginLimiter, validateBody(resetPasswordSchema), resetPassword);

export default router;
