import { query } from "../config/database.js";

export class ProgressRepository {
  static async getByUser(userId: string) {
    const result = await query(
      "SELECT * FROM user_progress WHERE user_id = $1 ORDER BY level ASC",
      [userId]
    );
    return result.rows;
  }

  static async updateProgress(userId: string, data: any) {
    const { level, score, stars, percentage, max_combo, time_spent } = data;
    
    const result = await query(
      `INSERT INTO user_progress 
      (user_id, level, score, stars, percentage, max_combo, time_spent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, level) DO UPDATE SET
      score = GREATEST(user_progress.score, EXCLUDED.score),
      stars = GREATEST(user_progress.stars, EXCLUDED.stars),
      percentage = GREATEST(user_progress.percentage, EXCLUDED.percentage),
      max_combo = GREATEST(user_progress.max_combo, EXCLUDED.max_combo),
      time_spent = user_progress.time_spent + EXCLUDED.time_spent,
      "updatedAt" = CURRENT_TIMESTAMP
      RETURNING *`,
      [userId, level, score, stars, percentage, max_combo, time_spent]
    );
    
    return result.rows[0];
  }

  static async getRanking(type: 'total' | 'weekly' = 'total', limit: number = 20) {
    const orderBy = type === 'weekly' ? 'weekly_score' : 'total_score';
    const result = await query(
      `SELECT r.*, u.name as display_name, u.avatar as avatar_url 
       FROM ranking r 
       JOIN users u ON r.user_id = u.id 
       ORDER BY ${orderBy} DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  static async updateRanking(userId: string, score: number, level: number) {
    await query(
      `INSERT INTO ranking (user_id, total_score, weekly_score, max_level)
       VALUES ($1, $2, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET
       total_score = ranking.total_score + EXCLUDED.total_score,
       weekly_score = ranking.weekly_score + EXCLUDED.weekly_score,
       max_level = GREATEST(ranking.max_level, EXCLUDED.max_level),
       "updatedAt" = CURRENT_TIMESTAMP`,
      [userId, score, level]
    );
  }
}
