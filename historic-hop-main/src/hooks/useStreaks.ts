import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastPracticeDate: string | null;
}

export function useStreaks() {
  const { session } = useAuth();
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, bestStreak: 0, lastPracticeDate: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) { setLoading(false); return; }
    fetchStreak();
  }, [session]);

  async function fetchStreak() {
    if (!session?.access_token) return;
    try {
      const data = await api.streaks.getStreak(session.access_token);
      setStreak({
        currentStreak: data.currentStreak,
        bestStreak: data.bestStreak,
        lastPracticeDate: data.lastPracticeDate,
      });
    } catch (error) {
      console.error("Erro ao buscar streak:", error);
    }
    setLoading(false);
  }

  const recordPractice = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const data = await api.streaks.recordPractice(session.access_token);
      setStreak(prev => ({
        ...prev,
        currentStreak: data.currentStreak,
        bestStreak: data.bestStreak,
        lastPracticeDate: new Date().toISOString().split("T")[0],
      }));
    } catch (error) {
      console.error("Erro ao registrar prática:", error);
    }
  }, [session]);

  const practicedToday = streak.lastPracticeDate === new Date().toISOString().split("T")[0];

  return { streak, loading, recordPractice, practicedToday };
}
