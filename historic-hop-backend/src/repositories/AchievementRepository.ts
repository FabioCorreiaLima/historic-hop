import { query } from "../config/database.js";

export class AchievementRepository {
  static async getByUser(userId: string) {
    const result = await query(
      'SELECT achievement_key FROM user_achievements WHERE "userId" = $1',
      [userId]
    );
    return result.rows;
  }

  static async findOne(userId: string, achievementKey: string) {
    const result = await query(
      'SELECT id FROM user_achievements WHERE "userId" = $1 AND achievement_key = $2',
      [userId, achievementKey]
    );
    return result.rows[0] || null;
  }

  static async unlock(userId: string, achievementKey: string) {
    await query(
      'INSERT INTO user_achievements ("userId", achievement_key) VALUES ($1, $2)',
      [userId, achievementKey]
    );
  }
}
