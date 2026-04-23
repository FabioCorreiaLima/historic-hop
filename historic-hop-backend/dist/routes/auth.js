import { Router } from "express";
import { AuthService } from "../services/AuthService.js";
import { authLimiter } from "../middleware/rateLimit.js";
const router = Router();
// POST /api/auth/login - Login (placeholder for now)
router.post("/login", authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email é obrigatório" });
        }
        // For now, just create/find user without password
        let user = await AuthService.findUserByEmail(email);
        if (!user) {
            user = await AuthService.createUser(email);
        }
        const token = AuthService.generateToken(user.id, user.email);
        res.json({
            user,
            token,
            message: "Login realizado com sucesso"
        });
    }
    catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// POST /api/auth/register - Registro (placeholder)
router.post("/register", authLimiter, async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email é obrigatório" });
        }
        const existingUser = await AuthService.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Usuário já existe" });
        }
        const user = await AuthService.createUser(email, name);
        const token = AuthService.generateToken(user.id, user.email);
        res.status(201).json({
            user,
            token,
            message: "Usuário criado com sucesso"
        });
    }
    catch (error) {
        console.error("Erro no registro:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// POST /api/auth/guest - Acesso como convidado
router.post("/guest", async (req, res) => {
    try {
        // Create anonymous user session
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const token = AuthService.generateToken(guestId, `guest@${guestId}.com`);
        res.json({
            user: {
                id: guestId,
                email: `guest@${guestId}.com`,
                name: "Convidado",
                isGuest: true
            },
            token,
            message: "Sessão de convidado iniciada"
        });
    }
    catch (error) {
        console.error("Erro na sessão de convidado:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
export default router;
