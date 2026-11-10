import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  if (req.cookies && req.cookies[env.jwtCookieName]) {
    return req.cookies[env.jwtCookieName];
  }
  return null;
}

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw ApiError.unauthorized("Authentication required");
  }

  const payload = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(payload.sub);
  if (!user) {
    throw ApiError.unauthorized("User no longer exists");
  }
  if ((payload.tokenVersion ?? 0) !== user.tokenVersion) {
    throw ApiError.unauthorized("Session has been revoked");
  }

  req.user = user;
  next();
});

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), tokenVersion: user.tokenVersion }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}
