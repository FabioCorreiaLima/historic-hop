// src/utils/activityAdapter.ts

export interface RawActivity {
  id: string;
  type: string;
  periodId: string;
  level: number;
  difficulty: string;
  content: any;
  imageUrl: string | null;
  mapUrl: string | null;
  avatarUrl: string | null;
  isAIGenerated: boolean;
}

export interface QuizActivity {
  id: number;
  type: "quiz";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  level: number;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  mediaType?: "image" | "audio" | "video" | "text";
}

export interface TrueFalseActivity {
  id: number;
  type: "true_false";
  statement: string;
  isTrue: boolean;
  explanation: string;
  level: number;
  imageUrl?: string;
}

export interface FillBlankActivity {
  id: number;
  type: "fill_blank";
  textWithBlanks: string;
  blanks: Array<{ id: string; description: string }>;
  options: Array<{ id: string; description: string; isCorrect: boolean }>;
  explanation: string;
  level: number;
  imageUrl?: string;
}

export interface ChronologicalActivity {
  id: number;
  type: "chronological";
  instruction: string;
  events: Array<{ text: string; year: number; description: string }>;
  explanation: string;
  level: number;
  imageUrl?: string;
}

export interface MatchingActivity {
  id: number;
  type: "matching";
  instruction: string;
  pairs: Array<{ left: string; right: string }>;
  explanation: string;
  level: number;
  imageUrl?: string;
}

export type Activity = QuizActivity | TrueFalseActivity | FillBlankActivity | ChronologicalActivity | MatchingActivity;

/**
 * Converte uma atividade bruta do backend para o formato do frontend
 */
export function adaptActivity(raw: RawActivity): Activity {
  console.log("🔄 Adaptando atividade:", raw.type, raw.id);
  
  const baseActivity = {
    id: parseInt(raw.id.replace(/-/g, '').slice(0, 8), 16) || Math.floor(Math.random() * 10000),
    level: raw.level,
    imageUrl: raw.imageUrl || undefined,
  };

  switch (raw.type) {
    case "quiz":
      return {
        ...baseActivity,
        type: "quiz",
        question: raw.content.question,
        options: raw.content.options,
        correctIndex: raw.content.correctIndex,
        explanation: raw.content.explanation,
        mediaType: raw.imageUrl ? "image" : "text",
      };

    case "true_false":
      return {
        ...baseActivity,
        type: "true_false",
        statement: raw.content.statement,
        isTrue: raw.content.isTrue,
        explanation: raw.content.explanation,
      };

    case "fill_blank":
      return {
        ...baseActivity,
        type: "fill_blank",
        textWithBlanks: raw.content.textWithBlanks,
        blanks: raw.content.blanks || [],
        options: raw.content.options || [],
        explanation: raw.content.explanation,
      };

    case "chronological":
      return {
        ...baseActivity,
        type: "chronological",
        instruction: raw.content.instruction || "Ordene os eventos cronologicamente",
        events: raw.content.events || [],
        explanation: raw.content.explanation || "",
      };

    case "matching":
      return {
        ...baseActivity,
        type: "matching",
        instruction: raw.content.instruction || "Associe corretamente",
        pairs: raw.content.pairs || [],
        explanation: raw.content.explanation || "",
      };

    default:
      throw new Error(`Tipo de atividade desconhecido: ${raw.type}`);
  }
}

/**
 * Adapta um array de atividades
 */
export function adaptActivities(rawActivities: RawActivity[]): Activity[] {
  return rawActivities.map(adaptActivity);
}