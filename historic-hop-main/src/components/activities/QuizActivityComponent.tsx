import { useState, useCallback, useEffect } from "react";
import { Zap, Timer, CheckCircle2, XCircle, ChevronRight, Trophy, Flame, BookOpen } from "lucide-react";
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
    <div className="w-full max-w-4xl mx-auto flex flex-col p-4 md:p-6 lg:p-8 animate-fade-in">
      
      {/* HEADER RESPONSIVO */}
      <div className="mb-6 md:mb-8 lg:mb-10 space-y-4 md:space-y-6">
        {/* Linha 1: Status Bar */}
        <div className="flex flex-row items-center justify-between gap-3 md:gap-6">
          <div className="flex items-center gap-1.5 md:gap-2 text-quiz-primary group transition-all">
            <Trophy className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            <span className="font-black text-xs md:text-sm lg:text-base tracking-tighter">{score}</span>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2 text-rose-500 animate-pulse">
            <Flame className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            <span className="font-black text-xs md:text-sm lg:text-base tracking-tighter">{combo}x</span>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 md:gap-2 px-2.5 md:px-5 py-1 md:py-2 rounded-xl md:rounded-2xl border-2 transition-all",
            timeLeft < 5 ? "border-quiz-wrong text-quiz-wrong animate-bounce" : "border-quiz-primary text-quiz-primary"
          )}>
            <Timer className="w-3.5 h-3.5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            <span className="font-black text-base md:text-xl lg:text-2xl">{timeLeft}s</span>
          </div>
        </div>

        {/* Linha 2: Barra de Progresso */}
        <div className="w-full h-2 md:h-4 bg-quiz-surface rounded-full overflow-hidden border border-quiz-border">
          <div 
            className={cn(
              "h-full transition-all duration-1000 ease-linear",
              timeLeft < 5 ? "bg-quiz-wrong" : "bg-quiz-primary"
            )}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>

        {/* Linha 3: Metadata */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-quiz-text-muted text-xs md:text-sm font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-1 bg-quiz-surface px-2 py-1 rounded-lg border border-quiz-border">
            <Zap className="w-3 h-3 md:w-4 md:h-4 text-quiz-primary" />
            <span>Nível {activity.level ?? 1}</span>
          </div>
          <div className="flex items-center gap-1 bg-quiz-surface px-2 py-1 rounded-lg border border-quiz-border truncate max-w-[150px] md:max-w-none">
            <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-quiz-primary" />
            <span className="truncate">{periodName}</span>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL (CARD) */}
      <div className="bg-quiz-surface border border-quiz-border rounded-2xl md:rounded-[2rem] p-5 md:p-10 lg:p-12 shadow-2xl">
        
        {/* Pergunta */}
        <h2 className="text-base md:text-lg lg:text-xl font-black text-quiz-text-main mb-6 md:mb-12 leading-[1.3] tracking-tight">
          {activity.question}
        </h2>

        {/* Opções */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 lg:gap-8">
          {activity.options.map((rawOption, i) => {
            const option = typeof rawOption === 'string' ? rawOption : (rawOption as any).option || (rawOption as any).text || JSON.stringify(rawOption);
            
            const isSelected = selectedIndex === i;
            const isOptionCorrect = i === activity.correctIndex;
            
            let buttonClass = "flex items-center gap-3 md:gap-6 p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl border-2 transition-all duration-300 text-left w-full group overflow-hidden";
            
            if (showFeedback) {
              if (isOptionCorrect) {
                buttonClass += " bg-quiz-correct/10 border-quiz-correct text-quiz-text-main";
              } else if (isSelected) {
                buttonClass += " bg-quiz-wrong/10 border-quiz-wrong text-quiz-text-main animate-shake";
              } else {
                buttonClass += " opacity-40 grayscale";
              }
            } else {
              buttonClass += " bg-quiz-surface border-quiz-border hover:border-quiz-primary hover:bg-quiz-primary/5 text-quiz-text-main hover:scale-[1.02] active:scale-95";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={buttonClass}
              >
                <div className={cn(
                  "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 shrink-0 rounded-lg md:rounded-xl border-2 flex items-center justify-center font-black text-sm md:text-base lg:text-lg transition-all",
                  showFeedback && isOptionCorrect ? "bg-quiz-correct border-quiz-correct text-white" :
                  showFeedback && isSelected ? "bg-quiz-wrong border-quiz-wrong text-white" :
                  "border-quiz-primary text-quiz-primary group-hover:bg-quiz-primary group-hover:text-black"
                )}>
                  {optionLetters[i]}
                </div>
                <span className="font-bold text-sm md:text-base leading-snug">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        <div className={cn(
          "transition-all duration-500 overflow-hidden",
          showFeedback ? "mt-8 md:mt-16 opacity-100 max-h-[1000px]" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-6">
            <div className={cn(
              "flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 md:p-8 rounded-xl md:rounded-[1.5rem] border-2",
              isCorrect ? "bg-quiz-correct/5 border-quiz-correct/30" : "bg-quiz-wrong/5 border-quiz-wrong/30"
            )}>
              {isCorrect ? (
                <CheckCircle2 className="w-10 h-10 md:w-16 md:h-16 text-quiz-correct shrink-0" />
              ) : (
                <XCircle className="w-10 h-10 md:w-16 md:h-16 text-quiz-wrong shrink-0" />
              )}
              <div className="space-y-1">
                <h4 className={cn(
                  "text-lg md:text-2xl font-black uppercase tracking-tight",
                  isCorrect ? "text-quiz-correct" : "text-quiz-wrong"
                )}>
                  {isCorrect ? "Excelente! Você acertou." : "Ops! Não foi dessa vez."}
                </h4>
                <p className="text-xs md:text-sm lg:text-base text-quiz-text-muted italic leading-relaxed font-medium">
                  {activity.explanation}
                </p>
              </div>
            </div>

            {onNext && (
              <button
                onClick={onNext}
                className="w-full h-14 md:h-20 lg:h-24 bg-quiz-primary text-black font-black py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 hover:bg-quiz-primary-dark transition-all transform hover:translate-y-[-4px] active:translate-y-[0] shadow-xl text-sm md:text-base uppercase tracking-widest"
              >
                {isLast ? "FINALIZAR DESAFIO" : "PRÓXIMA PERGUNTA"} 
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizActivityComponent;