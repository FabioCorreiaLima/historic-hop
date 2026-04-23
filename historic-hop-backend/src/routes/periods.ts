import { Router } from "express";
import { PeriodController } from "../controllers/PeriodController.js";

const router = Router();

router.get("/", PeriodController.getAll);
router.get("/:id", PeriodController.getById);
router.post("/", PeriodController.save);

export default router;
