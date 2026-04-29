import { query } from "../config/database.js";

export class LessonRepository {
  static async getById(id: string) {
    const result = await query(`SELECT * FROM lessons WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async listByPeriod(periodId: string) {
    const result = await query(
      `SELECT * FROM lessons WHERE period_id = $1 ORDER BY order_index ASC, id ASC`,
      [periodId]
    );
    return result.rows;
  }

  static async create(data: {
    id: string;
    period_id: string;
    title: string;
    order_index?: number;
    xp_reward?: number;
  }) {
    const result = await query(
      `INSERT INTO lessons (id, period_id, title, order_index, xp_reward)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.id,
        data.period_id,
        data.title,
        data.order_index ?? 0,
        data.xp_reward ?? 10,
      ]
    );
    return result.rows[0];
  }
}
