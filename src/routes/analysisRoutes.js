import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  createAnalysis,
  listAnalyses,
  getAnalysis,
  deleteAnalysis,
  addOptimization
} from "../controllers/analysisController.js";
import { createAnalysisSchema, createOptimizationSchema } from "../validators/analysisValidators.js";

const router = Router();

router.use(requireAuth);

router.post("/", validateBody(createAnalysisSchema), createAnalysis);
router.get("/", listAnalyses);
router.get("/:id", getAnalysis);
router.delete("/:id", deleteAnalysis);
router.post("/:id/optimizations", validateBody(createOptimizationSchema), addOptimization);

export default router;
