import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { StreakService } from "../services/StreakService.js";

export class StreakController {
  static async getStreak(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Não autenticado" });
      const streak = await StreakService.getStreak(userId);
      res.json(streak);
    } catch (error) {
      console.error("Erro no StreakController (get):", error);
      res.status(500).json({ error: "Erro ao buscar streaks" });
    }
  }

  static async recordPractice(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Não autenticado" });
      const result = await StreakService.recordPractice(userId);
      res.json(result);
    } catch (error) {
      console.error("Erro no StreakController (record):", error);
      res.status(500).json({ error: "Erro ao registrar prática" });
    }
  }
}
