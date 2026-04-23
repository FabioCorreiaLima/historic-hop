import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
export class AuthService {
    static async hashPassword(password) {
        return bcrypt.hash(password, 12);
    }
    static async verifyPassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
    static generateToken(userId, email) {
        return jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    }
    static async createUser(email, name, password) {
        const hashedPassword = password ? await this.hashPassword(password) : null;
        return prisma.user.create({
            data: {
                email,
                name,
                // password: hashedPassword, // Uncomment when adding password auth
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                createdAt: true,
            },
        });
    }
    static async findUserByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                createdAt: true,
            },
        });
    }
    static async findUserById(id) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                createdAt: true,
            },
        });
    }
}
