import { ProgressRepository } from "../repositories/ProgressRepository.js";
import { LessonRepository } from "../repositories/LessonRepository.js";
import { UserLessonProgressRepository } from "../repositories/UserLessonProgressRepository.js";
import { CurriculumRepository, DEFAULT_COURSE_ID } from "../repositories/CurriculumRepository.js";

export class ProgressService {
  static async getUserProgress(userId: string) {
    return await ProgressRepository.getByUser(userId);
  }

  static async completeLevel(userId: string, data: any) {
    const { level, score, stars, percentage, maxCombo, timeSpent } = data;

    // 1. Atualizar progresso do nível
    const progress = await ProgressRepository.updateProgress(userId, {
      level,
      score,
      stars,
      percentage,
      max_combo: maxCombo,
      time_spent: timeSpent
    });

    // 2. Recalcular totais e atualizar ranking
    const userProgress = await ProgressRepository.getByUser(userId);
    const totalScore = userProgress.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const maxLevel = Math.max(...userProgress.map(p => p.level), 0);

    await ProgressRepository.updateRanking(userId, score, maxLevel);

    return {
      success: true,
      totalScore,
      maxLevel,
      currentProgress: progress
    };
  }

  /** Conclui uma lição (modelo tipo Duolingo); atualiza ranking quando aprovação >= 70%. */
  static async completeLesson(userId: string, body: Record<string, unknown>) {
    const lessonId = body.lessonId;
    if (!lessonId || typeof lessonId !== "string") {
      return { success: false, error: "lessonId obrigatório" };
    }

    const score = Number(body.score ?? 0);
    const stars = Number(body.stars ?? 0);
    const percentage = Number(body.percentage ?? 0);
    const maxCombo = Number(body.maxCombo ?? 0);
    const timeSpent = Number(body.timeSpent ?? 0);

    const lesson = await LessonRepository.getById(lessonId);
    if (!lesson) return { success: false, error: "Lição não encontrada" };

    const crown_level = Math.max(0, Math.min(5, stars));
    const lessonProgress = await UserLessonProgressRepository.upsertComplete(userId, lessonId, {
      stars,
      crown_level,
      score,
      percentage,
      time_spent: timeSpent,
    });

    const xpReward = Number(lesson.xp_reward ?? 10);
    const xpGain = percentage >= 70 ? xpReward * Math.max(stars, 1) : 0;

    const periodId = lesson.period_id as string;
    const pathOrder = await CurriculumRepository.getPeriodPathOrder(DEFAULT_COURSE_ID, periodId);
    const legacyLevel = pathOrder != null ? pathOrder + 1 : 1;

    if (xpGain > 0) {
      await ProgressRepository.updateProgress(userId, {
        level: legacyLevel,
        score: xpGain,
        stars,
        percentage,
        max_combo: maxCombo,
        time_spent: timeSpent,
      });
      await ProgressRepository.updateRanking(userId, xpGain, legacyLevel);
    }

    const userProgress = await ProgressRepository.getByUser(userId);
    const totalScore = userProgress.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const maxLevel = Math.max(...userProgress.map((p) => p.level), 0);

    return {
      success: true,
      xpGained: xpGain,
      legacyLevel,
      lessonProgress,
      totalScore,
      maxLevel,
    };
  }

  static async submitMinigameScore(userId: string, data: any) {
    const { score, periodId, minigame } = data;
    
    // Conversão de pontos do jogo para XP (ex: 10% do score vira XP)
    const xpGained = Math.floor(score / 10);
    
    if (xpGained > 0) {
      // Usamos o updateRanking para somar ao total do usuário
      // Para o maxLevel, buscamos o progresso atual
      const userProgress = await ProgressRepository.getByUser(userId);
      const maxLevel = Math.max(...userProgress.map((p) => p.level), 1);
      
      await ProgressRepository.updateRanking(userId, xpGained, maxLevel);
    }

    const updatedProgress = await ProgressRepository.getByUser(userId);
    const totalScore = updatedProgress.reduce((acc, curr) => acc + (curr.score || 0), 0);

    return {
      success: true,
      xpGained,
      totalScore,
      minigame
    };
  }
}
