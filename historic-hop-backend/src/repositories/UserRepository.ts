import { query } from "../config/database.js";

export class UserRepository {
  static async getById(id: string) {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async getByEmail(email: string) {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
  }

  static async create(email: string, passwordHash: string, name: string) {
    const result = await query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *",
      [email, passwordHash, name]
    );
    return result.rows[0];
  }

  static async updateProfile(id: string, name?: string, avatar?: string) {
    const result = await query(
      "UPDATE users SET name = COALESCE($1, name), avatar = COALESCE($2, avatar), \"updatedAt\" = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [name, avatar, id]
    );
    return result.rows[0];
  }
}
