// Centralized API client for Historic Hop
// All API calls should go through here

import { API_BASE } from "@/config/api";
import { Activity, ActivityType } from "@/types";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
}

async function apiCall<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erro na requisição" }));
    throw new Error(error.error || "Erro na API");
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: (email: string, password: string, displayName: string) =>
    apiCall<{ user: unknown; session: unknown }>("/auth/register", {
      method: "POST",
      body: { email, password, name: displayName },
    }),

  login: (email: string, password: string) =>
    apiCall<{ user: unknown; session: unknown }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
};

// User API
export const userApi = {
  getProfile: (token: string) =>
    apiCall<{ id: string; email: string; display_name: string; avatar_url: string }>("/users/profile", {
      token,
    }),

  updateProfile: (token: string, data: { display_name?: string; avatar_url?: string }) =>
    apiCall<unknown>("/users/profile", {
      method: "PUT",
      token,
      body: data,
    }),
};

// Progress API
export const progressApi = {
  syncLevelComplete: (token: string, data: {
    level: number;
    score: number;
    stars: number;
    percentage: number;
    maxCombo: number;
    timeSpent: number;
  }) =>
    apiCall<unknown>("/progress/complete-level", {
      method: "POST",
      token,
      body: data,
    }),

  loadProgress: (token: string) =>
    apiCall<{ level: number; score: number; stars: number; percentage: number }[]>("/progress", {
      token,
    }),

  completeLesson: (
    token: string,
    data: {
      lessonId: string;
      score?: number;
      stars: number;
      percentage: number;
      maxCombo?: number;
      timeSpent?: number;
    }
  ) =>
    apiCall<{
      success: boolean;
      xpGained?: number;
      legacyLevel?: number;
      totalScore?: number;
      maxLevel?: number;
      error?: string;
    }>("/progress/complete-lesson", {
      method: "POST",
      token,
      body: data,
    }),

  submitMinigameScore: (
    token: string,
    data: {
      minigame: string;
      periodId: string;
      score: number;
    }
  ) =>
    apiCall<{
      success: boolean;
      xpGained: number;
      totalScore: number;
      minigame: string;
    }>("/progress/minigame", {
      method: "POST",
      token,
      body: data,
    }),
};

export type CurriculumUnitFromApi = {
  period: Record<string, unknown>;
  orderIndex: number;
  unlocked: boolean;
  lessons: Array<{
    id: string;
    periodId: string;
    title: string;
    orderIndex: number;
    xpReward: number;
    progress: {
      stars: number;
      crownLevel: number;
      bestPercentage: number;
      bestScore: number;
      attempts: number;
      timeSpent: number;
    } | null;
  }>;
};

export const curriculumApi = {
  getPublic: () =>
    apiCall<{ course: { id: string; title: string; slug: string }; units: Omit<CurriculumUnitFromApi, "unlocked">[] }>(
      "/curriculum"
    ),

  getMe: (token: string) =>
    apiCall<{ course: { id: string; title: string; slug: string }; units: CurriculumUnitFromApi[] }>("/curriculum/me", {
      token,
    }),

  generateFullCurriculum: (token: string) =>
    apiCall<{ message: string; result: any }>("/curriculum/admin/generate-full", {
      method: "POST",
      token,
    }),
};

// Streaks API
export const streaksApi = {
  getStreak: (token: string) =>
    apiCall<{ currentStreak: number; bestStreak: number; lastPracticeDate: string }>("/streaks", {
      token,
    }),

  recordPractice: (token: string) =>
    apiCall<{ currentStreak: number; bestStreak: number }>("/streaks/record", {
      method: "POST",
      token,
    }),
};

// Store API
export const storeApi = {
  getItems: () =>
    apiCall<any[]>("/store/items"),

  getInventory: (token: string) =>
    apiCall<{ inventory: any[]; coins: number }>("/store/inventory", {
      token,
    }),

  buyItem: (token: string, itemId: string) =>
    apiCall<{ success: boolean; message: string }>("/store/buy", {
      method: "POST",
      token,
      body: { itemId },
    }),

  selectSkin: (token: string, skinId: string) =>
    apiCall<{ success: boolean; message: string }>("/store/select-skin", {
      method: "POST",
      token,
      body: { skinId },
    }),
};

// Achievements API
export const achievementsApi = {
  getAchievements: (token: string) =>
    apiCall<{ achievement_key: string }[]>("/achievements", {
      token,
    }),

  unlock: (token: string, key: string) =>
    apiCall<{ success: boolean; alreadyUnlocked: boolean }>("/achievements/unlock", {
      method: "POST",
      token,
      body: { achievement_key: key },
    }),
};

// Ranking API
export const rankingApi = {
  getRanking: (type: "total" | "weekly" = "total") =>
    apiCall<{ user_id: string; total_score: number; weekly_score: number; max_level: number; display_name: string; avatar_url: string }[]>(`/ranking?type=${type}`),
};

// Questions API
export const questionsApi = {
  // Público - sem necessidade de token
  getQuestionsPublic: (level?: number) =>
    apiCall<unknown[]>("/manage-questions" + (level ? `?level=${level}` : "")),

  // Requer autenticação
  getQuestions: (token: string, level?: number) =>
    apiCall<unknown[]>("/manage-questions" + (level ? `?level=${level}` : ""), {
      token,
    }),

  createQuestion: (token: string, question: unknown) =>
    apiCall<unknown>("/manage-questions", {
      method: "POST",
      token,
      body: question,
    }),

  updateQuestion: (token: string, id: string, question: unknown) =>
    apiCall<unknown>(`/manage-questions?id=${id}`, {
      method: "PUT",
      token,
      body: question,
    }),

  deleteQuestion: (token: string, id: string) =>
    apiCall<unknown>(`/manage-questions?id=${id}`, {
      method: "DELETE",
      token,
    }),
};

export const activitiesApi = {
  getActivitiesByPeriod: async (periodId: string, limit: number = 10, random: boolean = false): Promise<Activity[]> => {
    try {
      const randomParam = random ? '&random=true' : '';
      const data = await apiCall<unknown[]>(`/activities?periodId=${periodId}&limit=${limit}${randomParam}`);
      if (!Array.isArray(data)) return [];

      return data
        .filter((act): act is Record<string, unknown> => Boolean(act) && typeof act === "object")
        .map((act, index) => mapActivity(act, periodId, 1, "Fácil", index))
        .filter((act): act is Activity => act !== null);
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      return [];
    }
  },
};

function mapActivity(
  act: Record<string, unknown>,
  periodId: string,
  level: number,
  difficulty: string,
  index: number
): Activity | null {
  const type = act.type as ActivityType | undefined;
  const content = (act.content as Record<string, unknown> | undefined) || {};
  const base = {
    id: typeof act.id === "string" ? act.id : `activity-${Date.now()}-${index}`,
    type: (type || "quiz") as ActivityType,
    level: typeof act.level === "number" ? act.level : level,
    period: periodId,
    topic: `História - ${periodId}`,
    difficulty: typeof act.difficulty === "string" ? act.difficulty : difficulty,
  };

  if (type === "quiz") return { ...base, type: "quiz", question: (content.question as string) || "Pergunta não disponível", options: (content.options as string[]) || ["A", "B", "C", "D"], correctIndex: (content.correctIndex as number) ?? 0, explanation: (content.explanation as string) || "Sem explicação", imageUrl: (act.imageUrl as string | undefined) || null, mediaType: act.imageUrl ? "image" : "text" };
  if (type === "true_false") return { ...base, type: "true_false", statement: (content.statement as string) || "Afirmação não disponível", isTrue: (content.isTrue as boolean) ?? true, explanation: (content.explanation as string) || "Sem explicação" };
  if (type === "fill_blank") return { ...base, type: "fill_blank", textWithBlanks: (content.textWithBlanks as string) || "__BLANK__", blanks: (content.blanks as string[]) || [], options: (content.options as string[]) || [], explanation: (content.explanation as string) || "Sem explicação" };
  if (type === "matching") return { ...base, type: "matching", instruction: (content.instruction as string) || "Associe os pares", pairs: (content.pairs as { left: string; right: string }[]) || [], explanation: (content.explanation as string) || "Sem explicação", imageUrl: (act.imageUrl as string | undefined) || null };
  if (type === "chronological") return { ...base, type: "chronological", instruction: (content.instruction as string) || "Ordene", events: (content.events as { text: string; year: number }[]) || [], explanation: (content.explanation as string) || "Sem explicação" };
  return null;
}

// History Chat API
export const historyChatApi = {
  getSuggestedQuestions: (periodId: string) =>
    apiCall<{ questions: string[] }>(`/history-chat/questions/${periodId}`),

  sendMessage: (data: { 
    messages: unknown[]; 
    periodId: string; 
    characterName: string; 
    periodName: string; 
    periodYears: string;
  }) =>
    apiCall<{ response: string }>("/history-chat", {
      method: "POST",
      body: data,
    }),
};

// Historical Periods API
export const historicalPeriodsApi = {
  getAll: () =>
    apiCall<any[]>("/historical-periods"),
  
  getOne: (id: string) =>
    apiCall<any>(`/historical-periods/${id}`),
  
  save: (data: any) =>
    apiCall<any>("/historical-periods", {
      method: "POST",
      body: data
    }),
};

// Pac-Man History API
export const pacmanApi = {
  getPhaseData: (periodId: string) =>
    apiCall<{
      periodId: string;
      periodName: string;
      theme: { wallColor: string; bgColor: string; accentColor: string; atmosphereLabel: string };
      ghosts: Array<{ name: string; emoji: string; description: string; tintColor: string }>;
      collectibles: Array<{ name: string; emoji: string; fact: string }>;
      powerPellets: Array<{ name: string; emoji: string; effect: string }>;
      finalChallenge: { question: string; options: string[]; correctIndex: number; explanation: string };
      periodSummary: string;
    }>(`/pacman/phase/${periodId}`),
};

export default {
  auth: authApi,
  user: userApi,
  progress: progressApi,
  streaks: streaksApi,
  achievements: achievementsApi,
  store: storeApi,
  ranking: rankingApi,
  questions: questionsApi,
  activities: activitiesApi,
  historyChat: historyChatApi,
  periods: historicalPeriodsApi,
  curriculum: curriculumApi,
  pacman: pacmanApi,
};

// Export named for convenience
export const api = {
  auth: authApi,
  user: userApi,
  progress: progressApi,
  streaks: streaksApi,
  achievements: achievementsApi,
  store: storeApi,
  ranking: rankingApi,
  questions: questionsApi,
  activities: activitiesApi,
  historyChat: historyChatApi,
  periods: historicalPeriodsApi,
  curriculum: curriculumApi,
  pacman: pacmanApi,
};