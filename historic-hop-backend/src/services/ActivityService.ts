import { AIService } from "./AIService.js";
import { ActivityRepository } from "../repositories/ActivityRepository.js";
import { PeriodRepository } from "../repositories/PeriodRepository.js";
import crypto from "crypto";

const PERIOD_PROMPTS_FALLBACK: Record<string, string> = {
  colonia: "Especialista em História do Brasil Colonial (1500-1822).",
  imperio: "Especialista em História do Império do Brasil (1822-1889).",
  republica_velha: "Especialista em História da República Velha (1889-1930).",
  era_vargas: "Especialista em História da Era Vargas (1930-1945).",
  ditadura: "Especialista em História da Ditadura Militar (1964-1985).",
  nova_republica: "Especialista em História da Nova República (1985-presente)."
};

const PERIOD_NAMES: Record<string, string> = {
  colonia: "Brasil Colônia",
  imperio: "Império do Brasil",
  republica_velha: "República Velha",
  era_vargas: "Era Vargas",
  ditadura: "Ditadura Militar",
  nova_republica: "Nova República"
};

const CHARACTER_AVATARS: Record<string, string> = {
  colonia: "Padre jesuíta português do século XVI, com batina, barba branca",
  imperio: "Imperador Dom Pedro II, uniforme imperial, barba branca",
  republica_velha: "Coronel fazendeiro de café, chapéu de palha, roupa elegante rural",
  era_vargas: "Trabalhador industrial, roupa de operário, expressão determinada",
  ditadura: "Estudante universitária jovem, cabelos longos, expressão idealista",
  nova_republica: "Cidadão brasileiro moderno, expressão esperançosa"
};

export class ActivityService {
  /**
   * Gera uma única atividade com IA e salva no banco
   */
  static async generateSingleActivity(options: any) {
    console.log("\n🔵 [ActivityService] Iniciando generateSingleActivity");
    console.log("📦 Options recebidas:", JSON.stringify(options, null, 2));

    const {
      periodId,
      activityType,
      level = 1,
      difficulty = "Fácil",
      includeMap = true,
      includeAvatar = false
    } = options;

    console.log(`📌 Parâmetros: periodId=${periodId}, activityType=${activityType}, level=${level}, difficulty=${difficulty}`);

    console.log("🟢 [1/7] Buscando/garantindo período...");
    const period = await this.ensurePeriodReady(periodId);
    const periodName = period?.name || PERIOD_NAMES[periodId] || periodId;
    console.log(`📖 Período encontrado: ${periodName}`);

    const periodPrompt = period
      ? `Você é um especialista em História do Brasil sobre o período: ${period.name}. Descrição: ${period.description}.`
      : (PERIOD_PROMPTS_FALLBACK[periodId] || "Especialista em História do Brasil.");
    
    console.log(`📝 Prompt do período (resumido): ${periodPrompt.substring(0, 100)}...`);

    const activityPrompt = this.getActivityPrompt(activityType, periodName);
    console.log(`📝 Prompt da atividade: ${activityPrompt.substring(0, 100)}...`);

    const systemPrompt = `${periodPrompt}
IMPORTANTE:
- Responda APENAS com JSON válido em português brasileiro
- Nível: ${level}, Dificuldade: ${difficulty}
- imagePrompt: descrição para Pollinations/Wikimedia`;

    console.log("🟢 [2/7] Chamando AIService.generateText para gerar atividade...");
    const content = await AIService.generateText(`${systemPrompt}\n\n${activityPrompt}\n\nJSON:`, 1500);
    console.log(`📄 Conteúdo bruto retornado (primeiros 200 chars): ${content.substring(0, 200)}...`);

    console.log("🟢 [3/7] Extraindo JSON da resposta...");
    const activityData = AIService.extractJSON(content);
    console.log("📦 JSON extraído:", JSON.stringify(activityData, null, 2));

    const imagePrompt = activityData.imagePrompt || activityData.question || activityData.statement || periodName;
    console.log(`🎨 ImagePrompt gerado: "${imagePrompt.substring(0, 100)}..."`);

    console.log("🟢 [4/7] Gerando imagem principal...");
    const imageUrl = await AIService.generateImage(imagePrompt);
    console.log(`🖼️ Imagem principal gerada: ${imageUrl || "FALHOU"}`);

    console.log(`🟢 [5/7] Gerando mapa (includeMap=${includeMap})...`);
    let mapUrl = null;
    if (includeMap) {
      const mapPrompt = activityData.mapPrompt || `Mapa histórico de ${periodName}`;
      console.log(`🗺️ MapPrompt: "${mapPrompt}"`);
      mapUrl = await AIService.generateMap(mapPrompt);
      console.log(`🗺️ Mapa gerado: ${mapUrl || "FALHOU"}`);
    } else {
      console.log("⏭️ Pular geração de mapa (includeMap=false)");
    }

    console.log(`🟢 [6/7] Gerando avatar (includeAvatar=${includeAvatar})...`);
    let avatarUrl = null;
    if (includeAvatar) {
      const avatarPrompt = CHARACTER_AVATARS[periodId] || "Personagem histórico";
      console.log(`👤 AvatarPrompt: "${avatarPrompt}"`);
      avatarUrl = await AIService.generateAvatar(avatarPrompt);
      console.log(`👤 Avatar gerado: ${avatarUrl || "FALHOU"}`);
    } else {
      console.log("⏭️ Pular geração de avatar (includeAvatar=false)");
    }

    console.log("🟢 [7/7] Montando objeto da atividade...");
    const activity = {
      id: crypto.randomUUID(),
      type: activityType,
      periodId,
      level,
      difficulty,
      content: activityData,
      imageUrl,
      mapUrl,
      avatarUrl,
      isAIGenerated: true
    };

    console.log("💾 Salvando atividade no repositório...");
    const saved = await ActivityRepository.save(activity);
    console.log("✅ Atividade salva com sucesso! ID:", saved.id);
    console.log("🔚 [generateSingleActivity] Finalizado\n");

    return saved;
  }

  /**
   * Gera um lote de atividades variadas em paralelo
   */
  static async generateBatch(periodId: string, count: number = 5) {
    console.log(`\n🚀 [ActivityService] Iniciando generateBatch para período ${periodId}`);
    console.log(`📊 Quantidade solicitada: ${count} atividades`);

    const types = ["quiz", "true_false", "fill_blank", "chronological", "matching"];
    console.log(`📋 Tipos disponíveis: ${types.join(", ")}`);

    const promises = [];
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      console.log(`📌 Atividade ${i + 1}/${count} - Tipo: ${type}`);
      promises.push(this.generateSingleActivity({ periodId, activityType: type }));
    }

    console.log("⏳ Aguardando execução paralela de todas as atividades...");
    const results = await Promise.all(promises);
    console.log(`✅ Lote concluído! ${results.length} atividades geradas com sucesso.`);
    console.log(`📊 IDs gerados: ${results.map(r => r.id).join(", ")}`);

    return results;
  }

  /**
   * Gera uma única questão de quiz (usado por generateQuestions)
   */
  static async generateSingleQuestion(periodId: string, level: number, difficulty: string, topic?: string) {
    console.log(`\n❓ [ActivityService] generateSingleQuestion`);
    console.log(`📌 PeriodId: ${periodId}, Level: ${level}, Difficulty: ${difficulty}, Topic: ${topic || "nenhum"}`);

    const periodName = PERIOD_NAMES[periodId] || "História do Brasil";
    console.log(`📖 Período: ${periodName}`);

    const prompt = `Você é especialista em história brasileira. Gere uma pergunta de quiz sobre ${periodName}, nível ${level}, dificuldade ${difficulty || "médio"}.
${topic ? `Tema: ${topic}` : ""}
Responda APENAS com JSON: { "question": "", "options": [], "correctIndex": 0, "explanation": "" }

JSON:`;

    console.log("🟢 Chamando AIService.generateText para gerar questão...");
    const content = await AIService.generateText(prompt, 500);
    console.log(`📄 Resposta bruta: ${content.substring(0, 200)}...`);

    const questionData = AIService.extractJSON(content);
    console.log("📦 JSON extraído:", JSON.stringify(questionData, null, 2));

    return questionData;
  }

  /**
   * Garante que o período tem personagem e imagem de fundo
   */
  private static async ensurePeriodReady(periodId: string) {
    console.log(`\n🔄 [ActivityService.ensurePeriodReady] Verificando período: ${periodId}`);

    const period = await PeriodRepository.getById(periodId);
    if (!period) {
      console.log(`⚠️ Período ${periodId} não encontrado no banco!`);
      return null;
    }

    console.log(`📖 Período encontrado: ${period.name}`);
    let updated = false;
    let charName = period.charactername || period.characterName;
    let charEmoji = period.characteremoji || period.characterEmoji;
    let imageUrl = period.image_url;

    console.log(`👤 Personagem atual: name="${charName || "vazio"}", emoji="${charEmoji || "vazio"}"`);
    console.log(`🖼️ Imagem atual: ${imageUrl || "vazia"}`);

    if (!charName) {
      console.log("🟢 Gerando nome de personagem via IA...");
      const response = await AIService.generateText(
        `Sugira um nome de personagem e emoji para o período "${period.name}". JSON: {"name": "", "emoji": ""}`,
        100
      );
      const charData = AIService.extractJSON(response);
      charName = charData.name;
      charEmoji = charData.emoji;
      updated = true;
      console.log(`✨ Personagem gerado: ${charName} ${charEmoji}`);
    }

    if (!imageUrl) {
      console.log("🟢 Gerando imagem de fundo para o período...");
      const prompt = `Cinematic landscape of ${period.name}, historical atmosphere`;
      console.log(`🎨 Prompt da imagem: "${prompt}"`);
      imageUrl = await AIService.generateImage(prompt);
      updated = true;
      console.log(`🖼️ Imagem gerada: ${imageUrl || "FALHOU"}`);
    }

    if (updated) {
      console.log("💾 Salvando atualizações do período...");
      await PeriodRepository.save({ ...period, characterName: charName, characterEmoji: charEmoji, image_url: imageUrl });
      console.log("✅ Período atualizado com sucesso!");
    } else {
      console.log("✅ Período já completo, nenhuma atualização necessária.");
    }

    return { ...period, characterName: charName, characterEmoji: charEmoji, image_url: imageUrl };
  }

  private static getActivityPrompt(type: string, periodName: string): string {
    console.log(`📝 [getActivityPrompt] Tipo: ${type}, Período: ${periodName}`);
    
    let prompt = "";
    switch (type) {
      case "quiz":
        prompt = `Gere UMA pergunta de múltipla escolha sobre ${periodName}. JSON: { "question": "", "options": [], "correctIndex": 0, "explanation": "", "imagePrompt": "" }`;
        break;
      case "chronological":
        prompt = `Gere UMA ordenação cronológica de 5 eventos sobre ${periodName}. JSON: { "instruction": "", "events": [{ "text": "", "year": 0, "description": "" }], "explanation": "" }`;
        break;
      case "true_false":
        prompt = `Gere UMA afirmação V/F sobre ${periodName}. JSON: { "statement": "", "isTrue": true, "explanation": "" }`;
        break;
      case "fill_blank":
        prompt = `Gere UMA atividade de lacunas sobre ${periodName}. JSON: { "textWithBlanks": "", "blanks": [], "options": [], "explanation": "" }`;
        break;
      case "matching":
        prompt = `Gere UMA atividade de associação sobre ${periodName} com 4 pares. JSON: { "instruction": "", "pairs": [{ "left": "", "right": "" }], "explanation": "" }`;
        break;
      default:
        prompt = `Gere um quiz sobre ${periodName}. JSON: { "question": "", "options": [], "correctIndex": 0, "explanation": "" }`;
    }
    
    console.log(`📝 Prompt gerado (resumido): ${prompt.substring(0, 150)}...`);
    return prompt;
  }
}