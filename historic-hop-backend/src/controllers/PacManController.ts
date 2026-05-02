import { Request, Response } from "express";
import { PacManService } from "../services/PacManService.js";

export class PacManController {
  /**
   * GET /api/pacman/phase/:periodId
   * Retorna os dados temáticos da fase Pac-Man para um período histórico.
   */
  static getPhaseData = async (req: Request, res: Response) => {
    try {
      const { periodId } = req.params;
      if (!periodId) {
        return res.status(400).json({ error: "periodId é obrigatório" });
      }

      const data = await PacManService.getPhaseData(periodId);
      res.json(data);
    } catch (error) {
      console.error("Erro ao buscar dados da fase Pac-Man:", error);
      res.status(500).json({ error: "Erro ao carregar dados da fase" });
    }
  };
}
