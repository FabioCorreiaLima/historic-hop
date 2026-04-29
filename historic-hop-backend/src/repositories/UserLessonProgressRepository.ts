import { query } from "../config/database.js";

export class UserLessonProgressRepository {
  static async getByUser(userId: string) {
    const result = await query(`SELECT * FROM user_lesson_progress WHERE user_id = $1`, [userId]);
    return result.rows;
  }

  static async upsertComplete(
    userId: string,
    lessonId: string,
    data: {
      stars: number;
      crown_level: number;
      score: number;
      percentage: number;
      time_spent: number;
    }
  ) {
    const { stars, crown_level, score, percentage, time_spent } = data;

    const result = await query(
      `INSERT INTO user_lesson_progress
        (user_id, lesson_id, stars, crown_level, best_score, best_percentage, attempts, time_spent, last_completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, 1, $7, CASE WHEN $6 >= 70 THEN CURRENT_TIMESTAMP ELSE NULL END)
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET
         stars = GREATEST(user_lesson_progress.stars, EXCLUDED.stars),
         crown_level = GREATEST(user_lesson_progress.crown_level, EXCLUDED.crown_level),
         best_score = GREATEST(user_lesson_progress.best_score, EXCLUDED.best_score),
         best_percentage = GREATEST(user_lesson_progress.best_percentage, EXCLUDED.best_percentage),
         attempts = user_lesson_progress.attempts + 1,
         time_spent = user_lesson_progress.time_spent + EXCLUDED.time_spent,
         last_completed_at = CASE
           WHEN EXCLUDED.best_percentage >= 70 THEN CURRENT_TIMESTAMP
           ELSE user_lesson_progress.last_completed_at
         END,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, lessonId, stars, crown_level, score, percentage, time_spent]
    );
    return result.rows[0];
  }
}
