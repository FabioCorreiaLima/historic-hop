import { StreakRepository } from "../repositories/StreakRepository.js";

export class StreakService {
  static async getStreak(userId: string) {
    let row = await StreakRepository.getByUser(userId);
    if (!row) {
      row = await StreakRepository.initStreak(userId);
    }
    return {
      currentStreak: row.current_streak,
      bestStreak: row.best_streak,
      lastPracticeDate: row.last_practice_date
    };
  }

  static async recordPractice(userId: string) {
    const now = new Date();
    // Formata como YYYY-MM-DD em UTC para consistência
    const today = now.toISOString().split("T")[0];
    const yesterdayDate = new Date(now.getTime() - 86400000);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    const row = await StreakRepository.getByUser(userId);

    let currentStreak = 1;
    let bestStreak = 1;

    if (row) {
      const current = row.current_streak ?? 0;
      const best = row.best_streak ?? 0;

      // last_practice_date pode vir como Date ou string do PostgreSQL - normalizar
      let lastDate: string | null = null;
      if (row.last_practice_date) {
        if (row.last_practice_date instanceof Date) {
          lastDate = row.last_practice_date.toISOString().split("T")[0];
        } else {
          // Pode vir como string "YYYY-MM-DD" ou "YYYY-MM-DDT..."
          lastDate = String(row.last_practice_date).split("T")[0];
        }
      }

      // Já praticou hoje, retorna sem alterar
      if (lastDate === today) {
        return { currentStreak: current, bestStreak: best };
      }

      // Continua o streak se praticou ontem, senão reinicia
      currentStreak = lastDate === yesterday ? current + 1 : 1;
      bestStreak = Math.max(currentStreak, best);
    }

    await StreakRepository.upsertStreak(userId, currentStreak, bestStreak, today);
    return { currentStreak, bestStreak };
  }
}
