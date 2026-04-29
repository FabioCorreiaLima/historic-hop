import { Router } from "express";
import { PeriodController } from "../controllers/PeriodController.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

router.get("/", PeriodController.getAll);
router.get("/:id", PeriodController.getById);
router.post("/", requireAdmin, PeriodController.save);

export default router;
