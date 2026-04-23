import { privateEncrypt } from "crypto";
import { query } from "../config/database.js";

export class ActivityRepository {
  static async save(activity: any) {
    const { id, type, periodId, level, difficulty, content, imageUrl, mapUrl, audioUrl, videoUrl, avatarUrl, isAIGenerated } = activity;
    
    const result = await query(
      `INSERT INTO activities 
      (id, type, "periodId", level, difficulty, content, "imageUrl", "mapUrl", "audioUrl", "videoUrl", "avatarUrl", "isAIGenerated")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [id, type, periodId, level || 1, difficulty || 'Fácil', JSON.stringify(content), imageUrl, mapUrl, audioUrl, videoUrl, avatarUrl, isAIGenerated ?? true]
    );
    
    return result.rows[0];
  }

  static async getByPeriod(periodId: string, limit: number = 5) {
    const result = await query(
      "SELECT * FROM activities WHERE \"periodId\" = $1 ORDER BY \"createdAt\" DESC LIMIT $2",
      [periodId, limit]
    );
    console.log("Atividades recuperadas do banco:", result.rows);
    return result.rows;
  }

  static async getById(id: string) {
    const result = await query("SELECT * FROM activities WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async deleteBatch(ids: string[]) {
    if (ids.length === 0) return;
    await query("DELETE FROM activities WHERE id = ANY($1)", [ids]);
  }
}
