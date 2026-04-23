import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { ProgressService } from "../services/ProgressService.js";

export class ProgressController {
  static async getProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Não autenticado" });

      const progress = await ProgressService.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Erro no ProgressController (getProgress):", error);
      res.status(500).json({ error: "Erro ao buscar progresso" });
    }
  }

  static async completeLevel(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Não autenticado" });

      const result = await ProgressService.completeLevel(userId, req.body);
      res.json(result);
    } catch (error) {
      console.error("Erro no ProgressController (completeLevel):", error);
      res.status(500).json({ error: "Erro ao salvar progresso" });
    }
  }
}
