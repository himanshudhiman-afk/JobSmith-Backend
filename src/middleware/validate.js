import { ApiError } from "../utils/ApiError.js";

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    next(ApiError.badRequest("Validation failed", result.error.flatten().fieldErrors));
    return;
  }
  req.body = result.data;
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    next(ApiError.badRequest("Invalid query parameters", result.error.flatten().fieldErrors));
    return;
  }
  req.query = result.data;
  next();
};
