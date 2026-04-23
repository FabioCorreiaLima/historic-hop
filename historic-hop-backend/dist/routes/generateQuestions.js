import { Router } from "express";
import { AIService } from "../services/AIService.js";
const router = Router();
const PERIOD_NAMES = {
    colonia: "Brasil Colônia",
    imperio: "Império do Brasil",
    republica_velha: "República Velha",
    era_vargas: "Era Vargas",
    ditadura: "Ditadura Militar",
    nova_republica: "Nova República",
};
router.post("/", async (req, res) => {
    try {
        const { periodId, level, topic, difficulty } = req.body;
        if (!periodId) {
            return res.status(400).json({ error: "periodId é obrigatório" });
        }
        const periodName = PERIOD_NAMES[periodId] || "História do Brasil";
        const systemPrompt = `Você é um especialista em história brasileira. Sua tarefa é gerar uma pergunta de quiz sobre ${periodName}.

REGRAS IMPORTANTES:
- Gere uma pergunta históricas precisa e educacional
- A pergunta deve ter 4 opções (A, B, C, D)
- Apenas uma opção deve estar correta
- Forneça uma explicação detalhada para a resposta correta
- A pergunta deve ser do nível ${level} e dificuldade ${difficulty || "médio"}
- Responda APENAS com um JSON válido no formato:
{
  "question": "Pergunta aqui?",
  "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
  "correctIndex": 0,
  "explanation": "Explicação detalhada aqui"
}`;
        const userPrompt = topic
            ? `Gere uma pergunta sobre: ${topic}`
            : `Gere uma pergunta interessante sobre ${periodName}`;
        const content = await AIService.generateText(`${systemPrompt}\n\n${userPrompt}\n\nJSON:`, 500);
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return res
                .status(500)
                .json({ error: "A IA não retornou um JSON válido" });
        }
        const questionData = JSON.parse(jsonMatch[0]);
        res.json(questionData);
    }
    catch (error) {
        console.error("Erro:", error);
        res.status(500).json({
            error: error instanceof Error
                ? error.message
                : "Erro ao gerar pergunta",
        });
    }
});
export default router;
