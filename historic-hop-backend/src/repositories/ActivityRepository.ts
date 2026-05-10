import { query } from "../config/database.js";

export class ActivityRepository {
  static async save(activity: any) {
    const { id, type, periodId, lessonId, level, difficulty, content, imageUrl, mapUrl, audioUrl, videoUrl, avatarUrl, isAIGenerated } = activity;

    const result = await query(
      `INSERT INTO activities 
      (id, type, "periodId", "lessonId", level, difficulty, content, "imageUrl", "mapUrl", "audioUrl", "videoUrl", "avatarUrl", "isAIGenerated")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [id, type, periodId, lessonId ?? null, level || 1, difficulty || "Fácil", JSON.stringify(content), imageUrl, mapUrl, audioUrl, videoUrl, avatarUrl, isAIGenerated ?? true]
    );
    
    return result.rows[0];
  }
  
  static async getAll() {
    const result = await query("SELECT * FROM activities ORDER BY \"createdAt\" DESC");
    return result.rows;
  }

  static async getByPeriod(periodId: string, limit: number = 5) {
    const result = await query(
      "SELECT * FROM activities WHERE \"periodId\" = $1 ORDER BY \"createdAt\" DESC LIMIT $2",
      [periodId, limit]
    );
    return result.rows;
  }

  static async getByPeriodRandom(periodId: string, limit: number = 20) {
    const result = await query(
      "SELECT * FROM activities WHERE \"periodId\" = $1 ORDER BY RANDOM() LIMIT $2",
      [periodId, limit]
    );
    return result.rows;
  }

  static async getById(id: string) {
    const result = await query("SELECT * FROM activities WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async update(id: string, activity: any) {
    const { type, periodId, level, difficulty, content, imageUrl } = activity;
    const result = await query(
      `UPDATE activities SET 
      type = $1, "periodId" = $2, level = $3, difficulty = $4, content = $5, "imageUrl" = $6, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $7 RETURNING *`,
      [type, periodId, level || 1, difficulty || "Fácil", JSON.stringify(content), imageUrl, id]
    );
    return result.rows[0];
  }

  static async delete(id: string) {
    await query("DELETE FROM activities WHERE id = $1", [id]);
  }

  static async deleteBatch(ids: string[]) {
    if (ids.length === 0) return;
    await query("DELETE FROM activities WHERE id = ANY($1)", [ids]);
  }
}
