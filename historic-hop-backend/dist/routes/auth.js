import { Router } from "express";
import { AuthService } from "../services/AuthService.js";
import { authLimiter } from "../middleware/rateLimit.js";
const router = Router();
// POST /api/auth/login - Login
router.post("/login", authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email e senha são obrigatórios" });
        }
        const user = await AuthService.findUserByEmail(email);
        if (!user || !user.password) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }
        const isValid = await AuthService.verifyPassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }
        const token = AuthService.generateToken(user.id, user.email);
        // Remove password from user object before sending
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            user: userWithoutPassword,
            token,
            message: "Login realizado com sucesso"
        });
    }
    catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// POST /api/auth/register - Registro
router.post("/register", authLimiter, async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email e senha são obrigatórios" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "A senha deve ter no mínimo 6 caracteres" });
        }
        const existingUser = await AuthService.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Usuário já existe" });
        }
        const user = await AuthService.createUser(email, name, password);
        const token = AuthService.generateToken(user.id, user.email);
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            user: userWithoutPassword,
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
