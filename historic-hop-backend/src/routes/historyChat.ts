import { Router } from "express";
import { ChatController } from "../controllers/ChatController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/history-chat/questions/:periodId
router.get("/questions/:periodId", ChatController.getSuggestedQuestions);

// POST /api/history-chat
router.post("/", optionalAuth, ChatController.sendMessage);

export default router;
