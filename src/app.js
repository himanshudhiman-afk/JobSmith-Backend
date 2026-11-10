import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import { env } from "./config/env.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { generalLimiter } from "./middleware/rateLimiters.js";

import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import mockInterviewRoutes from "./routes/mockInterviewRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(mongoSanitize());

  if (env.nodeEnv !== "test") {
    app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
  }

  app.use("/api/v1", generalLimiter);

  app.get("/api/v1/health", (req, res) => {
    res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
  });

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/resumes", resumeRoutes);
  app.use("/api/v1/analyses", analysisRoutes);
  app.use("/api/v1/interviews", interviewRoutes);
  app.use("/api/v1/mock-interviews", mockInterviewRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
