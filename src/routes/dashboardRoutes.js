import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDashboardSummary, getDashboardActivity } from "../controllers/dashboardController.js";

const router = Router();

router.use(requireAuth);

router.get("/summary", getDashboardSummary);
router.get("/activity", getDashboardActivity);

export default router;
