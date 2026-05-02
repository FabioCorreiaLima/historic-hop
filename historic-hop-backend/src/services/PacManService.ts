/**
 * PacManService
 * Fornece dados temáticos para cada fase do Pac-Man History,
 * baseados nos períodos históricos do Brasil.
 * Os dados podem ser estáticos (fallback rápido) ou enriquecidos pela IA (Groq).
 */

import { AIService } from "./AIService.js";
import { PeriodRepository } from "../repositories/PeriodRepository.js";

export interface PacManPhaseData {
  periodId: string;
  periodName: string;
  theme: {
    wallColor: string;      // hex color para as paredes do labirinto
    bgColor: string;        // hex color do fundo
    accentColor: string;    // cor do pacman e itens
    atmosphereLabel: string; // ex: "Engenho de Açúcar", "Café com Leite"
  };
  ghosts: Array<{
    name: string;           // ex: "Escravidão", "Censura"
    emoji: string;
    description: string;    // mostrado ao derrotar com power pellet
    tintColor: string;      // hex
  }>;
  collectibles: Array<{
    name: string;           // personagem histórico
    emoji: string;
    fact: string;           // fato rápido exibido ao coletar
  }>;
  powerPellets: Array<{
    name: string;           // evento marcante
    emoji: string;
    effect: string;         // descrição do efeito educacional
    challenge?: {           // Pergunta específica para esta estrela
      question: string;
      options: string[];
      correctIndex: number;
    };
  }>;
  mazeLayout?: string[];    // Layout customizado para a fase
  finalChallenge: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  periodSummary: string;    // parágrafo de resumo do período
}

// Dados estáticos de fallback para os 6 grandes períodos.
// Usados quando a IA não está disponível ou para resposta rápida.
const STATIC_PHASE_DATA: Record<string, Omit<PacManPhaseData, "periodId" | "periodName">> = {
  "brasil-colonia": {
    theme: { wallColor: "#78350f", bgColor: "#1c0a00", accentColor: "#f59e0b", atmosphereLabel: "Capitanias Hereditárias" },
    ghosts: [
      { name: "Escravidão", emoji: "⛓️", tintColor: "#7f1d1d", description: "A escravidão africana sustentou a economia colonial por mais de 300 anos, deixando marcas profundas na sociedade brasileira." },
      { name: "Inquisição", emoji: "🔥", tintColor: "#b45309", description: "O Tribunal do Santo Ofício perseguiu cristãos-novos, indígenas e dissidentes religiosos no Brasil colonial." },
      { name: "Coronelismo", emoji: "👑", tintColor: "#6d28d9", description: "Os donatários das capitanias exerciam poder absoluto sobre suas terras e súditos." },
    ],
    collectibles: [
      { name: "Tiradentes", emoji: "⚔️", fact: "Joaquim José da Silva Xavier, o Tiradentes, liderou a Inconfidência Mineira em 1789, sendo o único condenado à morte." },
      { name: "Padre Anchieta", emoji: "✝️", fact: "José de Anchieta foi missionário jesuíta que aprendeu o tupi-guarani para catequizar os indígenas no século XVI." },
      { name: "Zumbi dos Palmares", emoji: "🛡️", fact: "Zumbi liderou o Quilombo dos Palmares, a maior comunidade quilombola da história, resistindo por décadas às tropas coloniais." },
      { name: "Caramuru", emoji: "🚢", fact: "Diogo Álvares, o Caramuru, foi um náufrago português que viveu entre os tupinambás na Bahia no século XVI." },
    ],
    powerPellets: [
      { 
        name: "Abolição do Pau-Brasil", emoji: "🌿", effect: "O ciclo do pau-brasil (1500-1550) foi o primeiro grande ciclo econômico colonial.",
        challenge: {
          question: "Qual foi o motivo da exploração intensiva do Pau-Brasil pelos portugueses?",
          options: ["Uso da madeira para construção naval", "Extração de tinta vermelha para tecidos", "Uso medicinal das folhas", "Exportação de sementes"],
          correctIndex: 1
        }
      },
      { 
        name: "Carta de Pero Vaz", emoji: "📜", effect: "A carta de Pero Vaz de Caminha (1500) é o primeiro documento escrito sobre o Brasil.",
        challenge: {
          question: "Para quem Pero Vaz de Caminha escreveu a famosa carta de 'achamento' do Brasil?",
          options: ["D. Pedro I", "D. João VI", "D. Manuel I", "Papa Alexandre VI"],
          correctIndex: 2
        }
      },
    ],
    finalChallenge: {
      question: "Qual foi o principal produto de exportação do Brasil durante o século XVII?",
      options: ["Ouro", "Açúcar", "Pau-Brasil", "Café"],
      correctIndex: 1,
      explanation: "O açúcar foi o principal produto colonial no século XVII, cultivado nos engenhos do Nordeste com mão de obra escravizada africana.",
    },
    periodSummary: "O Brasil Colonial (1500-1822) foi marcado pela exploração do território pelos portugueses, o ciclo do açúcar no Nordeste, o tráfico de africanos escravizados e a resistência indígena. A economia girava em torno da produção para exportação à metrópole.",
  },

  "imperio": {
    theme: { wallColor: "#1e3a5f", bgColor: "#0a1628", accentColor: "#fcd34d", atmosphereLabel: "Segundo Reinado" },
    ghosts: [
      { name: "Escravidão", emoji: "⛓️", tintColor: "#7f1d1d", description: "Mesmo no Império, a escravidão persistiu até 1888, sustentando a economia cafeeira." },
      { name: "Caudilhismo", emoji: "🗡️", tintColor: "#1d4ed8", description: "Líderes militares regionais disputavam poder com o governo central durante todo o período imperial." },
      { name: "Monopólio", emoji: "💰", tintColor: "#b45309", description: "Portugal mantinha o controle do comércio, impedindo o livre desenvolvimento econômico da colônia e depois do Império." },
    ],
    collectibles: [
      { name: "D. Pedro I", emoji: "👑", fact: "Dom Pedro I proclamou a Independência em 7 de setembro de 1822 às margens do Rio Ipiranga, em São Paulo." },
      { name: "D. Pedro II", emoji: "🎓", fact: "Dom Pedro II governou o Brasil por 49 anos (1841-1889), sendo um entusiasta das ciências e das artes." },
      { name: "Princesa Isabel", emoji: "📝", fact: "A Princesa Isabel assinou a Lei Áurea em 13 de maio de 1888, abolindo a escravidão no Brasil." },
      { name: "Barão de Mauá", emoji: "🏭", fact: "Irineu Evangelista de Sousa, o Barão de Mauá, foi o maior industrial do Brasil imperial, fundando bancos e ferrovias." },
    ],
    powerPellets: [
      { 
        name: "Lei Áurea", emoji: "📜", effect: "A Lei Áurea (1888) aboliu a escravidão no Brasil.",
        challenge: {
          question: "Quem assinou a Lei Áurea em 1888?",
          options: ["D. Pedro II", "Princesa Isabel", "Barão de Mauá", "José do Patrocínio"],
          correctIndex: 1
        }
      },
      { 
        name: "Guerra do Paraguai", emoji: "⚔️", effect: "A Guerra do Paraguai foi o maior conflito armado da América do Sul.",
        challenge: {
          question: "Qual país formava a Tríplice Aliança junto com o Brasil e o Uruguai?",
          options: ["Argentina", "Chile", "Bolívia", "Equador"],
          correctIndex: 0
        }
      },
    ],
    finalChallenge: {
      question: "Em que ano foi proclamada a República no Brasil, encerrando o Período Imperial?",
      options: ["1888", "1889", "1891", "1822"],
      correctIndex: 1,
      explanation: "A República foi proclamada em 15 de novembro de 1889 pelo Marechal Deodoro da Fonseca, após um golpe militar que depôs Dom Pedro II.",
    },
    periodSummary: "O Império brasileiro (1822-1889) foi o único período monárquico da América do Sul. Sob Dom Pedro II, o país se modernizou com ferrovias e telégrafos, mas a abolição da escravidão (1888) e a insatisfação militar levaram à proclamação da República em 1889.",
  },

  "republica-velha": {
    theme: { wallColor: "#14532d", bgColor: "#052e16", accentColor: "#86efac", atmosphereLabel: "Política do Café com Leite" },
    ghosts: [
      { name: "Coronelismo", emoji: "🤝", tintColor: "#92400e", description: "Os coronéis controlavam os votos da população rural através do clientelismo e da coerção." },
      { name: "Voto de Cabresto", emoji: "🗳️", tintColor: "#7f1d1d", description: "Eleitores eram pressionados por coronéis a votar em candidatos indicados, tornando as eleições uma farsa." },
      { name: "Oligarquia", emoji: "💼", tintColor: "#1e3a5f", description: "Poucos grupos familiares dominavam a política estadual e nacional, alternando-se no poder." },
    ],
    collectibles: [
      { name: "Getúlio Vargas", emoji: "🎩", fact: "Getúlio Vargas encerrou a República Velha em 1930 com a Revolução que o levou ao poder por 15 anos." },
      { name: "Rui Barbosa", emoji: "⚖️", fact: "Rui Barbosa foi jurista, político e candidato à presidência em 1910, na Campanha Civilista." },
      { name: "Canudos - A. Conselheiro", emoji: "🏚️", fact: "Antônio Conselheiro liderou a comunidade de Canudos (BA) que resistiu a quatro expedições militares entre 1896 e 1897." },
      { name: "Euclides da Cunha", emoji: "✍️", fact: "Euclides da Cunha escreveu 'Os Sertões' (1902), obra fundamental sobre a Guerra de Canudos e o sertão brasileiro." },
    ],
    powerPellets: [
      { name: "Revolta da Vacina", emoji: "💉", effect: "A Revolta da Vacina (1904) explodiu no Rio de Janeiro contra a vacinação obrigatória imposta por Oswaldo Cruz." },
      { name: "Tenentismo", emoji: "🎖️", effect: "O Tenentismo dos anos 1920 representou a insatisfação militar com a oligarquia e abriu caminho para a Revolução de 1930." },
    ],
    finalChallenge: {
      question: "O que ficou conhecido como 'Política do Café com Leite' na República Velha?",
      options: [
        "A exportação de café e leite para a Europa",
        "O revezamento de presidentes entre São Paulo e Minas Gerais",
        "A parceria econômica entre fazendeiros e industriais",
        "O acordo de preços entre cafeicultores e pecuaristas",
      ],
      correctIndex: 1,
      explanation: "A 'Política do Café com Leite' foi o acordo tácito entre as oligarquias de São Paulo (café) e Minas Gerais (leite) para revezar o poder presidencial durante a República Velha (1894-1930).",
    },
    periodSummary: "A República Velha (1889-1930) foi dominada pelas oligarquias estaduais, especialmente de São Paulo e Minas Gerais. A 'Política do Café com Leite' garantia o revezamento no poder, enquanto o coronelismo controlava as eleições. Movimentos como Canudos, a Revolta da Vacina e o Tenentismo expressaram a insatisfação popular.",
  },

  "era-vargas": {
    theme: { wallColor: "#1e1b4b", bgColor: "#0d0b2b", accentColor: "#a78bfa", atmosphereLabel: "Estado Novo" },
    ghosts: [
      { name: "Censura", emoji: "🚫", tintColor: "#7f1d1d", description: "O DIP (Departamento de Imprensa e Propaganda) controlava os meios de comunicação durante o Estado Novo." },
      { name: "Integralismo", emoji: "⚡", tintColor: "#1d4ed8", description: "A Ação Integralista Brasileira, inspirada no fascismo europeu, tentou um golpe contra Vargas em 1938." },
      { name: "Repressão", emoji: "👁️", tintColor: "#6d28d9", description: "A DOPS (Delegacia de Ordem Política e Social) perseguia opositores políticos e comunistas." },
    ],
    collectibles: [
      { name: "Getúlio Vargas", emoji: "🎩", fact: "Vargas governou o Brasil por 18 anos em dois períodos distintos (1930-1945 e 1951-1954), sendo o 'pai dos pobres'." },
      { name: "Graciliano Ramos", emoji: "📖", fact: "Graciliano Ramos, autor de 'Vidas Secas', foi preso pelo regime Vargas em 1936 sob acusações políticas." },
      { name: "Carmen Miranda", emoji: "🍌", fact: "Carmen Miranda foi a artista brasileira mais famosa dos anos 1940, exportando a cultura nacional para Hollywood." },
      { name: "Monteiro Lobato", emoji: "📚", fact: "Monteiro Lobato foi censurado e preso durante o Estado Novo por criticar as políticas de Vargas." },
    ],
    powerPellets: [
      { name: "Consolidação das Leis do Trabalho", emoji: "📋", effect: "A CLT (1943) criou os direitos trabalhistas brasileiros: salário mínimo, férias e jornada de 8h. Marco histórico!" },
      { name: "Criação da Petrobras", emoji: "⛽", effect: "A Petrobras foi criada em 1953 com a campanha 'O petróleo é nosso', símbolo do nacionalismo varguista." },
    ],
    finalChallenge: {
      question: "Como Getúlio Vargas deixou o poder em 1954?",
      options: ["Foi deposto por um golpe militar", "Perdeu as eleições", "Suicidou-se com um tiro no coração", "Morreu de doença"],
      correctIndex: 2,
      explanation: "Vargas suicidou-se em 24 de agosto de 1954, deixando uma carta-testamento que dizia: 'Saio da vida para entrar na história'.",
    },
    periodSummary: "A Era Vargas (1930-1945 e 1951-1954) foi marcada pelo populismo, pela industrialização e pela criação dos direitos trabalhistas. O Estado Novo (1937-1945) foi um regime ditatorial com censura e repressão. Vargas se suicidou em 1954, em um dos momentos mais dramáticos da história brasileira.",
  },

  "ditadura-militar": {
    theme: { wallColor: "#7f1d1d", bgColor: "#2d0a0a", accentColor: "#f87171", atmosphereLabel: "Anos de Chumbo" },
    ghosts: [
      { name: "AI-5", emoji: "📋", tintColor: "#1d4ed8", description: "O Ato Institucional nº 5 (1968) foi o instrumento mais duro da ditadura, suspendendo direitos civis e autorizando prisões." },
      { name: "Censura", emoji: "✂️", tintColor: "#92400e", description: "Músicas, filmes, livros e jornais eram censurados. Artistas usavam metáforas e alegorias para driblar a censura." },
      { name: "DOPS", emoji: "👁️", tintColor: "#6d28d9", description: "A polícia política prendia, torturava e fazia desaparecer opositores do regime militar." },
    ],
    collectibles: [
      { name: "Chico Buarque", emoji: "🎵", fact: "Chico Buarque usou metáforas em músicas como 'Apesar de Você' (1970) para criticar a ditadura burlando a censura." },
      { name: "Tancredo Neves", emoji: "🕊️", fact: "Tancredo Neves foi eleito indiretamente em 1985, encerrando a ditadura, mas morreu antes de tomar posse." },
      { name: "Ulysses Guimarães", emoji: "📜", fact: "Ulysses Guimarães presidiu a Assembleia Constituinte e foi o grande articulador da Constituição de 1988." },
      { name: "Che Guevara (influência)", emoji: "⭐", fact: "A guerrilha do Araguaia (1972-1974) foi a principal resistência armada ao regime militar no Brasil." },
    ],
    powerPellets: [
      { name: "Lei da Anistia", emoji: "🕊️", effect: "A Lei da Anistia (1979) permitiu o retorno dos exilados políticos e foi passo fundamental para a redemocratização." },
      { name: "Diretas Já!", emoji: "📣", effect: "O movimento Diretas Já (1984) mobilizou milhões de brasileiros pedindo eleições diretas para presidente. Democracia em marcha!" },
    ],
    finalChallenge: {
      question: "Qual evento marcou o início da Ditadura Militar no Brasil?",
      options: ["Suicídio de Vargas em 1954", "Golpe de Estado em 31 de março de 1964", "Criação do AI-5 em 1968", "Eleição de Castelo Branco em 1965"],
      correctIndex: 1,
      explanation: "O Golpe de 31 de março de 1964 depôs o presidente João Goulart (Jango), iniciando 21 anos de ditadura militar no Brasil (1964-1985).",
    },
    periodSummary: "A Ditadura Militar (1964-1985) foi um regime de exceção que suprimiu direitos civis, perseguiu opositores e censurou a cultura. Os 'Anos de Chumbo' (1968-1974) foram os mais repressivos. A resistência cultural e política, culminando nas Diretas Já (1984), abriu caminho para a redemocratização.",
  },

  "nova-republica": {
    theme: { wallColor: "#065f46", bgColor: "#022c22", accentColor: "#34d399", atmosphereLabel: "Redemocratização" },
    ghosts: [
      { name: "Corrupção", emoji: "💸", tintColor: "#b45309", description: "O esquema 'PC Farias' levou ao impeachment de Collor em 1992, primeiro do gênero na história brasileira." },
      { name: "Hiperinflação", emoji: "📈", tintColor: "#7f1d1d", description: "O Brasil chegou a ter inflação de 80% ao mês em 1994, antes do Plano Real." },
      { name: "Desigualdade", emoji: "⚖️", tintColor: "#1e3a5f", description: "O Brasil herdou dos períodos anteriores uma das maiores desigualdades sociais do mundo." },
    ],
    collectibles: [
      { name: "Lula", emoji: "✊", fact: "Luiz Inácio Lula da Silva fundou o PT em 1980, perdeu três eleições presidenciais antes de ser eleito em 2002." },
      { name: "Fernando Henrique Cardoso", emoji: "💱", fact: "FHC criou o Plano Real (1994) como ministro da Fazenda, estabilizando a economia e depois governou por dois mandatos." },
      { name: "Sérgio Moro", emoji: "⚖️", fact: "O juiz Sérgio Moro conduziu a Operação Lava Jato a partir de 2014, investigando corrupção na Petrobras." },
      { name: "Dilma Rousseff", emoji: "📊", fact: "Dilma Rousseff foi a primeira mulher presidente do Brasil (2011-2016), sendo afastada por impeachment em 2016." },
    ],
    powerPellets: [
      { name: "Constituição de 1988", emoji: "📜", effect: "A Constituição Cidadã (1988) garantiu direitos fundamentais, saúde e educação públicas e o voto direto. Conquista do povo!" },
      { name: "Plano Real", emoji: "💰", effect: "O Plano Real (1994) acabou com a hiperinflação e estabilizou a economia brasileira. Transformação histórica!" },
    ],
    finalChallenge: {
      question: "Que documento ficou conhecido como 'Constituição Cidadã' e foi promulgado em 1988?",
      options: [
        "A Declaração dos Direitos do Homem e do Cidadão",
        "A Carta Magna da República",
        "A Constituição Federal de 1988",
        "O Plano Diretor da República Nova",
      ],
      correctIndex: 2,
      explanation: "A Constituição Federal de 1988, chamada de 'Constituição Cidadã' por Ulysses Guimarães, estabeleceu o Estado Democrático de Direito no Brasil após 21 anos de ditadura.",
    },
    periodSummary: "A Nova República (1985-presente) restaurou a democracia no Brasil. A Constituição de 1988 garantiu direitos fundamentais. O Plano Real (1994) venceu a hiperinflação. O país enfrentou crises de corrupção (Collor, Mensalão, Lava Jato) e avanços sociais como o Bolsa Família e a ascensão das classes médias.",
  },
};

export class PacManService {
  /**
   * Busca os dados temáticos de uma fase do Pac-Man History.
   * Primeiro tenta match por ID exato ou parcial nos dados estáticos.
   * Se não encontrar, gera via IA como fallback.
   */
  static async getPhaseData(periodId: string): Promise<PacManPhaseData> {
    const period = await PeriodRepository.getById(periodId);
    const periodName = period?.name ?? "Período Histórico";

    // Tenta match nos dados estáticos
    const staticKey = this.findStaticKey(periodId, periodName);
    if (staticKey && STATIC_PHASE_DATA[staticKey]) {
      return {
        periodId,
        periodName,
        ...STATIC_PHASE_DATA[staticKey],
      };
    }

    // Fallback: gera com IA
    return this.generateWithAI(periodId, periodName);
  }

  /**
   * Encontra a chave estática correspondente ao período
   */
  private static findStaticKey(periodId: string, periodName: string): string | null {
    const id = periodId.toLowerCase();
    const name = periodName.toLowerCase();

    if (id.includes("colonia") || name.includes("colônia") || name.includes("colonial")) return "brasil-colonia";
    if (id.includes("imperio") || name.includes("impér") || name.includes("pedro")) return "imperio";
    if (id.includes("republica-velha") || name.includes("velha") || name.includes("café com leite")) return "republica-velha";
    if (id.includes("vargas") || name.includes("vargas") || name.includes("estado novo")) return "era-vargas";
    if (id.includes("ditadura") || name.includes("ditadura") || name.includes("militar") || name.includes("chumbo")) return "ditadura-militar";
    if (id.includes("nova-republica") || name.includes("nova república") || name.includes("redemocrat")) return "nova-republica";

    return null;
  }

  /**
   * Gera dados da fase via IA para períodos não cobertos pelos dados estáticos
   */
  private static async generateWithAI(periodId: string, periodName: string): Promise<PacManPhaseData> {
    const prompt = `Você é um especialista em história do Brasil. Gere dados para a fase Pac-Man do período: "${periodName}".

Responda APENAS com JSON válido:
{
  "theme": { "wallColor": "#hexcolor", "bgColor": "#hexcolor", "accentColor": "#hexcolor", "atmosphereLabel": "Nome temático curto" },
  "ghosts": [
    { "name": "Desafio1", "emoji": "🔥", "tintColor": "#hexcolor", "description": "Explicação histórica em 1 frase" },
    { "name": "Desafio2", "emoji": "⛓️", "tintColor": "#hexcolor", "description": "Explicação histórica em 1 frase" },
    { "name": "Desafio3", "emoji": "👁️", "tintColor": "#hexcolor", "description": "Explicação histórica em 1 frase" }
  ],
  "collectibles": [
    { "name": "Personagem1", "emoji": "👑", "fact": "Fato histórico em 1 frase" },
    { "name": "Personagem2", "emoji": "✍️", "fact": "Fato histórico em 1 frase" },
    { "name": "Personagem3", "emoji": "⚔️", "fact": "Fato histórico em 1 frase" },
    { "name": "Personagem4", "emoji": "📜", "fact": "Fato histórico em 1 frase" }
  ],
  "powerPellets": [
    { 
      "name": "Evento Marcante 1", "emoji": "⭐", "effect": "Explicação curta",
      "challenge": { 
        "question": "Pergunta ÚNICA e DIFERENTE da final sobre este evento?", 
        "options": ["Certa", "Errada1", "Errada2", "Errada3"], 
        "correctIndex": 0 
      }
    },
    { 
      "name": "Evento Marcante 2", "emoji": "📣", "effect": "Explicação curta",
      "challenge": { 
        "question": "Outra pergunta EXCLUSIVA sobre este segundo evento?", 
        "options": ["Errada1", "Certa", "Errada2", "Errada3"], 
        "correctIndex": 1 
      }
    }
  ],
  "finalChallenge": {
    "question": "Pergunta FINAL abrangente sobre o período?",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "Explicação detalhada"
  },
  "periodSummary": "Resumo de 3 frases."
}

IMPORTANTE: As perguntas das powerPellets DEVEM ser diferentes entre si e diferentes da pergunta do finalChallenge.

JSON:`;

    try {
      const content = await AIService.generateText(prompt, 1500);
      const data = AIService.extractJSON(content);

      return {
        periodId,
        periodName,
        theme: data.theme ?? { wallColor: "#1e3a5f", bgColor: "#0a1628", accentColor: "#fcd34d", atmosphereLabel: periodName },
        ghosts: data.ghosts ?? [],
        collectibles: data.collectibles ?? [],
        powerPellets: data.powerPellets ?? [],
        finalChallenge: data.finalChallenge ?? {
          question: `Qual foi a principal característica do período ${periodName}?`,
          options: ["Resposta A", "Resposta B", "Resposta C", "Resposta D"],
          correctIndex: 0,
          explanation: "Consulte seu professor para mais detalhes sobre este período.",
        },
        periodSummary: data.periodSummary ?? `${periodName} foi um período importante da história do Brasil.`,
      };
    } catch (e) {
      // Fallback mínimo em caso de falha total da IA
      return {
        periodId,
        periodName,
        theme: { wallColor: "#1e3a5f", bgColor: "#0a1628", accentColor: "#fcd34d", atmosphereLabel: periodName },
        ghosts: [
          { name: "Conflito", emoji: "⚔️", tintColor: "#7f1d1d", description: `Os conflitos do período ${periodName} marcaram a história do Brasil.` },
          { name: "Opressão", emoji: "⛓️", tintColor: "#92400e", description: "A opressão sobre grupos vulneráveis foi uma constante na história brasileira." },
        ],
        collectibles: [
          { name: "Personagem Histórico", emoji: "👑", fact: `Personagens importantes marcaram o período ${periodName}.` },
        ],
        powerPellets: [
          { name: "Evento Marcante", emoji: "⭐", effect: `Um evento transformador do período ${periodName}. +500 pontos!` },
        ],
        finalChallenge: {
          question: `Qual foi o principal evento do período ${periodName}?`,
          options: ["Opção A", "Opção B", "Opção C", "Opção D"],
          correctIndex: 0,
          explanation: "Este período foi fundamental para a formação do Brasil moderno.",
        },
        periodSummary: `${periodName} foi um período importante que moldou a sociedade brasileira.`,
      };
    }
  }
}
