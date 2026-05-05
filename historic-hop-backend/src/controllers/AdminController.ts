import { Request, Response } from "express";
import { query } from "../config/database.js";

export class AdminController {
  static async getStats(req: Request, res: Response) {
    try {
      const userCountRes = await query("SELECT COUNT(*) FROM users");
      const activitiesCountRes = await query("SELECT COUNT(*) FROM activities");
      const accuracyRes = await query("SELECT AVG(best_percentage) as avg_accuracy FROM user_lesson_progress");
      
      res.json({
        totalUsers: parseInt(userCountRes.rows[0].count),
        totalActivities: parseInt(activitiesCountRes.rows[0].count),
        avgAccuracy: Math.round(parseFloat(accuracyRes.rows[0].avg_accuracy || "0"))
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas admin:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  }

  static async getActivities(req: Request, res: Response) {
    try {
      const { ActivityRepository } = await import("../repositories/ActivityRepository.js");
      const activities = await ActivityRepository.getAll();
      
      const formatted = activities.map((a: any) => ({
        ...a,
        content: typeof a.content === 'string' ? JSON.parse(a.content) : a.content,
        period: a.periodId // Mapeia periodId para period para o frontend
      }));
      
      res.json(formatted);
    } catch (error) {
      console.error("Erro ao buscar atividades admin:", error);
      res.status(500).json({ error: "Erro ao buscar atividades" });
    }
  }
}
