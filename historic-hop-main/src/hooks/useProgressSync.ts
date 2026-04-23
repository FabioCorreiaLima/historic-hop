import { useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useProgressSync() {
  const { session } = useAuth();

  const syncLevelComplete = useCallback(async (
    level: number,
    score: number,
    stars: number,
    percentage: number,
    maxCombo: number,
    timeSpent: number
  ) => {
    if (!session?.access_token) return;

    try {
      await api.progress.syncLevelComplete(session.access_token, {
        level,
        score,
        stars,
        percentage,
        maxCombo,
        timeSpent,
      });
    } catch (error) {
      console.error("Erro ao sincronizar progresso:", error);
    }
  }, [session]);

  const loadCloudProgress = useCallback(async () => {
    if (!session?.access_token) return null;

    try {
      const data = await api.progress.loadProgress(session.access_token);
      if (!data || data.length === 0) return null;

      const progress: Record<number, { completed: boolean; stars: number; bestScore: number; bestPercentage: number }> = {};
      for (const p of data) {
        progress[p.level] = {
          completed: true,
          stars: p.stars,
          bestScore: p.score,
          bestPercentage: p.percentage,
        };
      }
      return progress;
    } catch (error) {
      console.error("Erro ao carregar progresso da nuvem:", error);
      return null;
    }
  }, [session]);

  return { syncLevelComplete, loadCloudProgress };
}
