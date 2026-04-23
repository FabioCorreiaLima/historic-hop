import { Router } from "express";
import { prisma } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
const router = Router();
// GET /api/users/profile - Perfil do usuário
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                progress: true,
                achievements: {
                    include: {
                        achievement: true
                    }
                },
                sessions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// PUT /api/users/profile - Atualizar perfil
router.put("/profile", authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }
        const { name, avatar } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name && { name }),
                ...(avatar && { avatar }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                updatedAt: true,
            }
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// GET /api/users/progress - Progresso do usuário
router.get("/progress", authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }
        const progress = await prisma.userProgress.findMany({
            where: { userId: req.user.id },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(progress);
    }
    catch (error) {
        console.error("Erro ao buscar progresso:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// POST /api/users/progress - Atualizar progresso
router.post("/progress", authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }
        const { periodId, level, score, completed } = req.body;
        if (!periodId) {
            return res.status(400).json({ error: "periodId é obrigatório" });
        }
        const progress = await prisma.userProgress.upsert({
            where: {
                userId_periodId: {
                    userId: req.user.id,
                    periodId,
                }
            },
            update: {
                level: level || undefined,
                score: score || undefined,
                completed: completed || undefined,
            },
            create: {
                userId: req.user.id,
                periodId,
                level: level || 1,
                score: score || 0,
                completed: completed || false,
            }
        });
        res.json(progress);
    }
    catch (error) {
        console.error("Erro ao atualizar progresso:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// GET /api/users/achievements - Conquistas do usuário
router.get("/achievements", authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }
        const achievements = await prisma.userAchievement.findMany({
            where: { userId: req.user.id },
            include: {
                achievement: true
            },
            orderBy: { unlockedAt: 'desc' }
        });
        res.json(achievements);
    }
    catch (error) {
        console.error("Erro ao buscar conquistas:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
export default router;
