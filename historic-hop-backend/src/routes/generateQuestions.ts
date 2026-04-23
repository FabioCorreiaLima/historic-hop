import { Router, Request, Response } from "express";
import { ActivityService } from "../services/ActivityService.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { periodId, level = 1, topic, difficulty = "médio" } = req.body;
    if (!periodId) return res.status(400).json({ error: "periodId é obrigatório" });

    const question = await ActivityService.generateSingleQuestion(periodId, level, difficulty, topic);
    res.json(question);
  } catch (error) {
    console.error("Erro ao gerar questão:", error);
    res.status(500).json({ error: "Erro ao gerar questão" });
  }
});

export default router;
