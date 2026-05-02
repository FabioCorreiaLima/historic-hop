// src/components/activities/QuizActivityComponent.tsx
import { useState, useCallback, useEffect } from "react";
import { Zap, Timer } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import type { QuizActivity } from "@/data/activities";
import { getTimerForLevel, getDifficultyConfig } from "@/config/difficultyConfig";
import { EducationalFeedback } from "@/components/EducationalFeedback";

interface Props {
  activity: QuizActivity;
  onComplete: (correct: boolean) => void;
  onNext?: () => void;
  isLast?: boolean;
  showNextButton?: boolean;
  /** Chamado quando um fato deve ser adicionado ao caderno */
  onFactCollected?: (fact: string, source: string, emoji: string) => void;
}

const optionLetters = ["A", "B", "C", "D"];

const QuizActivityComponent = ({
  activity,
  onComplete,
  isLast = false,
  showNextButton = true,
  onFactCollected,
}: Props) => {
  // Timer dinâmico baseado no nível da atividade
  const timerTotal = getTimerForLevel(activity.level ?? 1);
  const diffConfig = getDifficultyConfig(activity.level ?? 1);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerTotal);
  const [timerActive, setTimerActive] = useState(true);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [activity.id, activity.imageUrl]);

  // Reset quando a atividade mudar
  useEffect(() => {
    setSelectedIndex(null);
    setShowFeedback(false);
    setTimeLeft(timerTotal);
    setTimerActive(true);
  }, [activity.id, timerTotal]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || showFeedback || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, showFeedback]);

  // Auto-resposta por timeout
  useEffect(() => {
    if (timeLeft === 0 && !showFeedback) {
      handleSelect(-1);
    }
  }, [timeLeft, showFeedback]);

  const isCorrect = selectedIndex === activity.correctIndex;

  const handleSelect = useCallback((index: number) => {
    if (showFeedback) return;
    setTimerActive(false);
    setSelectedIndex(index);
    setShowFeedback(true);

    const correct = index === activity.correctIndex;
    if (correct) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    // Adiciona fato ao caderno após qualquer resposta
    const fact = (activity as any).historicalFact;
    const source = (activity as any).source;
    if (fact && onFactCollected) {
      onFactCollected(fact, source ?? "", "❓");
    }
  }, [showFeedback, activity, onFactCollected]);

  const handleComplete = () => {
    onComplete(isCorrect);
  };

  if (!activity || !activity.question) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 text-center">
        <div className="animate-pulse">
          <div className="h-32 bg-white/5 rounded-2xl mb-4" />
          <div className="h-4 bg-white/5 rounded w-3/4 mx-auto" />
        </div>
        <p className="text-white/50 mt-4">Carregando pergunta...</p>
      </div>
    );
  }

  const timerPercentage = (timeLeft / timerTotal) * 100;
  const timerColor =
    timeLeft > timerTotal * 0.5
      ? "text-emerald-400"
      : timeLeft > timerTotal * 0.25
      ? "text-yellow-400"
      : "text-red-400";
  const timerBarColor =
    timeLeft > timerTotal * 0.5
      ? "bg-emerald-500"
      : timeLeft > timerTotal * 0.25
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="p-6 md:p-8">
        {/* Header with Level badge + Timer */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span className="text-xl">{diffConfig.tierIcon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: diffConfig.tierColor }}>
                {diffConfig.tier}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="w-3 h-3 text-accent" />
                <span className="text-xs text-white/50">Nível {activity.level ?? 1}</span>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border ${
              timeLeft <= timerTotal * 0.25 ? "border-red-500/50 animate-pulse" : "border-white/10"
            }`}
          >
            <Timer className={`w-4 h-4 ${timerColor}`} />
            <span className={`font-bold text-lg ${timerColor}`}>{timeLeft}s</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${timerBarColor}`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>

        {/* Image */}
        {activity.imageUrl && !imageLoadFailed && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/10">
            <img
              src={activity.imageUrl}
              alt="Ilustração"
              className="w-full h-48 object-cover"
              onError={() => setImageLoadFailed(true)}
            />
          </div>
        )}

        {/* Question */}
        <h2 className="text-xl md:text-2xl font-black text-white mb-6 leading-tight">
          {activity.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {activity.options.map((option, i) => {
            let itemClass =
              "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left";

            if (showFeedback) {
              if (i === activity.correctIndex) {
                itemClass += " bg-emerald-500/10 border-emerald-500/50 text-white";
              } else if (i === selectedIndex) {
                itemClass += " bg-red-500/10 border-red-500/50 text-white animate-shake";
              } else {
                itemClass += " bg-white/5 border-white/5 text-white/30";
              }
            } else {
              itemClass +=
                " bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={itemClass}
              >
                <span
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border ${
                    showFeedback && i === activity.correctIndex
                      ? "bg-emerald-500 border-emerald-400 text-white"
                      : showFeedback && i === selectedIndex
                      ? "bg-red-500 border-red-400 text-white"
                      : "bg-white/5 border-white/10 text-white/50"
                  }`}
                >
                  {optionLetters[i]}
                </span>
                <span className="flex-1 font-medium text-sm md:text-base">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback educacional rico */}
        {showFeedback && (
          <EducationalFeedback
            isCorrect={isCorrect}
            isTimeout={timeLeft === 0 && selectedIndex === -1}
            correctAnswerText={
              !isCorrect && activity.correctIndex !== undefined
                ? `${optionLetters[activity.correctIndex]} — ${activity.options[activity.correctIndex]}`
                : undefined
            }
            explanation={activity.explanation}
            historicalFact={(activity as any).historicalFact}
            source={(activity as any).source}
            onNext={showNextButton ? handleComplete : () => {}}
            nextLabel={isLast ? "Ver Resultado →" : "Próxima Pergunta →"}
          />
        )}
      </div>
    </div>
  );
};

export default QuizActivityComponent;