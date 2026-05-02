import { Router } from "express";
import { PacManController } from "../controllers/PacManController.js";

const router = Router();

// GET /api/pacman/phase/:periodId
router.get("/phase/:periodId", PacManController.getPhaseData);

export default router;
