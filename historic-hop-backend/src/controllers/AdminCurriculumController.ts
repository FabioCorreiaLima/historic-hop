import { Request, Response } from "express";
import { CurriculumGeneratorService } from "../services/CurriculumGeneratorService.js";

export class AdminCurriculumController {
  static async generateBNCCFullCurriculum(req: Request, res: Response) {
    try {
      const result = await CurriculumGeneratorService.generateBNCCFullCurriculum();
      res.status(200).json({ message: "Currículo gerado com sucesso!", result });
    } catch (error: any) {
      console.error("Erro ao gerar currículo completo:", error);
      res.status(500).json({ error: "Erro interno ao gerar o currículo.", details: error.message });
    }
  }
}
