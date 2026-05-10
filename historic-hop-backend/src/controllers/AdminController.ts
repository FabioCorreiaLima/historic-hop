import { Request, Response } from "express";
import { query } from "../config/database.js";
import { ActivityRepository } from "../repositories/ActivityRepository.js";
import { PeriodRepository } from "../repositories/PeriodRepository.js";
import { ActivityService } from "../services/ActivityService.js";
import { AIService } from "../services/AIService.js";
import crypto from "crypto";

export class AdminController {
  // Statistics
  static async getStats(req: Request, res: Response) {
    try {
      const userCountRes = await query("SELECT COUNT(*) FROM users");
      const activitiesCountRes = await query("SELECT COUNT(*) FROM activities");
      const accuracyRes = await query("SELECT AVG(best_percentage) as avg_accuracy FROM user_lesson_progress");
      const periodCountRes = await query("SELECT COUNT(*) FROM historical_periods");
      
      res.json({
        totalUsers: parseInt(userCountRes.rows[0].count),
        totalActivities: parseInt(activitiesCountRes.rows[0].count),
        totalPeriods: parseInt(periodCountRes.rows[0].count),
        avgAccuracy: Math.round(parseFloat(accuracyRes.rows[0].avg_accuracy || "0"))
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas admin:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const usersRes = await query("SELECT id, email, name, avatar, is_admin, created_at FROM users ORDER BY created_at DESC");
      res.json(usersRes.rows);
    } catch (error) {
      console.error("Erro ao buscar usuários admin:", error);
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  }

  // --- PERIODS CRUD ---
  static async getAllPeriods(req: Request, res: Response) {
    try {
      const periods = await PeriodRepository.getAll();
      res.json(periods);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar períodos" });
    }
  }

  static async createPeriod(req: Request, res: Response) {
    try {
      const period = await PeriodRepository.save(req.body);
      res.json(period);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar período" });
    }
  }

  static async updatePeriod(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const period = await PeriodRepository.save({ ...req.body, id });
      res.json(period);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar período" });
    }
  }

  static async deletePeriod(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PeriodRepository.delete(id);
      res.json({ message: "Período excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir período" });
    }
  }

  // --- ACTIVITIES CRUD ---
  static async getActivities(req: Request, res: Response) {
    try {
      const { periodId, type } = req.query;
      let activities;
      
      if (periodId) {
        activities = await ActivityRepository.getByPeriod(periodId as string, 100);
      } else {
        activities = await ActivityRepository.getAll();
      }

      if (type) {
        activities = activities.filter((a: any) => a.type === type);
      }
      
      const formatted = activities.map((a: any) => ({
        ...a,
        content: typeof a.content === 'string' ? JSON.parse(a.content) : a.content,
      }));
      
      res.json(formatted);
    } catch (error) {
      console.error("Erro ao buscar atividades admin:", error);
      res.status(500).json({ error: "Erro ao buscar atividades" });
    }
  }

  static async createActivity(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.id) data.id = crypto.randomUUID();
      const activity = await ActivityRepository.save(data);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar atividade" });
    }
  }

  static async updateActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const activity = await ActivityRepository.update(id, req.body);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar atividade" });
    }
  }

  static async deleteActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ActivityRepository.delete(id);
      res.json({ message: "Atividade excluída com sucesso" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir atividade" });
    }
  }

  // --- IA GENERATION ---
  static async generateActivity(req: Request, res: Response) {
    try {
      const { periodId, type, level } = req.body;
      const period = await PeriodRepository.getById(periodId);
      if (!period) return res.status(404).json({ error: "Período não encontrado" });

      const activityService = (await import("../services/ActivityService.js")).ActivityService;
      const difficulty = (await import("../services/DifficultyService.js")).DifficultyService.getTierName(level || 1);
      
      // Chamamos apenas o gerador de conteúdo, sem salvar
      const prompt = (activityService as any).getActivityPrompt(type, period.name, level || 1);
      const systemPrompt = `Você é um especialista em História sobre o período: ${period.name}. Responda APENAS com JSON válido em português brasileiro. Nível: ${level || 1}, Dificuldade: ${difficulty}`;
      
      const content = await AIService.generateText(`${systemPrompt}\n\n${prompt}\n\nJSON:`, 1500);
      const activityData = AIService.extractJSON(content);
      
      res.json(activityData);
    } catch (error) {
      console.error("Erro ao gerar atividade com IA:", error);
      res.status(500).json({ error: "Erro ao gerar atividade com IA" });
    }
  }
}
