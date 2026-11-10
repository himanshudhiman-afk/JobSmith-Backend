import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  createMockInterview,
  getMockInterview,
  listMockInterviews,
  submitAnswer,
  nextQuestion,
  finishMockInterview,
  deleteMockInterview
} from "../controllers/mockInterviewController.js";
import {
  createMockInterviewSchema,
  submitAnswerSchema,
  nextQuestionSchema,
  finishMockInterviewSchema
} from "../validators/mockInterviewValidators.js";

const router = Router();

router.use(requireAuth);

router.post("/", validateBody(createMockInterviewSchema), createMockInterview);
router.get("/", listMockInterviews);
router.get("/:id", getMockInterview);
router.post("/:id/answers", validateBody(submitAnswerSchema), submitAnswer);
router.post("/:id/next-question", validateBody(nextQuestionSchema), nextQuestion);
router.post("/:id/finish", validateBody(finishMockInterviewSchema), finishMockInterview);
router.delete("/:id", deleteMockInterview);

export default router;
