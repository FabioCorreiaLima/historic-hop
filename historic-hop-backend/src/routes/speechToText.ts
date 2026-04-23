import { Router, Request, Response } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { audioFile } = req.body;

    if (!audioFile) {
      return res.status(400).json({ error: "Arquivo de áudio é obrigatório" });
    }

    // TODO: Implementar speech-to-text com Replicate Whisper
    // Por enquanto, retorna um placeholder
    res.json({
      transcript: "Transcrição de áudio ainda não implementada",
    });
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao processar áudio",
    });
  }
});

export default router;
