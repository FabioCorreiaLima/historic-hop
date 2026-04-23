import { query } from "../config/database.js";

export class StreakRepository {
  static async getByUser(userId: string) {
    const result = await query(
      "SELECT current_streak, best_streak, last_practice_date FROM user_streaks WHERE user_id = $1",
      [userId]
    );
    return result.rows[0] || null;
  }

  static async initStreak(userId: string) {
    await query(
      "INSERT INTO user_streaks (user_id, current_streak, best_streak) VALUES ($1, 0, 0)",
      [userId]
    );
    return { current_streak: 0, best_streak: 0, last_practice_date: null };
  }

  static async upsertStreak(userId: string, currentStreak: number, bestStreak: number, today: string) {
    await query(
      `INSERT INTO user_streaks (user_id, current_streak, best_streak, last_practice_date)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET current_streak = $2, best_streak = $3, last_practice_date = $4, updated_at = CURRENT_TIMESTAMP`,
      [userId, currentStreak, bestStreak, today]
    );
  }
}
