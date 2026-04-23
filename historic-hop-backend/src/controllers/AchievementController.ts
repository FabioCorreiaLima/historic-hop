import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { AchievementRepository } from "../repositories/AchievementRepository.js";

export class AchievementController {
  static async getAchievements(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Não autenticado" });
      const rows = await AchievementRepository.getByUser(userId);
      res.json(rows.map(r => ({ achievement_key: r.achievement_key })));
    } catch (error) {
      console.error("Erro no AchievementController (get):", error);
      res.status(500).json({ error: "Erro ao buscar conquistas" });
    }
  }

  static async unlockAchievement(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Não autenticado" });

      const { achievement_key } = req.body;
      if (!achievement_key) return res.status(400).json({ error: "achievement_key é obrigatório" });

      const existing = await AchievementRepository.findOne(userId, achievement_key);
      if (existing) return res.json({ success: true, alreadyUnlocked: true });

      await AchievementRepository.unlock(userId, achievement_key);
      res.json({ success: true, alreadyUnlocked: false });
    } catch (error) {
      console.error("Erro no AchievementController (unlock):", error);
      res.status(500).json({ error: "Erro ao desbloquear conquista" });
    }
  }
}
