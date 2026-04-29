import { query } from "../config/database.js";

export const DEFAULT_COURSE_ID = "default-br";

export class CurriculumRepository {
  static async getCourse(courseId: string = DEFAULT_COURSE_ID) {
    const result = await query(`SELECT * FROM courses WHERE id = $1`, [courseId]);
    return result.rows[0] || null;
  }

  static async getOrderedPeriodIds(courseId: string = DEFAULT_COURSE_ID): Promise<string[]> {
    const result = await query(
      `SELECT period_id FROM course_periods WHERE course_id = $1 ORDER BY order_index ASC`,
      [courseId]
    );
    return (result.rows as { period_id: string }[]).map((r) => r.period_id);
  }

  static async setPeriodOrder(courseId: string, orderedPeriodIds: string[]) {
    for (let i = 0; i < orderedPeriodIds.length; i++) {
      await query(
        `UPDATE course_periods SET order_index = $1 WHERE course_id = $2 AND period_id = $3`,
        [i, courseId, orderedPeriodIds[i]]
      );
    }
  }

  static async linkPeriodToCourse(courseId: string, periodId: string, orderIndex: number) {
    await query(
      `INSERT INTO course_periods (course_id, period_id, order_index)
       VALUES ($1, $2, $3)
       ON CONFLICT (course_id, period_id) DO UPDATE SET order_index = EXCLUDED.order_index`,
      [courseId, periodId, orderIndex]
    );
  }

  static async getPeriodPathOrder(courseId: string, periodId: string): Promise<number | null> {
    const result = await query(
      `SELECT order_index FROM course_periods WHERE course_id = $1 AND period_id = $2`,
      [courseId, periodId]
    );
    if (!result.rows[0]) return null;
    return result.rows[0].order_index as number;
  }
}
