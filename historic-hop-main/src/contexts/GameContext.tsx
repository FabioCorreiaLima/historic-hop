import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getLevelInfos, type QuizQuestion, type LevelInfo, type LevelProgress } from "@/data/quizQuestions";

interface GameState {
  questions: QuizQuestion[];
  loading: boolean;
  levels: LevelInfo[];
  progress: Record<number, LevelProgress>;
  currentLevel: number | null;
  currentQuestionIndex: number;
  score: number;
  combo: number;
  maxCombo: number;
  correctAnswers: number;
  totalPoints: number;
  timeSpent: number;
  selectLevel: (level: number) => void;
  answerQuestion: (optionIndex: number, timeLeft: number) => { correct: boolean; points: number };
  nextQuestion: () => boolean;
  finishLevel: () => { passed: boolean; stars: number; percentage: number };
  resetToMap: () => void;
  retryLevel: () => void;
  loadProgress: (cloudProgress: Record<number, LevelProgress>) => void;
  currentQuestions: QuizQuestion[];
  generateQuestionsForLevel: (level: number, periodId: string) => Promise<void>;
}

const GameContext = createContext<GameState | null>(null);

const STORAGE_KEY = "quiz-historia-progress";

function loadProgress(): Record<number, LevelProgress> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function saveProgress(progress: Record<number, LevelProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Record<number, LevelProgress>>(loadProgress);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  const API_BASE = "http://localhost:5001/api";

// Generate questions for a specific level
  const generateQuestionsForLevel = useCallback(async (level: number, periodId: string) => {
    setLoading(true);
    try {
      const questionsForLevel: QuizQuestion[] = [];

      // Generate 10 questions for the level
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`${API_BASE}/generate-questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            periodId,
            level,
            difficulty: level <= 3 ? "Fácil" : level <= 6 ? "Médio" : "Difícil",
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao gerar pergunta ${i + 1}`);
        }

        const questionData = await response.json();

        // Add level and other metadata
        const question: QuizQuestion = {
          ...questionData,
          level,
          difficulty: level <= 3 ? "Fácil" : level <= 6 ? "Médio" : "Difícil",
          topic: "",
          media_type: "text",
          image_url: null,
          audio_url: null,
          video_url: null,
        };

        questionsForLevel.push(question);
      }

      // Update questions for this level
      setQuestions(prev => {
        const filtered = prev.filter(q => q.level !== level);
        return [...filtered, ...questionsForLevel];
      });

    } catch (error) {
      console.error("Erro ao gerar perguntas:", error);
      // Fallback to static questions if AI fails
      // You could load static questions here as backup
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const currentQuestions = currentLevel ? questions.filter(q => q.level === currentLevel) : [];
  const levels = getLevelInfos(questions, progress);

  const selectLevel = useCallback(async (level: number) => {
    setCurrentLevel(level);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectAnswers(0);
    setTotalPoints(0);
    setTimeSpent(0);

    // Map level to period ID
    const levelToPeriodMap: Record<number, string> = {
      1: "colonia",
      2: "colonia",
      3: "colonia",
      4: "imperio",
      5: "imperio",
      6: "imperio",
      7: "republica_velha",
      8: "republica_velha",
      9: "republica_velha",
      10: "era_vargas",
      11: "era_vargas",
      12: "era_vargas",
      13: "ditadura",
      14: "ditadura",
      15: "ditadura",
      16: "nova_republica",
      17: "nova_republica",
      18: "nova_republica",
    };

    const periodId = levelToPeriodMap[level] || "colonia";

    // Generate questions if we don't have enough for this level
    const existingQuestions = questions.filter(q => q.level === level);
    if (existingQuestions.length < 10) {
      await generateQuestionsForLevel(level, periodId);
    }
  }, [questions, generateQuestionsForLevel]);

  const answerQuestion = useCallback((optionIndex: number, timeLeft: number) => {
    const q = currentQuestions[currentQuestionIndex];
    const correct = optionIndex === q.correctIndex;
    
    let points = 0;
    let newCombo = combo;
    
    if (correct) {
      newCombo = combo + 1;
      const multiplier = Math.min(newCombo, 5);
      const basePoints = timeLeft > 10 ? 100 : 50;
      points = basePoints * multiplier;
      
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      setCorrectAnswers(prev => prev + 1);
    } else {
      newCombo = 0;
      setCombo(0);
    }
    
    setScore(prev => prev + points);
    setTotalPoints(prev => prev + points);
    setTimeSpent(prev => prev + (20 - timeLeft));
    
    return { correct, points };
  }, [currentQuestions, currentQuestionIndex, combo]);

  const nextQuestion = useCallback(() => {
    const next = currentQuestionIndex + 1;
    if (next < currentQuestions.length) {
      setCurrentQuestionIndex(next);
      return true;
    }
    return false;
  }, [currentQuestionIndex, currentQuestions.length]);

  const finishLevel = useCallback(() => {
    if (!currentLevel) return { passed: false, stars: 0, percentage: 0 };
    
    const total = currentQuestions.length;
    const percentage = Math.round((correctAnswers / total) * 100);
    const passed = percentage >= 70;
    const stars = percentage >= 100 ? 3 : percentage >= 85 ? 2 : percentage >= 70 ? 1 : 0;
    const levelBonus = passed ? 500 : 0;
    const finalScore = totalPoints + levelBonus;
    
    const prev = progress[currentLevel];
    if (passed && (!prev || finalScore > prev.bestScore)) {
      setProgress(p => ({
        ...p,
        [currentLevel]: {
          completed: true,
          stars: Math.max(stars, prev?.stars || 0),
          bestScore: Math.max(finalScore, prev?.bestScore || 0),
          bestPercentage: Math.max(percentage, prev?.bestPercentage || 0),
        }
      }));
    }
    
    return { passed, stars, percentage };
  }, [currentLevel, currentQuestions.length, correctAnswers, totalPoints, progress]);

  const resetToMap = useCallback(() => {
    setCurrentLevel(null);
  }, []);

  const loadProgressFromCloud = useCallback((cloudProgress: Record<number, LevelProgress>) => {
    setProgress(prev => {
      const merged = { ...prev };
      for (const [lvl, p] of Object.entries(cloudProgress)) {
        const key = Number(lvl);
        if (!merged[key] || p.bestScore > merged[key].bestScore) {
          merged[key] = p;
        }
      }
      return merged;
    });
  }, []);

  const retryLevel = useCallback(() => {
    if (currentLevel) selectLevel(currentLevel);
  }, [currentLevel, selectLevel]);

  return (
    <GameContext.Provider value={{
      questions, loading, levels, progress, currentLevel,
      currentQuestionIndex, score, combo, maxCombo, correctAnswers, totalPoints, timeSpent,
      selectLevel, answerQuestion, nextQuestion, finishLevel, resetToMap, retryLevel,
      loadProgress: loadProgressFromCloud,
      currentQuestions,
      generateQuestionsForLevel,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
