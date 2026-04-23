import { query } from "../config/database.js";

export interface HistoricalPeriod {
  id: string;
  name: string;
  emoji: string;
  years: string;
  color: string;
  bgColor?: string;
  borderColor?: string;
  description: string;
  characterName?: string;
  characterEmoji?: string;
  order_index: number;
  image_url: string;
}

export class PeriodRepository {
  static async getAll() {
    const result = await query("SELECT * FROM historical_periods ORDER BY order_index ASC");
    return result.rows;
  }

  static async getById(id: string) {
    const result = await query("SELECT * FROM historical_periods WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async save(data: any) {
    // Normaliza tanto camelCase quanto snake_case vindos de diferentes fontes
    const id = data.id;
    const name = data.name;
    const emoji = data.emoji;
    const years = data.years;
    const color = data.color;
    const bgColor = data.bgColor || data.bgcolor || null;
    const borderColor = data.borderColor || data.bordercolor || null;
    const description = data.description;
    const characterName = data.characterName || data.charactername || null;
    const characterEmoji = data.characterEmoji || data.characteremoji || null;
    const order_index = data.order_index ?? 0;
    const image_url = data.image_url || data.imageUrl || data.imageurl || null;

    const result = await query(
      `INSERT INTO historical_periods 
      (id, name, emoji, years, color, "bgColor", "borderColor", description, "characterName", "characterEmoji", order_index, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      emoji = EXCLUDED.emoji,
      years = EXCLUDED.years,
      color = EXCLUDED.color,
      "bgColor" = EXCLUDED."bgColor",
      "borderColor" = EXCLUDED."borderColor",
      description = EXCLUDED.description,
      "characterName" = EXCLUDED."characterName",
      "characterEmoji" = EXCLUDED."characterEmoji",
      order_index = EXCLUDED.order_index,
      image_url = EXCLUDED.image_url,
      "updatedAt" = CURRENT_TIMESTAMP
      RETURNING *`,
      [id, name, emoji, years, color, bgColor, borderColor, description, characterName, characterEmoji, order_index, image_url]
    );

    return result.rows[0];
  }

  static async updateImageUrl(id: string, imageUrl: string) {
    const result = await query(
      `UPDATE historical_periods SET image_url = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [imageUrl, id]
    );
    return result.rows[0];
  }
}
