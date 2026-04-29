import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: string, email: string): string {
    return jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }

  static async createUser(email: string, name?: string, password?: string) {
    const hashedPassword = password ? await this.hashPassword(password) : null;

    const result = await query(`
      INSERT INTO users (email, name, password)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, avatar, is_admin, "createdAt"
    `, [email, name, hashedPassword]);

    return result.rows[0];
  }

  static async findUserByEmail(email: string) {
    const result = await query(`
      SELECT id, email, name, avatar, password, is_admin, "createdAt"
      FROM users
      WHERE email = $1
    `, [email]);

    return result.rows[0] || null;
  }

  static async findUserById(id: string) {
    const result = await query(`
      SELECT id, email, name, avatar, is_admin, "createdAt"
      FROM users
      WHERE id = $1
    `, [id]);

    return result.rows[0] || null;
  }
}