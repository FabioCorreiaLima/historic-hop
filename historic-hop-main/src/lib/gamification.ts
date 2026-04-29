export type UserLevel = {
  title: string;
  minXp: number;
  color: string;
};

export const LEVELS: UserLevel[] = [
  { title: "Iniciante", minXp: 0, color: "text-blue-400" },
  { title: "Intermediário", minXp: 1000, color: "text-green-400" },
  { title: "Avançado", minXp: 5000, color: "text-purple-400" },
  { title: "Mestre da História", minXp: 10000, color: "text-amber-400" },
];

export function getLevel(xp: number): UserLevel {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}
