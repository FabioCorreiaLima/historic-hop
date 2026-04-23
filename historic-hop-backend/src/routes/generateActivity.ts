import { Router } from "express";
import { ActivityController } from "../controllers/ActivityController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/generate-activity
router.post("/", optionalAuth, ActivityController.generateActivity);

// POST /api/generate-activity/generate-batch
router.post("/generate-batch", optionalAuth, ActivityController.generateBatch);

export default router;
