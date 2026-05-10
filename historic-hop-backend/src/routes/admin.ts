import { Router } from "express";
import { AdminController } from "../controllers/AdminController.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

// Middleware de proteção global para todas as rotas admin
router.use(authenticateToken, requireAdmin);

router.get("/stats", AdminController.getStats);

// Períodos
router.get("/periods", AdminController.getAllPeriods);
router.post("/periods", AdminController.createPeriod);
router.put("/periods/:id", AdminController.updatePeriod);
router.delete("/periods/:id", AdminController.deletePeriod);

// Atividades
router.get("/activities", AdminController.getActivities);
router.post("/activities", AdminController.createActivity);
router.put("/activities/:id", AdminController.updateActivity);
router.delete("/activities/:id", AdminController.deleteActivity);

// IA
router.post("/generate-activity", AdminController.generateActivity);

// Usuários
router.get("/users", AdminController.getUsers);

export default router;
