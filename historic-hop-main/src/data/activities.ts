const API_URL = "http://localhost:5001";

export type ActivityType = "quiz" | "chronological" | "true_false" | "fill_blank" | "matching";

export interface BaseActivity {
  id: string;
  type: ActivityType;
  level: number;
  period: string;
  topic: string;
  difficulty: string;
}

export interface QuizActivity extends BaseActivity {
  type: "quiz";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  mediaType?: "text" | "image" | "audio" | "video";
}

export interface ChronologicalActivity extends BaseActivity {
  type: "chronological";
  instruction: string;
  events: { text: string; year: number }[];
  explanation: string;
}

export interface TrueFalseActivity extends BaseActivity {
  type: "true_false";
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export interface FillBlankActivity extends BaseActivity {
  type: "fill_blank";
  textWithBlanks: string; // use __BLANK__ as placeholder
  blanks: string[]; // correct answers in order
  options: string[]; // shuffled options including distractors
  explanation: string;
}

export interface MatchingActivity extends BaseActivity {
  type: "matching";
  instruction: string;
  pairs: { left: string; right: string }[];
  explanation: string;
  imageUrl?: string | null;
}

export type Activity = QuizActivity | ChronologicalActivity | TrueFalseActivity | FillBlankActivity | MatchingActivity;

// Historical periods for Brazil
export interface HistoricalPeriod {
  id: string;
  name: string;
  emoji: string;
  years: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  characterName: string;
  characterEmoji: string;
  image_url?: string;
}

export const HISTORICAL_PERIODS: HistoricalPeriod[] = [
  {
    id: "colonia",
    name: "Brasil Colônia",
    emoji: "⛵",
    years: "1500–1822",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    description: "Chegada dos portugueses, escravidão, ciclos econômicos",
    characterName: "Padre Manoel",
    characterEmoji: "⛪",
  },
  {
    id: "imperio",
    name: "Império do Brasil",
    emoji: "👑",
    years: "1822–1889",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    description: "Independência, D. Pedro I e II, Abolição da Escravidão",
    characterName: "Imperador Pedro",
    characterEmoji: "👑",
  },
  {
    id: "republica_velha",
    name: "República Velha",
    emoji: "☕",
    years: "1889–1930",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    description: "Política do café com leite, coronelismo, revoltas",
    characterName: "Coronel Silva",
    characterEmoji: "🎩",
  },
  {
    id: "era_vargas",
    name: "Era Vargas",
    emoji: "🏭",
    years: "1930–1945",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    description: "Getúlio Vargas, CLT, Estado Novo, industrialização",
    characterName: "Operário João",
    characterEmoji: "🔧",
  },
  {
    id: "ditadura",
    name: "Ditadura Militar",
    emoji: "✊",
    years: "1964–1985",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    description: "Golpe militar, AI-5, resistência, redemocratização",
    characterName: "Estudante Maria",
    characterEmoji: "📢",
  },
  {
    id: "nova_republica",
    name: "Nova República",
    emoji: "🗳️",
    years: "1985–presente",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    description: "Constituição de 88, Plano Real, democracia",
    characterName: "Cidadão Carlos",
    characterEmoji: "🗳️",
  },
];


/// Função para gerar lote de atividades (CORRIGIDA)
export async function generateActivitiesForPeriod(
  periodId: string,
  count: number = 5,
  level: number = 1,
  difficulty: "Fácil" | "Médio" | "Avançado" = "Fácil"
): Promise<QuizActivity[]> {
  try {
    console.log(`🚀 [activities.ts] Gerando ${count} atividades para ${periodId}`);
    
    const response = await fetch(`${API_URL}/api/generate-activity/generate-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        periodId,
        count,
        level,
        difficulty,
      }),
    });

    console.log(`📡 [activities.ts] Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro do backend:", errorText);
      return [];
    }

    const data = await response.json();
    console.log("📦 [activities.ts] Dados recebidos:", data);
    
    // Extrai as atividades (pode estar em data.activities ou data diretamente)
    let rawActivities = [];
    if (data.activities && Array.isArray(data.activities)) {
      rawActivities = data.activities;
    } else if (Array.isArray(data)) {
      rawActivities = data;
    } else {
      console.error("❌ Formato inesperado:", data);
      return [];
    }
    
    console.log(`📊 [activities.ts] ${rawActivities.length} atividades brutas recebidas`);
    
    // Converte para o formato QuizActivity
    const quizActivities: QuizActivity[] = rawActivities
      .filter(act => act.type === "quiz") // Só pega quizzes
      .map((act, index) => {
        console.log(`🔄 Convertendo atividade ${index + 1}:`, act);
        
        return {
          id: act.id || `quiz-${Date.now()}-${index}`,
          type: "quiz",
          level: act.level || level,
          period: periodId,
          topic: `História - ${periodId}`,
          difficulty: act.difficulty || difficulty,
          question: act.content?.question || "Pergunta não disponível",
          options: act.content?.options || ["Opção A", "Opção B", "Opção C", "Opção D"],
          correctIndex: act.content?.correctIndex || 0,
          explanation: act.content?.explanation || "Sem explicação disponível",
          imageUrl: act.imageUrl || null,
          mediaType: act.imageUrl ? "image" : "text"
        };
      });
    
    console.log(`✅ [activities.ts] ${quizActivities.length} quizzes convertidos`);
    return quizActivities;
    
  } catch (error) {
    console.error("❌ Erro na geração de lote:", error);
    return [];
  }
}