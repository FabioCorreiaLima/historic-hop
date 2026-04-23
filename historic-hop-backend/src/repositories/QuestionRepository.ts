import { query } from "../config/database.js";

export class QuestionRepository {
  static async getAll(level?: number) {
    let sql = "SELECT * FROM questions";
    const params = [];
    
    if (level) {
      sql += " WHERE level = $1";
      params.push(level);
    }
    
    sql += " ORDER BY \"createdAt\" DESC";
    const result = await query(sql, params);
    return result.rows;
  }

  static async getById(id: string) {
    const result = await query("SELECT * FROM questions WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async create(data: any) {
    const { level, difficulty, topic, question, options, correctIndex, explanation, mediaType, imageUrl, audioUrl, videoUrl } = data;
    
    const result = await query(
      `INSERT INTO questions 
      (level, difficulty, topic, question, options, correct_index, explanation, media_type, image_url, audio_url, video_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [level || 1, difficulty || 'Fácil', topic, question, JSON.stringify(options), correctIndex, explanation, mediaType || 'text', imageUrl, audioUrl, videoUrl]
    );
    
    return result.rows[0];
  }

  static async update(id: string, data: any) {
    const { level, difficulty, topic, question, options, correctIndex, explanation, mediaType, imageUrl, audioUrl, videoUrl } = data;
    
    const result = await query(
      `UPDATE questions SET
      level = $1, difficulty = $2, topic = $3, question = $4, options = $5, 
      correct_index = $6, explanation = $7, media_type = $8, image_url = $9, 
      audio_url = $10, video_url = $11, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *`,
      [level, difficulty, topic, question, JSON.stringify(options), correctIndex, explanation, mediaType, imageUrl, audioUrl, videoUrl, id]
    );
    
    return result.rows[0];
  }

  static async delete(id: string) {
    await query("DELETE FROM questions WHERE id = $1", [id]);
  }
}
