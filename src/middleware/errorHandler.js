import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details;

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => e.message);
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with that value already exists";
    details = err.keyValue;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier";
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired session";
  }

  if (statusCode >= 500) {
    console.error("[error]", err);
  }

  const payload = { success: false, message };
  if (details) payload.details = details;
  if (process.env.NODE_ENV === "development" && statusCode >= 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

export { ApiError };
