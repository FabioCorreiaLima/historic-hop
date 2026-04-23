import { useState, useCallback, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import TimelineMap from "@/components/TimelineMap";
import ActivityRunner from "@/components/ActivityRunner";
import PeriodComplete from "@/components/PeriodComplete";
import AuthScreen from "@/components/AuthScreen";
import Ranking from "@/components/Ranking";
import AchievementsPanel from "@/components/AchievementsPanel";
import AchievementPopup from "@/components/AchievementPopup";
import HistoryChat from "@/components/HistoryChat";
import LandingPage from "@/components/LandingPage";
import { useStreaks } from "@/hooks/useStreaks";
import { useAchievements } from "@/hooks/useAchievements";
import { generateActivitiesForPeriod, type Activity, type HistoricalPeriod } from "@/data/activities";
import { api } from "@/lib/api";

type Screen = "map" | "activities" | "result" | "auth" | "ranking" | "achievements" | "chat";

const PROGRESS_KEY = "quiz-historia-period-progress";

function loadPeriodProgress(): Record<string, { completed: boolean; stars: number; correct: number; total: number }> {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function savePeriodProgress(progress: Record<string, { completed: boolean; stars: number; correct: number; total: number }>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

const Index = () => {
  const { user } = useAuth();
  const [screen, setScreen] = useState<Screen>("map");
  const [currentPeriodId, setCurrentPeriodId] = useState<string | null>(null);
  const [periodProgress, setPeriodProgress] = useState(loadPeriodProgress);
  const [lastResult, setLastResult] = useState<{ correct: number; total: number } | null>(null);
  const [generatedActivities, setGeneratedActivities] = useState<Activity[]>([]);
  const [isGeneratingActivities, setIsGeneratingActivities] = useState(false);
  const [periods, setPeriods] = useState<HistoricalPeriod[]>([]);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);

  const { streak, recordPractice, practicedToday } = useStreaks();
  const { unlockedKeys, newlyUnlocked, unlock, dismissNew, loading: achievementsLoading } = useAchievements();


  useEffect(() => { savePeriodProgress(periodProgress); }, [periodProgress]);
  
  // Limpar progresso local se o usuário acabou de logar e não tinha progresso salvo para ele
  useEffect(() => {
    if (user) {
      const userProgressKey = `progress_${user.id}`;
      const savedUserProgress = localStorage.getItem(userProgressKey);
      
      if (savedUserProgress) {
        setPeriodProgress(JSON.parse(savedUserProgress));
      } else {
        // Se é um novo usuário, podemos opcionalmente limpar o progresso "guest"
        // Para evitar confusão, vamos resetar para quem acabou de criar conta
        setPeriodProgress({});
      }
    }
  }, [user?.id]);

  // Salvar progresso específico do usuário
  useEffect(() => {
    if (user) {
      localStorage.setItem(`progress_${user.id}`, JSON.stringify(periodProgress));
    }
  }, [periodProgress, user?.id]);

  useEffect(() => { if (user && screen === "auth") setScreen("map"); }, [user, screen]);

  const fetchPeriods = useCallback(async () => {
    try {
      const data = await api.periods.getAll();
      setPeriods(data);
    } catch (error) {
      console.error("Erro ao buscar períodos:", error);
    } finally {
      setIsLoadingPeriods(false);
    }
  }, []);

  // Fetch periods from backend
  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  // Check streak-based achievements
  useEffect(() => {
    if (achievementsLoading) return;
    if (streak.currentStreak >= 3) unlock("streak_3");
    if (streak.currentStreak >= 7) unlock("streak_7");
    if (streak.currentStreak >= 30) unlock("streak_30");
  }, [streak.currentStreak, unlock, achievementsLoading]);

  // Check progress-based achievements
  useEffect(() => {
    if (achievementsLoading || periods.length === 0) return;
    const completedCount = Object.values(periodProgress).filter(p => p.completed).length;
    const hasThreeStars = Object.values(periodProgress).some(p => p.stars >= 3);
    if (completedCount >= 1) unlock("first_period");
    if (completedCount >= 3) unlock("three_periods");
    if (completedCount >= periods.length) unlock("all_periods");
    if (hasThreeStars) unlock("perfect_period");
  }, [periodProgress, unlock, achievementsLoading, periods.length]);

  const currentPeriod = useMemo(() => periods.find(p => p.id === currentPeriodId), [periods, currentPeriodId]);
  const currentPeriodIndex = useMemo(() => periods.findIndex(p => p.id === currentPeriodId), [periods, currentPeriodId]);

  const activitiesForPeriod = useMemo(() => {
    if (!currentPeriodId) return [];
    return generatedActivities;
  }, [currentPeriodId, generatedActivities]);

  const handleSelectPeriod = useCallback(async (periodId: string) => {
    setCurrentPeriodId(periodId);
    setIsGeneratingActivities(true);
    setScreen("activities");

    try {
      // Try to generate AI activities first
      const periodIndex = periods.findIndex(p => p.id === periodId);
      const level = periodIndex + 1;
      const difficulty = level <= 2 ? "Fácil" : level <= 4 ? "Médio" : "Avançado";

      const aiActivities = await generateActivitiesForPeriod(periodId, 5, level, difficulty);

      if (aiActivities.length > 0) {
        setGeneratedActivities(aiActivities);
        // Atualiza os períodos para pegar o personagem/imagem gerados pela IA
        await fetchPeriods();
      } else {
        setGeneratedActivities([]);
      }
    } catch (error) {
      console.error("Erro ao gerar atividades:", error);
      setGeneratedActivities([]);
    } finally {
      setIsGeneratingActivities(false);
    }
  }, [periods, fetchPeriods]);

  const handleActivitiesComplete = useCallback((correct: number, total: number) => {
    setLastResult({ correct, total });
    const percentage = Math.round((correct / total) * 100);
    const passed = percentage >= 70;
    const stars = percentage >= 100 ? 3 : percentage >= 85 ? 2 : percentage >= 70 ? 1 : 0;

    // Record practice for streak
    if (user) recordPractice();
    unlock("first_quiz");

    if (passed && currentPeriodId) {
      setPeriodProgress(prev => {
        const existing = prev[currentPeriodId];
        if (!existing || correct > existing.correct) {
          return { ...prev, [currentPeriodId]: { completed: true, stars: Math.max(stars, existing?.stars || 0), correct, total } };
        }
        return prev;
      });
    }
    setScreen("result");
  }, [currentPeriodId, user, recordPractice, unlock]);

  const handleNextPeriod = useCallback(() => {
    const nextIndex = currentPeriodIndex + 1;
    if (nextIndex < periods.length) {
      setCurrentPeriodId(periods[nextIndex].id);
      setScreen("activities");
      setLastResult(null);
    }
  }, [currentPeriodIndex, periods]);

  const handleRetry = useCallback(() => { setScreen("activities"); setLastResult(null); }, []);
  const handleBackToMap = useCallback(() => { setCurrentPeriodId(null); setScreen("map"); setLastResult(null); }, []);

  const handleOpenChat = useCallback(async (periodId: string) => {
    setCurrentPeriodId(periodId);
    // Busca os dados mais recentes (personagem/imagem) antes de abrir o chat
    await fetchPeriods();
    setScreen("chat");
  }, [fetchPeriods]);

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen w-full relative">
      {newlyUnlocked && <AchievementPopup achievement={newlyUnlocked} onDismiss={dismissNew} />}

      {screen === "auth" && <AuthScreen onSkip={() => setScreen("map")} />}
      {screen === "ranking" && <Ranking onBack={() => setScreen("map")} />}
      {screen === "achievements" && <AchievementsPanel unlockedKeys={unlockedKeys} onBack={() => setScreen("map")} />}

      {screen === "chat" && currentPeriod && (
        <HistoryChat period={currentPeriod} onBack={handleBackToMap} />
      )}

      {screen === "map" && (
        <TimelineMap
          periods={periods}
          periodProgress={periodProgress}
          onSelectPeriod={handleSelectPeriod}
          onShowRanking={() => setScreen("ranking")}
          onShowAuth={() => setScreen("auth")}
          onShowAchievements={() => setScreen("achievements")}
          onOpenChat={handleOpenChat}
          streakCount={streak.currentStreak}
          practicedToday={practicedToday}
          achievementCount={unlockedKeys.size}
        />
      )}

      {screen === "activities" && currentPeriod && (
        isGeneratingActivities ? (
          <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center h-[60vh] px-4">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold mb-2">Gerando Atividades</h2>
              <p className="text-muted-foreground">A IA está criando perguntas personalizadas para {currentPeriod.name}...</p>
            </div>
          </div>
        ) : activitiesForPeriod.length > 0 ? (
          <ActivityRunner
            key={currentPeriodId}
            activities={activitiesForPeriod}
            periodName={currentPeriod.name}
            periodEmoji={currentPeriod.emoji}
            backgroundImage={currentPeriod.image_url || currentPeriod.imageUrl}
            onComplete={handleActivitiesComplete}
            onBack={handleBackToMap}
          />
        ) : (
          <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center h-[60vh] px-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Erro ao Carregar Atividades</h2>
              <p className="text-muted-foreground">Não foi possível gerar atividades. Tente novamente.</p>
              <button
                onClick={() => handleSelectPeriod(currentPeriodId!)}
                className="mt-4 duo-btn duo-btn-primary"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )
      )}

      {screen === "result" && lastResult && currentPeriod && (
        <PeriodComplete
          periodName={currentPeriod.name}
          periodEmoji={currentPeriod.emoji}
          correct={lastResult.correct}
          total={lastResult.total}
          onNext={handleNextPeriod}
          onRetry={handleRetry}
          onBackToMap={handleBackToMap}
          hasNext={currentPeriodIndex + 1 < periods.length}
          onOpenChat={async (id) => { 
            setCurrentPeriodId(id); 
            // Busca os dados mais recentes (personagem/imagem) antes de abrir o chat
            await fetchPeriods();
            setScreen("chat"); 
          }}
          characterName={currentPeriod.characterName}
          characterEmoji={currentPeriod.characterEmoji}
        />
      )}
    </div>
  );
};

export default Index;
