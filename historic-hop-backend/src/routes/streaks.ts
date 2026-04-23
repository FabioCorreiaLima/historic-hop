import { Router } from "express";
import { StreakController } from "../controllers/StreakController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, StreakController.getStreak);
router.post("/record", authenticateToken, StreakController.recordPractice);

export default router;