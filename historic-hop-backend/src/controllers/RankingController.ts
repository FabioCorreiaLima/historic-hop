import { Request, Response } from "express";
import { ProgressRepository } from "../repositories/ProgressRepository.js";

export class RankingController {
  static async getRanking(req: Request, res: Response) {
    try {
      const type = (req.query.type as 'total' | 'weekly') || "total";
      const ranking = await ProgressRepository.getRanking(type, 50);
      res.json(ranking);
    } catch (error) {
      console.error("Erro no RankingController:", error);
      res.status(500).json({ error: "Erro ao buscar ranking" });
    }
  }
}
