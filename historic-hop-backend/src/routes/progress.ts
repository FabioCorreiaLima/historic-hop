import { Router } from "express";
import { ProgressController } from "../controllers/ProgressController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, ProgressController.getProgress);
router.post("/complete-level", authenticateToken, ProgressController.completeLevel);

export default router;