import { Request, Response } from 'express';
import { ActivityService } from '../services/ActivityService.js';
import { ActivityRepository } from '../repositories/ActivityRepository.js';

export class ActivityController {
  private static formatActivity(activity: any) {
    if (!activity) return null;
    return {
      ...activity,
      content: typeof activity.content === 'string' ? JSON.parse(activity.content) : activity.content,
      // Garantir compatibilidade de camelCase que o PostgreSQL às vezes retorna em lowercase
      imageUrl: activity.imageUrl || activity.imageurl || activity.image_url,
      mapUrl: activity.mapUrl || activity.mapurl || activity.map_url,
      avatarUrl: activity.avatarUrl || activity.avatarurl || activity.avatar_url,
      audioUrl: activity.audioUrl || activity.audiourl || activity.audio_url,
      videoUrl: activity.videoUrl || activity.videourl || activity.video_url,
    };
    console.log("Atividade formatada para resposta:", activity);
  }

  // Métodos estáticos usados como handlers de rota precisam ser arrow functions
  // para preservar o contexto de `this` quando chamados pelo Express
  static generateActivity = async (req: Request, res: Response) => {
    try {
      const options = req.body;
      const activity = await ActivityService.generateSingleActivity(options);
      res.json(ActivityController.formatActivity(activity));
    } catch (error) {
      console.error("Erro no Controller de Geração:", error);
      res.status(500).json({ error: "Falha ao gerar atividade" });
    }
  };

  static generateBatch = async (req: Request, res: Response) => {
    try {
      const { periodId, count = 5, level = 1, difficulty = "Fácil" } = req.body;
      const activities = await ActivityService.generateBatch(periodId, count, level, difficulty);
      res.json(activities.map((a: any) => ActivityController.formatActivity(a)));
    } catch (error) {
      console.error("Erro no Controller de Lote:", error);
      console.log(res);
      res.status(500).json({ error: "Falha ao gerar lote de atividades" });
    }
  };

  static getActivities = async (req: Request, res: Response) => {
    try {
      const { periodId, limit } = req.query;
      const activities = await ActivityRepository.getByPeriod(periodId as string, Number(limit) || 10);
      res.json(activities.map((a: any) => ActivityController.formatActivity(a)));
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      res.status(500).json({ error: "Erro ao buscar atividades" });
    }
  };

  static getActivityById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const activity = await ActivityRepository.getById(id);
      if (!activity) return res.status(404).json({ error: "Atividade não encontrada" });
      res.json(ActivityController.formatActivity(activity));
    } catch (error) {
      console.error("Erro ao buscar atividade por ID:", error);
      res.status(500).json({ error: "Erro ao buscar atividade" });
    }
  };
}
