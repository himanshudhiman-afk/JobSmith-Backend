import dotenv from "dotenv";

dotenv.config();

const required = ["JWT_SECRET"];

if (process.env.NODE_ENV !== "test") {
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jobprep",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtCookieName: process.env.JWT_COOKIE_NAME || "jobprep_token",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB) || 5,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
  loginRateLimitMax: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
  uploadRateLimitMax: Number(process.env.UPLOAD_RATE_LIMIT_MAX) || 20,
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "Job Prep <no-reply@jobprep.local>"
  }
};
