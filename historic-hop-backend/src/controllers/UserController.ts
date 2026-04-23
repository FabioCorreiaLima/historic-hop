import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { UserRepository } from "../repositories/UserRepository.js";

export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Não autenticado" });

      const user = await UserRepository.getById(userId);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      res.json(user);
    } catch (error) {
      console.error("Erro no UserController (getProfile):", error);
      res.status(500).json({ error: "Erro ao buscar perfil" });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Não autenticado" });

      const { name, avatar } = req.body;
      const updatedUser = await UserRepository.updateProfile(userId, name, avatar);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Erro no UserController (updateProfile):", error);
      res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  }
}
