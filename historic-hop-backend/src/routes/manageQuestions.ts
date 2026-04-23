import { Router } from "express";
import { QuestionController } from "../controllers/QuestionController.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = Router();

// GET é público (leitura de perguntas para o quiz)
router.get("/", optionalAuth, QuestionController.getQuestions);

// Operações de escrita exigem autenticação
router.post("/", authenticateToken, QuestionController.createQuestion);
router.put("/", authenticateToken, QuestionController.updateQuestion);
router.delete("/", authenticateToken, QuestionController.deleteQuestion);

export default router;
