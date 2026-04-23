import { Request, Response } from "express";
import { QuestionRepository } from "../repositories/QuestionRepository.js";

export class QuestionController {
  static async getQuestions(req: Request, res: Response) {
    try {
      const level = req.query.level ? Number(req.query.level) : undefined;
      const questions = await QuestionRepository.getAll(level);
      res.json(questions);
    } catch (error) {
      console.error("Erro no QuestionController (get):", error);
      res.status(500).json({ error: "Erro ao buscar perguntas" });
    }
  }

  static async createQuestion(req: Request, res: Response) {
    try {
      const { level, difficulty, topic, question, options, correct_index, explanation, media_type, image_url, audio_url, video_url } = req.body;
      const created = await QuestionRepository.create({
        level, difficulty, topic, question, options,
        correctIndex: correct_index, explanation,
        mediaType: media_type, imageUrl: image_url,
        audioUrl: audio_url, videoUrl: video_url
      });
      res.status(201).json(created);
    } catch (error) {
      console.error("Erro no QuestionController (create):", error);
      res.status(500).json({ error: "Erro ao criar pergunta" });
    }
  }

  static async updateQuestion(req: Request, res: Response) {
    try {
      const { id, level, difficulty, topic, question, options, correct_index, explanation, media_type, image_url, audio_url, video_url } = req.body;
      if (!id) return res.status(400).json({ error: "ID é obrigatório" });

      const updated = await QuestionRepository.update(id, {
        level, difficulty, topic, question, options,
        correctIndex: correct_index, explanation,
        mediaType: media_type, imageUrl: image_url,
        audioUrl: audio_url, videoUrl: video_url
      });

      if (!updated) return res.status(404).json({ error: "Pergunta não encontrada" });
      res.json(updated);
    } catch (error) {
      console.error("Erro no QuestionController (update):", error);
      res.status(500).json({ error: "Erro ao atualizar pergunta" });
    }
  }

  static async deleteQuestion(req: Request, res: Response) {
    try {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: "ID é obrigatório" });
      await QuestionRepository.delete(id);
      res.json({ message: "Pergunta deletada com sucesso" });
    } catch (error) {
      console.error("Erro no QuestionController (delete):", error);
      res.status(500).json({ error: "Erro ao deletar pergunta" });
    }
  }
}
