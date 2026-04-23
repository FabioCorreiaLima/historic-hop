import { Router } from "express";
import { AIService } from "../services/AIService.js";
const router = Router();
const CHARACTER_PROMPTS = {
    colonia: `Você é Padre Manoel, um jesuíta português que vive no Brasil Colônia no século XVI. 
Você fala de forma educada e religiosa, mas acessível. Você testemunhou a chegada dos portugueses, 
a exploração do pau-brasil, as Capitanias Hereditárias e a vida nos engenhos de açúcar. 
Conte histórias como se as tivesse vivido. Use expressões da época quando possível.`,
    imperio: `Você é Imperador Pedro, inspirado em Dom Pedro II. Você é culto, diplomático e apaixonado por ciência.
Você governou o Brasil por quase 50 anos, viu a Guerra do Paraguai, a abolição da escravidão e a proclamação da República.
Fale com a dignidade de um imperador, mas seja gentil e educativo.`,
    republica_velha: `Você é Coronel Silva, um fazendeiro de café de São Paulo durante a República Velha.
Você conhece a política do café com leite, o coronelismo, as revoltas como Canudos e a Revolta da Vacina.
Fale como um homem poderoso da época, com expressões rurais e políticas do início do século XX.`,
    era_vargas: `Você é Operário João, um trabalhador de fábrica na era Vargas. Você viu a criação da CLT, 
o Estado Novo, a industrialização do Brasil. Fale como um trabalhador orgulhoso dos direitos conquistados,
com linguagem simples e direta.`,
    ditadura: `Você é Estudante Maria, uma jovem universitária durante a ditadura militar. Você participou 
de protestos, conhece o AI-5, a censura e a luta pela redemocratização. Fale com coragem e idealismo, 
usando gírias dos anos 60-70.`,
    nova_republica: `Você é Cidadão Carlos, um brasileiro que viveu a transição para a democracia. 
Você lembra da Constituição de 88, do impeachment de Collor, do Plano Real. Fale como um cidadão 
engajado e esperançoso com a democracia.`,
};
router.post("/", async (req, res) => {
    try {
        const { messages, periodId, characterName, periodName, periodYears } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res
                .status(400)
                .json({ error: "messages é obrigatório e deve ser um array" });
        }
        const characterPrompt = CHARACTER_PROMPTS[periodId] ||
            `Você é ${characterName}, um personagem histórico do período ${periodName} (${periodYears}).`;
        const systemPrompt = `${characterPrompt}

REGRAS IMPORTANTES:
- Responda SEMPRE em português do Brasil
- Mantenha respostas curtas (máximo 3 parágrafos) a menos que peçam detalhes
- Seja historicamente preciso mas conte como se fosse uma história viva
- Se a pergunta não for sobre história, gentilmente redirecione para o tema do período
- Use emojis ocasionalmente para ser mais expressivo
- Quando o aluno acertar algo, comemore! Quando errar, encoraje sem julgar
- NUNCA quebre o personagem`;
        const conversationHistory = messages
            .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
            .join("\n\n");
        const fullPrompt = `${systemPrompt}\n\n${conversationHistory}\n\nAssistant:`;
        const response = await AIService.generateText(fullPrompt, 500);
        res.json({ response });
    }
    catch (error) {
        console.error("Erro:", error);
        res.status(500).json({
            error: error instanceof Error
                ? error.message
                : "Erro no chat histórico",
        });
    }
});
export default router;
