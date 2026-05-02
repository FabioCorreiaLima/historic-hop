import { query } from "../config/database.js";

export class StoreRepository {
  static async getInventory(userId: string) {
    const result = await query(
      "SELECT item_id, item_type, purchased_at FROM user_inventory WHERE user_id = $1",
      [userId]
    );
    return result.rows;
  }

  static async addInventoryItem(userId: string, itemType: string, itemId: string) {
    await query(
      "INSERT INTO user_inventory (user_id, item_type, item_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [userId, itemType, itemId]
    );
  }

  static async getUserCoins(userId: string) {
    const result = await query("SELECT coins FROM users WHERE id = $1", [userId]);
    return result.rows[0]?.coins || 0;
  }

  static async updateCoins(userId: string, amount: number) {
    await query("UPDATE users SET coins = coins + $1 WHERE id = $2", [amount, userId]);
  }

  static async updateCurrentSkin(userId: string, skinId: string) {
    await query("UPDATE users SET current_skin = $1 WHERE id = $2", [skinId, userId]);
  }
}
