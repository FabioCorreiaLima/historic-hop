/**
 * DifficultyService
 * Fonte única de verdade para as regras de dificuldade do Historic Hop.
 * Usado tanto pelo ActivityService (geração de prompts) quanto pelo frontend (via config espelhada).
 */

export type DifficultyTier = "Fácil" | "Médio" | "Difícil" | "Especialista" | "Mestre" | "Historiador";
export type ActivityType = "quiz" | "true_false" | "chronological" | "fill_blank" | "matching";

export interface DifficultyConfig {
  tier: DifficultyTier;
  timerSeconds: number;
  allowedTypes: ActivityType[];
  promptGuidelines: string;
  questionComplexity: string;
}

const DIFFICULTY_MAP: Record<string, DifficultyConfig> = {
  "1-3": {
    tier: "Fácil",
    timerSeconds: 30,
    allowedTypes: ["quiz"],
    questionComplexity: "básica e direta",
    promptGuidelines: `
- Perguntas simples sobre fatos conhecidos (datas, nomes, eventos famosos)
- Linguagem acessível para estudantes do ensino fundamental
- 4 opções claras, com distratores óbvios
- Evite termos técnicos ou análises complexas
- Foco em: O quê? Quando? Quem?`,
  },
  "4-6": {
    tier: "Médio",
    timerSeconds: 25,
    allowedTypes: ["quiz", "true_false"],
    questionComplexity: "intermediária com algum contexto",
    promptGuidelines: `
- Perguntas que exigem algum contexto histórico além do fato isolado
- Inclua afirmações V/F sobre interpretações históricas
- Distratores mais elaborados, plausíveis mas incorretos
- Foco em: Por quê? Como se relaciona?`,
  },
  "7-9": {
    tier: "Difícil",
    timerSeconds: 20,
    allowedTypes: ["quiz", "chronological"],
    questionComplexity: "avançada com análise de causa e efeito",
    promptGuidelines: `
- Perguntas que exijam análise de causa e consequência
- Ordenação cronológica de eventos relacionados
- Distratores muito próximos da resposta correta
- Foco em: Quais foram as consequências? O que veio antes/depois?`,
  },
  "10-12": {
    tier: "Especialista",
    timerSeconds: 18,
    allowedTypes: ["quiz", "fill_blank"],
    questionComplexity: "analítica com lacunas em textos históricos",
    promptGuidelines: `
- Perguntas de análise histórica aprofundada
- Atividades de completar lacunas em textos históricos autênticos ou reconstituídos
- Exija conhecimento de motivações políticas, econômicas e sociais
- Foco em: Quais foram os grupos envolvidos? Quais interesses estavam em jogo?`,
  },
  "13-15": {
    tier: "Mestre",
    timerSeconds: 15,
    allowedTypes: ["quiz", "matching"],
    questionComplexity: "crítica com associação entre conceitos e períodos",
    promptGuidelines: `
- Perguntas que relacionem eventos de períodos diferentes
- Associações entre personagens, documentos, leis e seus impactos
- Exija pensamento crítico sobre interpretações historiográficas
- Foco em: Como este evento se compara a outros? Qual a herança histórica?`,
  },
  "16-18": {
    tier: "Historiador",
    timerSeconds: 12,
    allowedTypes: ["quiz", "fill_blank", "matching"],
    questionComplexity: "acadêmica com referências a fontes primárias",
    promptGuidelines: `
- Perguntas baseadas em documentos históricos, discursos e leis reais
- Referencie fontes primárias (ex: Constituição de 1824, Lei Áurea, AI-5)
- Análise de discursos de personagens históricos
- Foco em: O que dizem as fontes? Como os historiadores interpretam?
- OBRIGATÓRIO: o campo "source" deve citar um historiador ou documento real`,
  },
};

export class DifficultyService {
  /**
   * Retorna a configuração de dificuldade para um dado nível (1-18)
   */
  static getConfig(level: number): DifficultyConfig {
    if (level <= 3) return DIFFICULTY_MAP["1-3"];
    if (level <= 6) return DIFFICULTY_MAP["4-6"];
    if (level <= 9) return DIFFICULTY_MAP["7-9"];
    if (level <= 12) return DIFFICULTY_MAP["10-12"];
    if (level <= 15) return DIFFICULTY_MAP["13-15"];
    return DIFFICULTY_MAP["16-18"];
  }

  /**
   * Retorna o nome do tier para um dado nível
   */
  static getTierName(level: number): DifficultyTier {
    return this.getConfig(level).tier;
  }

  /**
   * Retorna o timer em segundos para um dado nível
   */
  static getTimer(level: number): number {
    return this.getConfig(level).timerSeconds;
  }

  /**
   * Retorna os tipos de atividade permitidos para um dado nível
   */
  static getAllowedTypes(level: number): ActivityType[] {
    return this.getConfig(level).allowedTypes;
  }

  /**
   * Seleciona o tipo de atividade mais adequado para o nível,
   * dado um índice de rotação (para variar entre as atividades do batch)
   */
  static selectActivityType(level: number, rotationIndex: number): ActivityType {
    const types = this.getAllowedTypes(level);
    return types[rotationIndex % types.length];
  }

  /**
   * Constrói o bloco de guidelines de prompt para a IA
   */
  static buildPromptGuidelines(level: number): string {
    const config = this.getConfig(level);
    return `
NÍVEL: ${level} (${config.tier})
COMPLEXIDADE: ${config.questionComplexity}
TEMPO DISPONÍVEL PARA O ALUNO: ${config.timerSeconds} segundos
DIRETRIZES PEDAGÓGICAS:${config.promptGuidelines}`;
  }
}
