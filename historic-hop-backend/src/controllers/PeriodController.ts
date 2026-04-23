import { Request, Response } from 'express';
import { PeriodService } from '../services/PeriodService.js';

export class PeriodController {
  static async getAll(req: Request, res: Response) {
    try {
      const periods = await PeriodService.getAllPeriods();
      res.json(periods);
    } catch (error) {
      console.error("Erro no PeriodController (getAll):", error);
      res.status(500).json({ error: "Erro ao buscar períodos" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const period = await PeriodService.getPeriodById(id);
      if (!period) return res.status(404).json({ error: "Período não encontrado" });
      res.json(period);
    } catch (error) {
      console.error("Erro no PeriodController (getById):", error);
      res.status(500).json({ error: "Erro ao buscar período" });
    }
  }

  static async save(req: Request, res: Response) {
    try {
      const period = await PeriodService.savePeriod(req.body);
      res.json({ success: true, data: period });
    } catch (error) {
      console.error("Erro no PeriodController (save):", error);
      res.status(500).json({ error: "Erro ao salvar período" });
    }
  }
}
