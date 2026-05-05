// src/components/activities/QuizActivityComponent.tsx
import { useState, useCallback, useEffect } from "react";
import { Zap, Timer, CheckCircle2, XCircle, ChevronRight, Trophy, Flame } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import type { QuizActivity } from "@/data/activities";
import { getTimerForLevel, getDifficultyConfig } from "@/config/difficultyConfig";
import { cn } from "@/lib/utils";

interface Props {
  activity: QuizActivity;
  onComplete: (correct: boolean) => void;
  onNext?: () => void;
  isLast?: boolean;
  showNextButton?: boolean;
  /** Chamado quando um fato deve ser adicionado ao caderno */
  onFactCollected?: (fact: string, source: string, emoji: string) => void;
  // Novos para o layout exato
  score?: number;
  combo?: number;
  periodName?: string;
}

const optionLetters = ["A", "B", "C", "D"];

const QuizActivityComponent = ({
  activity,
  onComplete,
  onNext,
  isLast = false,
  showNextButton = true,
  onFactCollected,
  score = 0,
  combo = 0,
  periodName = "Brasil Colônia"
}: Props) => {
  const timerTotal = getTimerForLevel(activity.level ?? 1);
  const diffConfig = getDifficultyConfig(activity.level ?? 1);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerTotal);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    setSelectedIndex(null);
    setShowFeedback(false);
    setTimeLeft(timerTotal);
    setTimerActive(true);
  }, [activity.id, timerTotal]);

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

    const fact = (activity as any).historicalFact;
    const source = (activity as any).source;
    if (fact && onFactCollected) {
      onFactCollected(fact, source ?? "", "❓");
    }

    onComplete(correct);
  }, [showFeedback, activity, onFactCollected, onComplete]);

  const timerPercentage = (timeLeft / timerTotal) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto bg-quiz-background min-h-[600px] flex flex-col animate-fade-in">
      
      {/* HEADER EXATO */}
      <div className="p-6 space-y-4">
        {/* Linha 1: Pontuação | Combo | Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-quiz-primary">
            <Trophy className="w-5 h-5" />
            <span className="font-black text-lg">{score}</span>
          </div>
          
          <div className="flex items-center gap-2 text-rose-500">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="font-black text-lg">{combo}x</span>
          </div>

          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full border-2 transition-all",
            timeLeft < 5 ? "border-quiz-wrong text-quiz-wrong animate-pulse" : "border-quiz-primary text-quiz-primary"
          )}>
            <Timer className="w-4 h-4" />
            <span className="font-black">{timeLeft}s</span>
          </div>
        </div>

        {/* Linha 2: Barra de progresso */}
        <div className="w-full h-3 bg-quiz-surface rounded-full overflow-hidden border border-quiz-border">
          <div 
            className="h-full bg-quiz-primary transition-all duration-1000 ease-linear"
            style={{ width: `${timerPercentage}%` }}
          />
        </div>

        {/* Linha 3: Nível e período */}
        <div className="flex items-center gap-2 text-quiz-text-muted text-[10px] font-bold uppercase tracking-widest">
          <Zap className="w-3 h-3" />
          <span>Nível {activity.level ?? 1} • {periodName}</span>
        </div>
      </div>

      {/* CORPO EXATO */}
      <div className="flex-1 px-6 pb-6">
        <div className="bg-quiz-surface border border-quiz-border rounded-[12px] p-6 h-full shadow-2xl">
          
          {/* Pergunta */}
          <h2 className="text-[1.25rem] md:text-[1.5rem] font-bold text-quiz-text-main mb-6 leading-tight">
            {activity.question}
          </h2>

          {/* Opções (Grid 2x2 no desktop, 1x4 no mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activity.options.map((rawOption, i) => {
              const normalize = (val: any): string => {
                if (typeof val === 'string') return val;
                if (val && typeof val === 'object') {
                  return val.option || val.blank || val.text || val.value || val.answer || 
                         Object.values(val).find(v => typeof v === 'string') || 
                         JSON.stringify(val);
                }
                return String(val);
              };
              const option = normalize(rawOption);
              
              const isSelected = selectedIndex === i;
              const isOptionCorrect = i === activity.correctIndex;
              
              let buttonClass = "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left w-full group";
              
              if (showFeedback) {
                if (isOptionCorrect) {
                  buttonClass += " bg-quiz-correct/10 border-quiz-correct text-quiz-text-main";
                } else if (isSelected) {
                  buttonClass += " bg-quiz-wrong/10 border-quiz-wrong text-quiz-text-main animate-shake";
                } else {
                  buttonClass += " bg-quiz-surface border-quiz-border opacity-50";
                }
              } else {
                buttonClass += " bg-quiz-surface border-quiz-border hover:border-quiz-primary hover:scale-[1.02] text-quiz-text-main active:scale-95";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={showFeedback}
                  className={buttonClass}
                >
                  <div className={cn(
                    "w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center font-black text-sm transition-colors",
                    showFeedback && isOptionCorrect ? "bg-quiz-correct border-quiz-correct text-white" :
                    showFeedback && isSelected ? "bg-quiz-wrong border-quiz-wrong text-white" :
                    "border-quiz-primary text-quiz-primary group-hover:bg-quiz-primary group-hover:text-black"
                  )}>
                    {optionLetters[i]}
                  </div>
                  <span className="font-medium">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback (aparece após resposta) */}
          {showFeedback && (
            <div className="mt-8 animate-fade-in-up space-y-4">
              <div className={cn(
                "flex items-center gap-4 p-4 rounded-xl border",
                isCorrect ? "bg-quiz-correct/5 border-quiz-correct/20" : "bg-quiz-wrong/5 border-quiz-wrong/20"
              )}>
                {isCorrect ? (
                  <CheckCircle2 className="w-10 h-10 text-quiz-correct" />
                ) : (
                  <XCircle className="w-10 h-10 text-quiz-wrong" />
                )}
                <div>
                  <h4 className={cn(
                    "text-lg font-black uppercase tracking-tight",
                    isCorrect ? "text-quiz-correct" : "text-quiz-wrong"
                  )}>
                    {isCorrect ? "Excelente! Você acertou." : "Ops! Não foi dessa vez."}
                  </h4>
                  <p className="text-quiz-text-muted text-sm italic leading-relaxed">
                    {activity.explanation}
                  </p>
                </div>
              </div>

              {onNext && (
                <button
                  onClick={onNext}
                  className="w-full bg-quiz-primary text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-quiz-primary-dark transition-all transform hover:translate-y-[-2px] active:translate-y-[0] shadow-lg shadow-quiz-primary/10"
                >
                  {isLast ? "FINALIZAR DESAFIO" : "PRÓXIMA PERGUNTA"} <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizActivityComponent;