import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../middleware/auth.js";
import { env } from "../config/env.js";
import { sendPasswordResetEmail, isEmailConfigured } from "../services/emailService.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function setAuthCookie(res, token) {
  res.cookie(env.jwtCookieName, token, COOKIE_OPTIONS);
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(user);
  setAuthCookie(res, token);

  res.status(201).json({ success: true, data: { user: user.toSafeJSON(), token } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken(user);
  setAuthCookie(res, token);

  res.json({ success: true, data: { user: user.toSafeJSON(), token } });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.jwtCookieName, { ...COOKIE_OPTIONS, maxAge: undefined });
  res.json({ success: true, data: null });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, preferences } = req.body;

  if (name !== undefined) req.user.name = name;
  if (preferences !== undefined) {
    req.user.preferences = { ...req.user.preferences.toObject(), ...preferences };
  }
  await req.user.save();

  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const { Resume } = await import("../models/Resume.js");
  const { JobAnalysis } = await import("../models/JobAnalysis.js");
  const { InterviewPreparation } = await import("../models/InterviewPreparation.js");
  const { MockInterview } = await import("../models/MockInterview.js");

  const ownerId = req.user._id;
  await Promise.all([
    Resume.deleteMany({ owner: ownerId }),
    JobAnalysis.deleteMany({ owner: ownerId }),
    InterviewPreparation.deleteMany({ owner: ownerId }),
    MockInterview.deleteMany({ owner: ownerId }),
    User.deleteOne({ _id: ownerId })
  ]);

  res.clearCookie(env.jwtCookieName, { ...COOKIE_OPTIONS, maxAge: undefined });
  res.json({ success: true, data: null });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  const genericResponse = {
    success: true,
    data: {
      message: isEmailConfigured()
        ? "If an account exists for that email, a reset link has been sent."
        : "Email delivery is not configured in this environment. Check the server console for the reset link (development fallback)."
    }
  };

  if (!user) {
    res.json(genericResponse);
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${env.clientOrigin}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail({ to: user.email, resetUrl });

  res.json(genericResponse);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() }
  }).select("+resetPasswordTokenHash +resetPasswordExpires");

  if (!user) {
    throw ApiError.badRequest("Reset link is invalid or has expired");
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  user.tokenVersion += 1;
  await user.save();

  res.json({ success: true, data: { message: "Password has been reset. Please log in." } });
});
