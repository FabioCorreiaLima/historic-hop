import { Router } from "express";
import { CurriculumController } from "../controllers/CurriculumController.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { AdminCurriculumController } from "../controllers/AdminCurriculumController.js";

const router = Router();

router.get("/", CurriculumController.getPublic);
router.get("/me", authenticateToken, CurriculumController.getMe);
router.post("/lessons", requireAdmin, CurriculumController.createLesson);
router.put("/courses/:courseId/order", requireAdmin, CurriculumController.reorderPeriods);
router.post("/admin/generate-full", requireAdmin, AdminCurriculumController.generateBNCCFullCurriculum);
router.post("/admin/clear-all", requireAdmin, AdminCurriculumController.clearAll);
router.post("/admin/seed-standard", requireAdmin, AdminCurriculumController.seedStandard);

export default router;
