import { useState, useCallback, useEffect, useMemo } from "react";
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
import PacManGame from "@/components/minigames/PacManGame";
import { useStreaks } from "@/hooks/useStreaks";
import { useAchievements } from "@/hooks/useAchievements";
import { type Activity, type HistoricalPeriod } from "@/types";
import { api } from "@/lib/api";
import { curriculumUnitsToPeriodProgress } from "@/lib/curriculumSync";

type Screen = "map" | "activities" | "result" | "auth" | "ranking" | "achievements" | "chat" | "pacman";

const Index = () => {
  const { user, session } = useAuth();
  const [screen, setScreen] = useState<Screen>("map");
  const [currentPeriodId, setCurrentPeriodId] = useState<string | null>(null);
  const [periodProgress, setPeriodProgress] = useState<Record<string, { completed: boolean; stars: number; correct: number; total: number }>>({});
  const [serverPeriodUnlock, setServerPeriodUnlock] = useState<Record<string, boolean> | null>(null);
  const [lastResult, setLastResult] = useState<{ correct: number; total: number } | null>(null);
  const [generatedActivities, setGeneratedActivities] = useState<Activity[]>([]);
  const [isGeneratingActivities, setIsGeneratingActivities] = useState(false);
  const [periods, setPeriods] = useState<HistoricalPeriod[]>([]);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);

  const { streak, recordPractice, practicedToday } = useStreaks();
  const { unlockedKeys, newlyUnlocked, unlock, dismissNew, loading: achievementsLoading } = useAchievements();

  useEffect(() => {
    if (!user?.id) return;
    const raw = localStorage.getItem(`progress_${user.id}`);
    if (!raw) return;
    try {
      setPeriodProgress(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`progress_${user.id}`, JSON.stringify(periodProgress));
    }
  }, [periodProgress, user?.id]);

  useEffect(() => {
    if (user && screen === "auth") setScreen("map");
  }, [user, screen]);

  const fetchPeriods = useCallback(async () => {
    try {
      const data = await api.periods.getAll();
      setPeriods(data as HistoricalPeriod[]);
    } catch (error) {
      console.error("Erro ao buscar períodos:", error);
    } finally {
      setIsLoadingPeriods(false);
    }
  }, []);

  const syncCurriculum = useCallback(async () => {
    if (!user?.id || !session?.access_token) return;
    setIsLoadingPeriods(true);
    try {
      const [periodsList, curriculum] = await Promise.all([
        api.periods.getAll(),
        api.curriculum.getMe(session.access_token),
      ]);
      const pathIds = new Set(curriculum.units.map((u) => (u.period as { id: string }).id));
      const ordered = curriculum.units.map((u) => u.period as HistoricalPeriod);
      const extra = (periodsList as HistoricalPeriod[]).filter((p) => !pathIds.has(p.id));
      setPeriods([...ordered, ...extra]);

      const unlockMap: Record<string, boolean> = {};
      curriculum.units.forEach((u) => {
        unlockMap[(u.period as { id: string }).id] = u.unlocked;
      });
      setServerPeriodUnlock(unlockMap);

      const fromServer = curriculumUnitsToPeriodProgress(
        curriculum.units as Parameters<typeof curriculumUnitsToPeriodProgress>[0]
      );
      setPeriodProgress((prev) => {
        const next = { ...prev };
        for (const [pid, srv] of Object.entries(fromServer)) {
          const loc = next[pid];
          next[pid] = {
            completed: srv.completed || loc?.completed || false,
            stars: Math.max(srv.stars, loc?.stars ?? 0),
            correct: Math.max(srv.correct, loc?.correct ?? 0),
            total: Math.max(srv.total || 0, loc?.total || 0) || 10,
          };
        }
        return next;
      });
    } catch (e) {
      console.error("Erro ao sincronizar currículo:", e);
      await fetchPeriods();
    } finally {
      setIsLoadingPeriods(false);
    }
  }, [user?.id, session?.access_token, fetchPeriods]);

  useEffect(() => {
    if (!user?.id || !session?.access_token) {
      if (!user) setIsLoadingPeriods(false);
      return;
    }
    void syncCurriculum();
  }, [user?.id, session?.access_token, syncCurriculum]);

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
    setIsGeneratingActivities(true); // Reused for loading state
    setScreen("activities");

    try {
      // Buscar atividades do backend (que já foram geradas pela BNCC)
      const activitiesFromApi = await api.activities.getActivitiesByPeriod(periodId, 5);

      if (activitiesFromApi.length > 0) {
        setGeneratedActivities(activitiesFromApi);
      } else {
        setGeneratedActivities([]);
      }
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      setGeneratedActivities([]);
    } finally {
      setIsGeneratingActivities(false);
    }
  }, [periods, fetchPeriods]);

  const handleActivitiesComplete = useCallback(
    (correct: number, total: number) => {
      setLastResult({ correct, total });
      const percentage = Math.round((correct / total) * 100);
      const passed = percentage >= 70;
      const stars = percentage >= 100 ? 3 : percentage >= 85 ? 2 : percentage >= 70 ? 1 : 0;

      if (user) recordPractice();
      unlock("first_quiz");

      if (passed && currentPeriodId) {
        setPeriodProgress((prev) => {
          const existing = prev[currentPeriodId];
          if (!existing || correct > existing.correct) {
            return {
              ...prev,
              [currentPeriodId]: {
                completed: true,
                stars: Math.max(stars, existing?.stars || 0),
                correct,
                total,
              },
            };
          }
          return prev;
        });

        if (user && session?.access_token) {
          void api.progress
            .completeLesson(session.access_token, {
              lessonId: `lesson_${currentPeriodId}_main`,
              score: correct,
              stars,
              percentage,
              maxCombo: 0,
              timeSpent: 0,
            })
            .then(() => syncCurriculum())
            .catch(console.error);
        }
      }
      setScreen("result");
    },
    [currentPeriodId, user, session?.access_token, recordPractice, unlock, syncCurriculum]
  );

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

  const handlePlayPacman = useCallback(async (periodId: string) => {
    setCurrentPeriodId(periodId);
    setScreen("pacman");
  }, []);

  const handlePacmanGameOver = useCallback(async (score: number, won: boolean) => {
     if (user && session?.access_token && currentPeriodId) {
        try {
          const result = await api.progress.submitMinigameScore(session.access_token, {
            minigame: "pacman",
            periodId: currentPeriodId,
            score: score
          });
          
          if (result.success) {
            recordPractice();
            // Notificar o usuário do XP ganho
            // Importaremos a função toast mais tarde ou usaremos console por enquanto
            console.log(`Você ganhou ${result.xpGained} de XP!`);
          }
        } catch (error) {
          console.error("Erro ao salvar score do pacman:", error);
        }
     }
     setScreen("map");
  }, [user, session, currentPeriodId, recordPractice]);

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
          periodServerUnlock={serverPeriodUnlock}
          periodsLoading={isLoadingPeriods}
          onSelectPeriod={handleSelectPeriod}
          onShowRanking={() => setScreen("ranking")}
          onShowAuth={() => setScreen("auth")}
          onShowAchievements={() => setScreen("achievements")}
          onOpenChat={handleOpenChat}
          onPlayPacman={handlePlayPacman}
          streakCount={streak.currentStreak}
          practicedToday={practicedToday}
          achievementCount={unlockedKeys.size}
        />
      )}

      {screen === "pacman" && currentPeriodId && (
         <PacManGame 
           periodId={currentPeriodId} 
           onGameOver={handlePacmanGameOver} 
           onBack={handleBackToMap} 
         />
      )}

      {screen === "activities" && currentPeriod && (
        isGeneratingActivities ? (
          <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center h-[60vh] px-4">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold mb-2">Buscando Atividades</h2>
              <p className="text-muted-foreground">Carregando perguntas de {currentPeriod.name}...</p>
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
              <h2 className="text-xl font-bold mb-2">Sem Atividades Disponíveis</h2>
              <p className="text-muted-foreground">O administrador ainda não gerou as atividades (BNCC) para este período.</p>
              <button
                onClick={handleBackToMap}
                className="mt-4 duo-btn duo-btn-primary"
              >
                Voltar ao Mapa
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
