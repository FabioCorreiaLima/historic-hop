import { Router } from "express";
import { ProgressController } from "../controllers/ProgressController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, ProgressController.getProgress);
router.post("/complete-level", authenticateToken, ProgressController.completeLevel);
router.post("/complete-lesson", authenticateToken, ProgressController.completeLesson);
router.post("/minigame", authenticateToken, ProgressController.submitMinigameScore);

export default router;