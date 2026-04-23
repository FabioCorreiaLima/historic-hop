import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Lightbulb, Zap, Timer } from "lucide-react";
import type { QuizQuestion } from "@/data/quizQuestions";
import QuizMedia from "./QuizMedia";

interface QuizGameProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  combo: number;
  score: number;
  onAnswer: (optionIndex: number, timeLeft: number) => { correct: boolean; points: number };
  onNext: () => void;
  isLast: boolean;
}

const optionLetters = ["A", "B", "C", "D"];

const QuizGame = ({
  question,
  currentIndex,
  totalQuestions,
  combo,
  score,
  onAnswer,
  onNext,
  isLast,
}: QuizGameProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; points: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(true);
  const [showPoints, setShowPoints] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Auto-answer on timeout
  useEffect(() => {
    if (timeLeft === 0 && !showFeedback) {
      handleSelect(-1); // wrong answer
    }
  }, [timeLeft, showFeedback]);

  const handleSelect = useCallback((index: number) => {
    if (showFeedback) return;
    setTimerActive(false);
    setSelectedIndex(index);
    setShowFeedback(true);
    
    const r = onAnswer(index, timeLeft);
    setResult(r);
    
    if (r.correct && r.points > 0) {
      setShowPoints(true);
      setTimeout(() => setShowPoints(false), 1500);
    }
  }, [showFeedback, onAnswer, timeLeft]);

  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const timerPercentage = (timeLeft / 20) * 100;
  const timerColor = timeLeft > 10 ? "text-success" : timeLeft > 5 ? "text-accent" : "text-destructive";
  const isCorrect = result?.correct;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in-up">
      {/* Top bar: score + combo + timer */}
      <div className="flex items-center justify-between mb-4">
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Pontos</span>
          <span className="font-bold text-foreground">{score}</span>
        </div>
        
        {combo > 1 && (
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2 glow-accent animate-bounce-in">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-bold text-accent">x{combo}</span>
          </div>
        )}
        
        {/* Timer */}
        <div className={`glass rounded-xl px-4 py-2 flex items-center gap-2 ${timeLeft <= 5 ? "animate-timer-pulse" : ""}`}>
          <Timer className={`w-4 h-4 ${timerColor}`} />
          <span className={`font-bold text-lg ${timerColor}`}>{timeLeft}s</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Pergunta {currentIndex + 1} de {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-6">
        <div
          className={`h-full rounded-full transition-all duration-1000 linear ${
            timeLeft > 10 ? "bg-success" : timeLeft > 5 ? "bg-accent" : "bg-destructive"
          }`}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>

      {/* Question card */}
      <div className="glass-strong rounded-2xl p-5 md:p-7">
        {/* Mídia da pergunta */}
        <QuizMedia question={question} />

        <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 leading-snug">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, i) => {
            let extraClasses = "";
            
            if (showFeedback) {
              if (i === question.correctIndex) {
                extraClasses = "!border-success !bg-success/15 glow-success";
              } else if (i === selectedIndex) {
                extraClasses = "!border-destructive !bg-destructive/15 animate-shake";
              } else {
                extraClasses = "opacity-40";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={`w-full flex items-center gap-3 p-3.5 md:p-4 rounded-xl text-left transition-all duration-200 glass-option ${extraClasses}`}
              >
                <span className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm
                  ${showFeedback && i === question.correctIndex
                    ? "bg-success text-success-foreground"
                    : showFeedback && i === selectedIndex
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary/15 text-primary"
                  }`}
                >
                  {optionLetters[i]}
                </span>
                <span className="text-foreground font-medium text-sm md:text-base">{option}</span>
                {showFeedback && i === question.correctIndex && (
                  <CheckCircle2 className="ml-auto w-5 h-5 text-success flex-shrink-0" />
                )}
                {showFeedback && i === selectedIndex && i !== question.correctIndex && (
                  <XCircle className="ml-auto w-5 h-5 text-destructive flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Points popup */}
        {showPoints && result && result.points > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce-in pointer-events-none z-10">
            <span className="text-4xl font-bold text-accent drop-shadow-lg">+{result.points}</span>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className="mt-5 animate-fade-in-up">
            <div className={`flex items-start gap-3 p-4 rounded-xl ${
              isCorrect ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
            }`}>
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              )}
              <p className={`font-semibold ${isCorrect ? "text-success" : "text-destructive"}`}>
                {isCorrect ? "Correto! 🎉" : timeLeft === 0 && selectedIndex === -1 ? "Tempo esgotado! ⏰" : "Errado! 😕"}
              </p>
            </div>

            <div className="flex items-start gap-3 mt-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground leading-relaxed">{question.explanation}</p>
            </div>

            <button
              onClick={onNext}
              className="mt-4 w-full glass-option !bg-primary/20 !border-primary/30 hover:!bg-primary/30 rounded-xl py-4 text-base font-semibold text-foreground transition-all"
            >
              {isLast ? "Ver Resultado →" : "Próxima Pergunta →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGame;
