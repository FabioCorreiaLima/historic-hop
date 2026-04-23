import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "first_period", name: "Iniciante", description: "Complete seu primeiro período", emoji: "🌟", category: "Progresso" },
  { key: "three_periods", name: "Explorador", description: "Complete 3 períodos", emoji: "🗺️", category: "Progresso" },
  { key: "all_periods", name: "Mestre da História", description: "Complete todos os períodos", emoji: "👑", category: "Progresso" },
  { key: "perfect_period", name: "Perfeição", description: "Ganhe 3 estrelas em um período", emoji: "⭐", category: "Habilidade" },
  { key: "streak_3", name: "Dedicado", description: "Mantenha uma ofensiva de 3 dias", emoji: "🔥", category: "Consistência" },
  { key: "streak_7", name: "Constante", description: "Mantenha uma ofensiva de 7 dias", emoji: "💪", category: "Consistência" },
  { key: "streak_30", name: "Imparável", description: "Mantenha uma ofensiva de 30 dias", emoji: "🏆", category: "Consistência" },
  { key: "first_quiz", name: "Curioso", description: "Complete sua primeira atividade", emoji: "❓", category: "Atividade" },
  { key: "chronologist", name: "Cronista", description: "Acerte uma ordenação cronológica", emoji: "📅", category: "Atividade" },
  { key: "truth_seeker", name: "Detetive", description: "Acerte 5 verdadeiro ou falso", emoji: "🔍", category: "Atividade" },
  { key: "scholar", name: "Erudito", description: "Complete 50 atividades", emoji: "📚", category: "Atividade" },
  { key: "battle_master", name: "Mestre das Batalhas", description: "Acerte 10 perguntas seguidas", emoji: "⚔️", category: "Habilidade" },
];

export function useAchievements() {
  const { session } = useAuth();
  const [unlockedKeys, setUnlockedKeys] = useState<Set<string>>(new Set());
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementDef | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) { setLoading(false); return; }
    fetchAchievements();
  }, [session]);

  async function fetchAchievements() {
    if (!session?.access_token) return;
    try {
      const data = await api.achievements.getAchievements(session.access_token);
      setUnlockedKeys(new Set(data.map(d => d.achievement_key)));
    } catch (error) {
      console.error("Erro ao buscar conquistas:", error);
    }
    setLoading(false);
  }

  const unlock = useCallback(async (key: string) => {
    // Se ainda está carregando as conquistas existentes, não tentamos desbloquear
    // para evitar disparar o popup de algo que já temos mas ainda não sabemos.
    if (loading || !session?.access_token || unlockedKeys.has(key)) return false;
    
    const def = ACHIEVEMENTS.find(a => a.key === key);
    if (!def) return false;

    try {
      const result = await api.achievements.unlock(session.access_token, key);
      
      // Só mostramos o popup se o backend confirmar que NÃO estava desbloqueado antes
      if (result.success && !result.alreadyUnlocked) {
        setUnlockedKeys(prev => new Set([...prev, key]));
        setNewlyUnlocked(def);
        return true;
      }
      
      // Se já estava desbloqueado no banco, apenas atualizamos o estado local sem mostrar popup
      if (result.alreadyUnlocked) {
        setUnlockedKeys(prev => new Set([...prev, key]));
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao desbloquear conquista:", error);
      return false;
    }
  }, [session, unlockedKeys, loading]);

  const dismissNew = useCallback(() => setNewlyUnlocked(null), []);

  return {
    achievements: ACHIEVEMENTS,
    unlockedKeys,
    newlyUnlocked,
    unlock,
    dismissNew,
    loading,
  };
}
