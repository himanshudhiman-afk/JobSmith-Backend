import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { resumeUpload } from "../middleware/upload.js";
import { uploadLimiter } from "../middleware/rateLimiters.js";
import { validateBody } from "../middleware/validate.js";
import {
  uploadResume,
  listResumes,
  getResume,
  updateResume,
  updateStructuredContent,
  deleteResume
} from "../controllers/resumeController.js";
import { updateResumeSchema, updateStructuredContentSchema } from "../validators/resumeValidators.js";
import { exportResumePdf } from "../controllers/pdfController.js";

const router = Router();

router.use(requireAuth);

router.post("/", uploadLimiter, resumeUpload, uploadResume);
router.get("/", listResumes);
router.get("/:id", getResume);
router.patch("/:id", validateBody(updateResumeSchema), updateResume);
router.patch("/:id/structured-content", validateBody(updateStructuredContentSchema), updateStructuredContent);
router.delete("/:id", deleteResume);
router.post("/:id/export-pdf", exportResumePdf);

export default router;
