// src/components/activities/QuizActivityComponent.tsx
import { useState, useCallback, useEffect } from "react";
import { Zap, Timer, CheckCircle2, XCircle, ChevronRight, Trophy, Flame } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import type { QuizActivity } from "@/types";
import { getTimerForLevel } from "@/config/difficultyConfig";
import { cn } from "@/lib/utils";

interface Props {
  activity: QuizActivity;
  onComplete: (correct: boolean) => void;
  onNext?: () => void;
  isLast?: boolean;
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
  score = 0,
  combo = 0,
  periodName = "Brasil Colônia"
}: Props) => {
  const timerTotal = getTimerForLevel(activity.level ?? 1);

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

    onComplete(correct);
  }, [showFeedback, activity, onComplete]);

  const timerPercentage = (timeLeft / timerTotal) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col animate-fade-in px-4">
      
      {/* HEADER RESPONSIVO */}
      <div className="mb-6 space-y-3 md:space-y-4">
        {/* Linha 1: Pontuação | Combo | Timer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 md:gap-2 text-quiz-primary">
            <Trophy className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-black text-sm md:text-lg">{score}</span>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2 text-rose-500">
            <Flame className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
            <span className="font-black text-sm md:text-lg">{combo}x</span>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-0.5 md:py-1 rounded-full border-2 transition-all",
            timeLeft < 5 ? "border-quiz-wrong text-quiz-wrong animate-pulse" : "border-quiz-primary text-quiz-primary"
          )}>
            <Timer className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="font-black text-xs md:text-sm">{timeLeft}s</span>
          </div>
        </div>

        {/* Linha 2: Barra de progresso */}
        <div className="w-full h-2 md:h-3 bg-quiz-surface rounded-full overflow-hidden border border-quiz-border">
          <div 
            className="h-full bg-quiz-primary transition-all duration-1000 ease-linear"
            style={{ width: `${timerPercentage}%` }}
          />
        </div>

        {/* Linha 3: Nível e período */}
        <div className="flex items-center gap-1.5 text-quiz-text-muted text-[8px] md:text-[10px] font-bold uppercase tracking-widest overflow-hidden">
          <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
          <span className="truncate">Nível {activity.level ?? 1} • {periodName}</span>
        </div>
      </div>

      {/* CORPO RESPONSIVO */}
      <div className="bg-quiz-surface border border-quiz-border rounded-2xl md:rounded-[12px] p-5 md:p-8 shadow-2xl overflow-y-auto max-h-[70vh] md:max-h-none">
        
        {/* Pergunta */}
        <h2 className="text-lg md:text-2xl font-bold text-quiz-text-main mb-6 leading-tight">
          {activity.question}
        </h2>

        {/* Opções (Grid 2x2 no desktop, 1x4 no mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {activity.options.map((rawOption, i) => {
            const normalize = (val: any): string => {
              if (typeof val === 'string') return val;
              if (val && typeof val === 'object') {
                return val.option || val.text || JSON.stringify(val);
              }
              return String(val);
            };
            const option = normalize(rawOption);
            const isSelected = selectedIndex === i;
            const isOptionCorrect = i === activity.correctIndex;
            
            let buttonClass = "flex items-center gap-3 p-3.5 md:p-4 rounded-xl border-2 transition-all duration-200 text-left w-full group min-h-[60px]";
            
            if (showFeedback) {
              if (isOptionCorrect) {
                buttonClass += " bg-quiz-correct/10 border-quiz-correct text-quiz-text-main";
              } else if (isSelected) {
                buttonClass += " bg-quiz-wrong/10 border-quiz-wrong text-quiz-text-main animate-shake";
              } else {
                buttonClass += " bg-quiz-surface border-quiz-border opacity-50";
              }
            } else {
              buttonClass += " bg-quiz-surface border-quiz-border hover:border-quiz-primary hover:bg-quiz-primary/5 text-quiz-text-main active:scale-95";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={buttonClass}
              >
                <div className={cn(
                  "w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full border-2 flex items-center justify-center font-black text-xs md:text-sm transition-colors",
                  showFeedback && isOptionCorrect ? "bg-quiz-correct border-quiz-correct text-white" :
                  showFeedback && isSelected ? "bg-quiz-wrong border-quiz-wrong text-white" :
                  "border-quiz-primary text-quiz-primary group-hover:bg-quiz-primary group-hover:text-black"
                )}>
                  {optionLetters[i]}
                </div>
                <span className="font-medium text-sm md:text-base leading-snug">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback (aparece após resposta) */}
        {showFeedback && (
          <div className="mt-6 md:mt-8 animate-fade-in-up space-y-4">
            <div className={cn(
              "flex items-start md:items-center gap-3 md:gap-4 p-4 rounded-xl border",
              isCorrect ? "bg-quiz-correct/5 border-quiz-correct/20" : "bg-quiz-wrong/5 border-quiz-wrong/20"
            )}>
              {isCorrect ? (
                <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-quiz-correct shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 md:w-10 md:h-10 text-quiz-wrong shrink-0" />
              )}
              <div>
                <h4 className={cn(
                  "text-base md:text-lg font-black uppercase tracking-tight",
                  isCorrect ? "text-quiz-correct" : "text-quiz-wrong"
                )}>
                  {isCorrect ? "Excelente! Você acertou." : "Ops! Não foi dessa vez."}
                </h4>
                <p className="text-quiz-text-muted text-xs md:text-sm italic leading-relaxed mt-1">
                  {activity.explanation}
                </p>
              </div>
            </div>

            {onNext && (
              <button
                onClick={onNext}
                className="w-full h-14 md:h-16 bg-quiz-primary text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-quiz-primary-dark transition-all transform hover:translate-y-[-2px] active:translate-y-[0] shadow-lg shadow-quiz-primary/10 text-xs md:text-base"
              >
                {isLast ? "FINALIZAR DESAFIO" : "PRÓXIMA PERGUNTA"} <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizActivityComponent;