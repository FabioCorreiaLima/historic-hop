import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LevelMap from "@/components/LevelMap";
import QuizGame from "@/components/QuizGame";
import PeriodComplete from "@/components/PeriodComplete";
import LandingPage from "@/pages/LandingPage";
import Ranking from "@/components/Ranking";
import AchievementsPanel from "@/components/AchievementsPanel";
import AchievementPopup from "@/components/AchievementPopup";
import HistoryChat from "@/components/HistoryChat";
import PacManGame from "@/components/minigames/PacManGame";
import { useStreaks } from "@/hooks/useStreaks";
import { useAchievements } from "@/hooks/useAchievements";
import { type Activity, type HistoricalPeriod } from "@/types";
import { api } from "@/lib/api";
import { curriculumUnitsToPeriodProgress } from "@/lib/curriculumSync";
import { Loader2 } from "lucide-react";

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

  // Sync with localStorage as fallback
  useEffect(() => {
    if (!user?.id) return;
    const raw = localStorage.getItem(`progress_${user.id}`);
    if (raw) {
      try {
        setPeriodProgress(JSON.parse(raw));
      } catch { /* ignore */ }
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`progress_${user.id}`, JSON.stringify(periodProgress));
    }
  }, [periodProgress, user?.id]);

  const fetchPeriodsAndCurriculum = useCallback(async () => {
    if (!session?.access_token) {
       // Just fetch public periods if not logged in
       try {
         const data = await api.periods.getAll();
         setPeriods(data as HistoricalPeriod[]);
       } catch (e) { console.error(e); }
       setIsLoadingPeriods(false);
       return;
    }

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
            total: Math.max(srv.total || 0, loc?.total || 0) || 5,
          };
        }
        return next;
      });
    } catch (error) {
      console.error("Erro ao sincronizar currículo:", error);
    } finally {
      setIsLoadingPeriods(false);
    }
  }, [session]);

  useEffect(() => {
    fetchPeriodsAndCurriculum();
  }, [fetchPeriodsAndCurriculum]);

  const handleSelectPeriod = async (periodId: string) => {
    setCurrentPeriodId(periodId);
    setIsGeneratingActivities(true);
    setScreen("activities");

    try {
      const activitiesFromApi = await api.activities.getActivitiesByPeriod(periodId, 5);
      setGeneratedActivities(activitiesFromApi);
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      setGeneratedActivities([]);
    } finally {
      setIsGeneratingActivities(false);
    }
  };

  const handleLevelComplete = async (correct: number, total: number) => {
    if (!currentPeriodId) return;
    const stars = correct === total ? 3 : correct >= total * 0.7 ? 2 : correct >= total * 0.4 ? 1 : 0;

    setLastResult({ correct, total });
    setPeriodProgress((prev) => ({
      ...prev,
      [currentPeriodId]: {
        completed: stars > 0,
        stars: Math.max(prev[currentPeriodId]?.stars || 0, stars),
        correct,
        total,
      },
    }));

    if (session?.access_token) {
       await api.progress.completeLesson(session.access_token, {
          lessonId: `lesson_${currentPeriodId}_main`,
          stars,
          percentage: Math.round((correct / total) * 100)
       });
       if (stars > 0) recordPractice();
       fetchPeriodsAndCurriculum();
    }

    setScreen("result");
  };

  if (!user) return <LandingPage />;

  return (
    <div className="min-h-screen bg-quiz-bg pt-20">
      {screen === "map" && (
        <LevelMap 
          periods={periods}
          periodProgress={periodProgress}
          periodServerUnlock={serverPeriodUnlock}
          loading={isLoadingPeriods}
          onSelectPeriod={handleSelectPeriod}
          onOpenChat={(id) => { setCurrentPeriodId(id); setScreen("chat"); }}
          onPlayPacman={(id) => { setCurrentPeriodId(id); setScreen("pacman"); }}
        />
      )}

      {screen === "activities" && (
        <QuizGame 
          periodId={currentPeriodId!}
          activities={generatedActivities}
          isLoading={isGeneratingActivities}
          onComplete={handleLevelComplete}
          onBack={() => setScreen("map")}
          periodName={periods.find(p => p.id === currentPeriodId)?.name}
        />
      )}

      {screen === "result" && (
        <PeriodComplete 
          periodName={periods.find(p => p.id === currentPeriodId)?.name || ""}
          periodEmoji={periods.find(p => p.id === currentPeriodId)?.emoji || ""}
          correct={lastResult?.correct || 0}
          total={lastResult?.total || 0}
          onRetry={() => handleSelectPeriod(currentPeriodId!)}
          onNext={() => setScreen("map")}
          onBackToMap={() => setScreen("map")}
          hasNext={false} // Can be dynamic later
        />
      )}

      {screen === "chat" && currentPeriodId && (
        <HistoryChat 
          period={periods.find(p => p.id === currentPeriodId) || { id: currentPeriodId, name: 'Carregando...', emoji: '⌛' } as any}
          onBack={() => setScreen("map")}
        />
      )}

      {screen === "pacman" && currentPeriodId && (
        <PacManGame 
          periodId={currentPeriodId}
          onBack={() => setScreen("map")}
          onGameOver={(score, won) => {
            console.log("Pacman Over:", score, won);
            setScreen("map");
          }}
        />
      )}

      {newlyUnlocked && (
        <AchievementPopup achievement={newlyUnlocked} onDismiss={dismissNew} />
      )}
    </div>
  );
};

export default Index;
