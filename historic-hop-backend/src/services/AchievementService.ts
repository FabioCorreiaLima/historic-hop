import { AchievementRepository } from "../repositories/AchievementRepository.js";
import { ProgressRepository } from "../repositories/ProgressRepository.js";

export class AchievementService {
  static async checkAndUnlock(userId: string, context: "progress" | "streak" | "quiz") {
    const unlocked = await AchievementRepository.getByUser(userId);
    const unlockedKeys = new Set(unlocked.map(a => a.achievement_key));
    const newAchievements: string[] = [];

    // 1. Verificar progresso de períodos
    if (context === "progress") {
      const progress = await ProgressRepository.getByUser(userId);
      const completedPeriods = progress.filter(p => p.stars > 0).length;

      if (completedPeriods >= 1 && !unlockedKeys.has("first_period")) {
        await this.unlock(userId, "first_period", newAchievements);
      }
      if (completedPeriods >= 3 && !unlockedKeys.has("three_periods")) {
        await this.unlock(userId, "three_periods", newAchievements);
      }
      
      const perfectPeriods = progress.filter(p => p.stars >= 3).length;
      if (perfectPeriods >= 1 && !unlockedKeys.has("perfect_period")) {
        await this.unlock(userId, "perfect_period", newAchievements);
      }
    }

    // 2. Verificar sequências (Streaks) - Poderia ser chamado pelo StreakService
    // ...

    return newAchievements;
  }

  private static async unlock(userId: string, key: string, list: string[]) {
    await AchievementRepository.unlock(userId, key);
    list.push(key);
  }
}
