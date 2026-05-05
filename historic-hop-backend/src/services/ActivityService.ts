import { AIService } from "./AIService.js";
import { ActivityRepository } from "../repositories/ActivityRepository.js";
import { PeriodRepository } from "../repositories/PeriodRepository.js";
import { CurriculumService } from "./CurriculumService.js";
import { DifficultyService } from "./DifficultyService.js";
import crypto from "crypto";

// Geração 100% dinâmica pela BNCC com escalonamento de dificuldade por nível

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
    if (!period) throw new Error(`Período ${periodId} não encontrado.`);
    
    const periodName = period.name;
    console.log(`📖 Período encontrado: ${periodName}`);

    const periodPrompt = `Você é um especialista em História sobre o período: ${period.name}. Descrição: ${period.description || "Período histórico importante."}.`;
    
    console.log(`📝 Prompt do período (resumido): ${periodPrompt.substring(0, 100)}...`);

    const activityPrompt = this.getActivityPrompt(activityType, periodName, level);
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
      const charName = period?.charactername || period?.characterName || "Personagem histórico";
      const avatarPrompt = `Retrato de ${charName} do período ${periodName}, estilo histórico`;
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
      lessonId: CurriculumService.mainLessonId(periodId),
      level,
      difficulty,
      content: activityData,
      imageUrl,
      mapUrl,
      avatarUrl,
      isAIGenerated: true,
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
  static async generateBatch(
    periodId: string,
    count: number = 5,
    level: number = 1,
    difficulty: string = "Fácil"
  ) {
    console.log(`\n🚀 [ActivityService] Iniciando generateBatch para período ${periodId}`);
    console.log(`📊 Quantidade solicitada: ${count} atividades, Nível: ${level}`);

    // Usa os tipos permitidos para o nível (DifficultyService)
    const allowedTypes = DifficultyService.getAllowedTypes(level);
    console.log(`📋 Tipos permitidos para nível ${level}: ${allowedTypes.join(", ")}`);

    const resolvedDifficulty = DifficultyService.getTierName(level);
    console.log(`🎯 Dificuldade resolvida: ${resolvedDifficulty}`);

    const promises = [];
    for (let i = 0; i < count; i++) {
      const type = DifficultyService.selectActivityType(level, i);
      console.log(`📌 Atividade ${i + 1}/${count} - Tipo: ${type}`);
      promises.push(
        this.generateSingleActivity({ periodId, activityType: type, level, difficulty: resolvedDifficulty })
      );
    }

    console.log("⏳ Aguardando execução paralela de todas as atividades...");
    const results = await Promise.all(promises);
    console.log(`✅ Lote concluído! ${results.length} atividades geradas com sucesso.`);
    return results;
  }

  /**
   * Gera uma única questão de quiz (usado por generateQuestions)
   */
  static async generateSingleQuestion(periodId: string, level: number, difficulty: string, topic?: string) {
    console.log(`\n❓ [ActivityService] generateSingleQuestion`);
    console.log(`📌 PeriodId: ${periodId}, Level: ${level}, Difficulty: ${difficulty}, Topic: ${topic || "nenhum"}`);

    const period = await PeriodRepository.getById(periodId);
    const periodName = period ? period.name : "História do Brasil";
    console.log(`📖 Período: ${periodName}`);

    const prompt = `Você é especialista em história. Gere uma pergunta de quiz sobre ${periodName}, nível ${level}, dificuldade ${difficulty || "médio"}.
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
      const descr = period.description || period.name;
      const response = await AIService.generateText(
        `Sugira um nome de personagem histórico (real ou arquetípico) e um emoji para representar o período "${period.name}". Descrição: ${descr}. JSON: {"name": "", "emoji": ""}`,
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

  /**
   * Monta o prompt da atividade com base no TIPO e no NÍVEL.
   * Todos os tipos incluem os campos educacionais: historicalFact e source.
   */
  private static getActivityPrompt(type: string, periodName: string, level: number = 1): string {
    console.log(`📝 [getActivityPrompt] Tipo: ${type}, Período: ${periodName}, Nível: ${level}`);

    const diffGuidelines = DifficultyService.buildPromptGuidelines(level);

    // Campos educacionais obrigatórios em TODOS os tipos
    const educationalFields = `
  "historicalFact": "Um fato histórico complementar e interessante sobre o tema (diferente da explicação)",
  "source": "Segundo [historiador ou documento real], [afirmação]"${level >= 16 ? ' // OBRIGATÓRIO: cite um historiador real (ex: Boris Fausto, José Murilo de Carvalho)' : ''}`;

    let prompt = "";
    switch (type) {
      case "quiz":
        prompt = `Gere UMA pergunta de múltipla escolha sobre ${periodName}.
${diffGuidelines}
JSON válido:
{
  "question": "Pergunta clara e objetiva",
  "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
  "correctIndex": 0,
  "explanation": "Por que esta resposta está correta e as outras erradas",
  ${educationalFields},
  "imagePrompt": "Cena histórica relacionada à pergunta para gerar imagem"
}`;
        break;

      case "chronological":
        prompt = `Gere UMA atividade de ordenação cronológica com 5 eventos de ${periodName}.
${diffGuidelines}
JSON válido:
{
  "instruction": "Ordene os eventos cronologicamente",
  "events": [
    { "text": "Descrição do evento", "year": 1800, "description": "Contexto do evento" }
  ],
  "explanation": "Explicação da ordem correta e sua importância",
  ${educationalFields}
}`;
        break;

      case "true_false":
        prompt = `Gere UMA afirmação Verdadeira ou Falsa sobre ${periodName}.
${diffGuidelines}
JSON válido:
{
  "statement": "Afirmação histórica a ser avaliada",
  "isTrue": true,
  "explanation": "Por que esta afirmação é verdadeira/falsa com contexto histórico",
  ${educationalFields}
}`;
        break;

      case "fill_blank":
        prompt = `Gere UMA atividade de completar lacunas com texto histórico sobre ${periodName}.
${diffGuidelines}
IMPORTANTE: Use EXCLUSIVAMENTE o marcador __BLANK__ para indicar as lacunas. 
PROIBIDO usar marcadores numerados como __1__, __2__.
O campo "blanks" deve conter as PALAVRAS REAIS que completam o texto, na ordem correta.
JSON válido:
{
  "textWithBlanks": "Texto histórico com __BLANK__ nos lugares das lacunas",
  "blanks": ["palavra_real_1", "palavra_real_2"],
  "options": ["palavra_real_1", "palavra_real_2", "distrator1", "distrator2"],
  "explanation": "Contexto histórico explicando as respostas corretas",
  ${educationalFields}
}`;
        break;

      case "matching":
        prompt = `Gere UMA atividade de associação sobre ${periodName} com 4 pares ÚNICOS.
${diffGuidelines}
IMPORTANTE: Cada item da direita deve ser uma DEFINIÇÃO ou DESCRIÇÃO diferente e específica. 
PROIBIDO repetir o mesmo termo na coluna da direita.
JSON válido:
{
  "instruction": "Associe cada item da coluna A com sua descrição correspondente na coluna B",
  "pairs": [
    { "left": "Personagem ou Evento", "right": "Descrição detalhada e única do item da esquerda" }
  ],
  "explanation": "Explicação das associações e sua importância histórica",
  ${educationalFields}
}`;
        break;

      default:
        prompt = `Gere uma questão de quiz sobre ${periodName}.
${diffGuidelines}
JSON: { "question": "", "options": [], "correctIndex": 0, "explanation": "", ${educationalFields} }`;
    }

    console.log(`📝 Prompt gerado (resumido): ${prompt.substring(0, 150)}...`);
    return prompt;
  }
}