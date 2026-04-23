import { Router } from "express";
import { AchievementController } from "../controllers/AchievementController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, AchievementController.getAchievements);
router.post("/unlock", authenticateToken, AchievementController.unlockAchievement);

export default router;