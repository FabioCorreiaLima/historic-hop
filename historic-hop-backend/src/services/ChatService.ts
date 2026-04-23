import { AIService } from "./AIService.js";
import { PeriodRepository } from "../repositories/PeriodRepository.js";

const CHARACTER_PROMPTS_FALLBACK: Record<string, string> = {
  colonia: "Você é Padre Manoel, um jesuíta português no Brasil Colônia (1500-1822). Fale com sabedoria e fé.",
  imperio: "Você é Imperador Pedro, inspirado em Dom Pedro II (1822-1889). Fale com nobreza e cultura.",
  republica_velha: "Você é Coronel Silva, um fazendeiro poderoso da República Velha (1889-1930). Fale com autoridade.",
  era_vargas: "Você é Operário João, um trabalhador da Era Vargas (1930-1945). Fale com determinação.",
  ditadura: "Você é Estudante Maria, uma jovem resistente à Ditadura Militar (1964-1985). Fale com coragem.",
  nova_republica: "Você é Cidadão Carlos, um brasileiro da Nova República (1985-presente). Fale com esperança.",
};

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  colonia: ["Como era a vida nos engenhos?", "Quem eram os jesuítas?", "O que foi o ciclo do ouro?"],
  imperio: ["Quem foi Dom Pedro II?", "Como aconteceu a abolição?", "O que causou a Guerra do Paraguai?"],
  republica_velha: ["O que era a política café com leite?", "Quem eram os coronéis?", "O que foi a Revolta da Vacina?"],
  era_vargas: ["Quem foi Getúlio Vargas?", "Quais os direitos ganhos na CLT?", "O que foi o Estado Novo?"],
  ditadura: ["O que foi o AI-5?", "Como as pessoas resistiam?", "O que foi as Diretas Já?"],
  nova_republica: ["O que mudou com a CF/88?", "O que foi o Plano Real?", "Como é a democracia hoje?"],
};

export class ChatService {
  static async generateChatResponse(periodId: string, messages: any[]) {
    const periodData = await PeriodRepository.getById(periodId);

    // PostgreSQL retorna colunas em lowercase - normalizar aqui
    const characterName = periodData?.charactername || periodData?.characterName;
    const characterEmoji = periodData?.characteremoji || periodData?.characterEmoji;
    const periodName = periodData?.name;
    const periodYears = periodData?.years;
    const periodDescription = periodData?.description;

    const characterPrompt = periodData
      ? `Você é ${characterName || 'um guia histórico'} ${characterEmoji ? `(${characterEmoji})` : ''}, um personagem histórico do período ${periodName} (${periodYears}).
         Contexto: ${periodDescription}. Fale de acordo com seu personagem e época.`
      : (CHARACTER_PROMPTS_FALLBACK[periodId] || `Você é um guia histórico especialista em história do Brasil.`);

    const systemPrompt = `${characterPrompt}
REGRAS:
- Responda em português do Brasil, curto (máx 2 parágrafos).
- Mantenha o personagem o tempo todo.
- Historicidade precisa.`;

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const userPrompt = lastUserMessage ? lastUserMessage.content : "Apresente-se.";

    const fullPrompt = `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`;
    return await AIService.generateText(fullPrompt, 500);
  }

  static getSuggestedQuestions(periodId: string) {
    return SUGGESTED_QUESTIONS[periodId] || [
      "Conte-me mais sobre este período.",
      "Quais foram os principais eventos?",
      "Quem foram as figuras mais importantes?"
    ];
  }
}
