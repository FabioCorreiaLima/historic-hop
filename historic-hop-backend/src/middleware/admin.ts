import { Response, NextFunction } from "express";
import { AuthRequest, authenticateToken } from "./auth.js";
import { UserRepository } from "../repositories/UserRepository.js";

function parseAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function verifyAdminRole(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;
    if (!userId) return res.status(401).json({ error: "Não autenticado" });

    const user = await UserRepository.getById(userId);
    const adminEmails = parseAdminEmails();
    const isAdmin =
      user?.is_admin === true ||
      (!!email && adminEmails.includes(email.toLowerCase()));

    if (!isAdmin) {
      return res.status(403).json({ error: "Acesso restrito a administradores" });
    }
    next();
  } catch (e) {
    console.error("requireAdmin:", e);
    return res.status(500).json({ error: "Erro ao verificar permissão" });
  }
}

/** Autentica JWT e exige is_admin no usuário ou email listado em ADMIN_EMAILS. */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  authenticateToken(req, res, () => {
    void verifyAdminRole(req, res, next);
  });
};
