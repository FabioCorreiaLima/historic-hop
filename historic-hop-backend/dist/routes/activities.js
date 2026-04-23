import { Router } from "express";
import { ActivityController } from "../controllers/ActivityController.js";
import { optionalAuth } from "../middleware/auth.js";
const router = Router();
// GET /api/activities - Buscar atividades
router.get("/", optionalAuth, ActivityController.getActivities);
// GET /api/activities/:id - Buscar atividade por ID
router.get("/:id", optionalAuth, ActivityController.getActivityById);
// POST /api/activities/generate - Gerar nova atividade (rota organizada)
router.post("/generate", optionalAuth, ActivityController.generateActivity);
// POST /api/activities/map - Gerar mapa histórico
router.post("/map", optionalAuth, async (req, res) => {
    // TODO: Implement map generation endpoint
    res.json({ message: "Endpoint em desenvolvimento" });
});
// POST /api/activities/avatar - Gerar avatar
router.post("/avatar", optionalAuth, async (req, res) => {
    // TODO: Implement avatar generation endpoint
    res.json({ message: "Endpoint em desenvolvimento" });
});
export default router;
