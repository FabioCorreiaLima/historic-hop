import { ProgressRepository } from "../repositories/ProgressRepository.js";

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
}
