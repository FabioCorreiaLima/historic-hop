import { Router, Request, Response } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { text, voice = "pt-BR", character = "neutral" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Texto é obrigatório" });
    }

    // TODO: Implementar geração de áudio com Replicate
    // Por enquanto, retorna um placeholder

    res.json({
      audioUrl: null,
      message:
        "Geração de áudio ainda não implementada no backend",
    });
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Erro ao gerar áudio",
    });
  }
});

export default router;
