import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  createInterviewPrep,
  listInterviewPreps,
  getInterviewPrep,
  deleteInterviewPrep,
  toggleQuestionCompleted,
  toggleTaskCompleted
} from "../controllers/interviewController.js";
import {
  createInterviewPrepSchema,
  toggleQuestionSchema,
  toggleTaskSchema
} from "../validators/interviewValidators.js";

const router = Router();

router.use(requireAuth);

router.post("/generate", validateBody(createInterviewPrepSchema), createInterviewPrep);
router.get("/", listInterviewPreps);
router.get("/:id", getInterviewPrep);
router.delete("/:id", deleteInterviewPrep);
router.patch(
  "/:id/questions/:questionId",
  validateBody(toggleQuestionSchema),
  toggleQuestionCompleted
);
router.patch("/:id/tasks/:taskId", validateBody(toggleTaskSchema), toggleTaskCompleted);

export default router;
