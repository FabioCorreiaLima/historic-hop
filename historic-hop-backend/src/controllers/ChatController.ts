import { Request, Response } from 'express';
import { ChatService } from '../services/ChatService.js';

export class ChatController {
  static async sendMessage(req: Request, res: Response) {
    try {
      const { messages, periodId } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages é obrigatório" });
      }

      const response = await ChatService.generateChatResponse(periodId, messages);
      res.json({ response });
    } catch (error) {
      console.error("Erro no ChatController:", error);
      res.status(500).json({ error: "Erro ao processar mensagem do chat" });
    }
  }

  static async getSuggestedQuestions(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      const questions = ChatService.getSuggestedQuestions(periodId);
      res.json({ questions });
    } catch (error) {
      console.error("Erro no ChatController (questions):", error);
      res.status(500).json({ error: "Erro ao buscar perguntas sugeridas" });
    }
  }
}
