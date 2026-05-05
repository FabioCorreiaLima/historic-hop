import { Router } from "express";
import { AdminController } from "../controllers/AdminController.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

router.get("/stats", authenticateToken, requireAdmin, AdminController.getStats);
router.get("/activities", authenticateToken, requireAdmin, AdminController.getActivities);

export default router;
