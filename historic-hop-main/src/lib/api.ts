// Centralized API client for Historic Hop
// All API calls should go through here

const API_BASE = "http://localhost:5001/api";

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
      body: { email, password, display_name: displayName },
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
  generateActivity: (data: { periodId: string; activityType: string; level: number; difficulty: string }) =>
    apiCall<unknown>("/generate-activity", {
      method: "POST",
      body: data,
    }),
};

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

export default {
  auth: authApi,
  user: userApi,
  progress: progressApi,
  streaks: streaksApi,
  achievements: achievementsApi,
  ranking: rankingApi,
  questions: questionsApi,
  activities: activitiesApi,
  historyChat: historyChatApi,
  periods: historicalPeriodsApi,
};

// Export named for convenience
export const api = {
  auth: authApi,
  user: userApi,
  progress: progressApi,
  streaks: streaksApi,
  achievements: achievementsApi,
  ranking: rankingApi,
  questions: questionsApi,
  activities: activitiesApi,
  historyChat: historyChatApi,
  periods: historicalPeriodsApi,
};