/**
 * difficultyConfig.ts
 * Espelho do DifficultyService do backend para uso no frontend.
 * Fonte única de verdade para timers e tipos de atividade por nível.
 */

export type DifficultyTier = "Fácil" | "Médio" | "Difícil" | "Especialista" | "Mestre" | "Historiador";

export interface DifficultyConfig {
  tier: DifficultyTier;
  timerSeconds: number;
  tierColor: string;      // para UI
  tierIcon: string;       // emoji
  tierDescription: string;
}

const DIFFICULTY_MAP: Record<string, DifficultyConfig> = {
  "1-3": {
    tier: "Fácil",
    timerSeconds: 30,
    tierColor: "#22c55e",
    tierIcon: "🌱",
    tierDescription: "Fatos básicos e personagens famosos",
  },
  "4-6": {
    tier: "Médio",
    timerSeconds: 25,
    tierColor: "#3b82f6",
    tierIcon: "📚",
    tierDescription: "Contexto histórico e relações entre eventos",
  },
  "7-9": {
    tier: "Difícil",
    timerSeconds: 20,
    tierColor: "#f59e0b",
    tierIcon: "⚔️",
    tierDescription: "Causa e efeito, ordenação cronológica",
  },
  "10-12": {
    tier: "Especialista",
    timerSeconds: 18,
    tierColor: "#ef4444",
    tierIcon: "🔍",
    tierDescription: "Análise política, econômica e social",
  },
  "13-15": {
    tier: "Mestre",
    timerSeconds: 15,
    tierColor: "#8b5cf6",
    tierIcon: "🎓",
    tierDescription: "Comparações entre períodos e interpretações",
  },
  "16-18": {
    tier: "Historiador",
    timerSeconds: 12,
    tierColor: "#ec4899",
    tierIcon: "📜",
    tierDescription: "Fontes primárias e análise historiográfica",
  },
};

export function getDifficultyConfig(level: number): DifficultyConfig {
  if (level <= 3) return DIFFICULTY_MAP["1-3"];
  if (level <= 6) return DIFFICULTY_MAP["4-6"];
  if (level <= 9) return DIFFICULTY_MAP["7-9"];
  if (level <= 12) return DIFFICULTY_MAP["10-12"];
  if (level <= 15) return DIFFICULTY_MAP["13-15"];
  return DIFFICULTY_MAP["16-18"];
}

export function getTimerForLevel(level: number): number {
  return getDifficultyConfig(level).timerSeconds;
}

export function getTierName(level: number): DifficultyTier {
  return getDifficultyConfig(level).tier;
}
