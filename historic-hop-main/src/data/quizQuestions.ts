import { api } from "@/lib/api";

export interface QuizQuestion {
  id: number;
  level: number;
  difficulty: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  mediaType?: "text" | "image" | "audio" | "video";
  imageUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
}

export interface LevelInfo {
  level: number;
  topic: string;
  difficulty: string;
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestScore: number;
  totalQuestions: number;
}

export async function loadQuizQuestions(): Promise<QuizQuestion[]> {
  try {
    // Try loading from API first
    const data = await api.questions.getQuestionsPublic();
    if (data && data.length > 0) {
      return data.map((q: any, i: number) => ({
        id: i + 1,
        level: q.level,
        difficulty: q.difficulty,
        topic: q.topic,
        question: q.question,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correctIndex: q.correct_index,
        explanation: q.explanation,
        mediaType: q.media_type || "text",
        imageUrl: q.image_url,
        audioUrl: q.audio_url,
        videoUrl: q.video_url,
      }));
    }
  } catch (error) {
    console.error("Erro ao carregar perguntas da API:", error);
  }

  // Fallback to static JSON
  const response = await fetch("/quizQuestions.json");
  if (!response.ok) throw new Error("Falha ao carregar perguntas");
  return response.json();
}

export function getQuestionsForLevel(questions: QuizQuestion[], level: number): QuizQuestion[] {
  return questions.filter(q => q.level === level);
}

export function getLevelInfos(questions: QuizQuestion[], progress: Record<number, LevelProgress>): LevelInfo[] {
  const levels: LevelInfo[] = [];
  const levelNumbers = [...new Set(questions.map(q => q.level))].sort((a, b) => a - b);
  
  for (const lvl of levelNumbers) {
    const lvlQuestions = questions.filter(q => q.level === lvl);
    const prog = progress[lvl];
    const prevCompleted = lvl === 1 || progress[lvl - 1]?.completed;
    
    levels.push({
      level: lvl,
      topic: lvlQuestions[0]?.topic || "",
      difficulty: lvlQuestions[0]?.difficulty || "",
      unlocked: prevCompleted || false,
      completed: prog?.completed || false,
      stars: prog?.stars || 0,
      bestScore: prog?.bestScore || 0,
      totalQuestions: lvlQuestions.length,
    });
  }
  
  return levels;
}

export interface LevelProgress {
  completed: boolean;
  stars: number;
  bestScore: number;
  bestPercentage: number;
}
