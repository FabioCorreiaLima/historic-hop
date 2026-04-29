import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { CurriculumService } from "../services/CurriculumService.js";
import { CurriculumRepository, DEFAULT_COURSE_ID } from "../repositories/CurriculumRepository.js";
import { LessonRepository } from "../repositories/LessonRepository.js";

export class CurriculumController {
  static async getPublic(req: Request, res: Response) {
    try {
      const courseId = (req.query.courseId as string) || DEFAULT_COURSE_ID;
      const data = await CurriculumService.getPublicPath(courseId);
      if (!data) return res.status(404).json({ error: "Curso não encontrado" });
      res.json(data);
    } catch (error) {
      console.error("CurriculumController.getPublic:", error);
      res.status(500).json({ error: "Erro ao carregar currículo" });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Não autenticado" });

      const courseId = (req.query.courseId as string) || DEFAULT_COURSE_ID;
      const data = await CurriculumService.getPathForUser(userId, courseId);
      if (!data) return res.status(404).json({ error: "Curso não encontrado" });
      res.json(data);
    } catch (error) {
      console.error("CurriculumController.getMe:", error);
      res.status(500).json({ error: "Erro ao carregar currículo" });
    }
  }

  static async createLesson(req: AuthRequest, res: Response) {
    try {
      const { id, periodId, title, orderIndex, xpReward } = req.body;
      if (!id || !periodId || !title) {
        return res.status(400).json({ error: "id, periodId e title são obrigatórios" });
      }
      const row = await LessonRepository.create({
        id,
        period_id: periodId,
        title,
        order_index: orderIndex ?? 0,
        xp_reward: xpReward ?? 10,
      });
      res.status(201).json({ success: true, lesson: row });
    } catch (error) {
      console.error("CurriculumController.createLesson:", error);
      res.status(500).json({ error: "Erro ao criar lição" });
    }
  }

  static async reorderPeriods(req: AuthRequest, res: Response) {
    try {
      const courseId = req.params.courseId || DEFAULT_COURSE_ID;
      const { periodIds } = req.body as { periodIds?: string[] };
      if (!Array.isArray(periodIds) || periodIds.length === 0) {
        return res.status(400).json({ error: "periodIds deve ser um array não vazio" });
      }
      await CurriculumRepository.setPeriodOrder(courseId, periodIds);
      res.json({ success: true });
    } catch (error) {
      console.error("CurriculumController.reorderPeriods:", error);
      res.status(500).json({ error: "Erro ao reordenar períodos" });
    }
  }
}
