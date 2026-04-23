// src/components/QuizActivityComponent.tsx
import { useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, Lightbulb, Zap, Timer } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import type { QuizActivity } from "@/data/activities";
import QuizMedia from "@/components/QuizMedia";

interface Props {
  activity: QuizActivity;
  onComplete: (correct: boolean) => void;
  onNext?: () => void;
  isLast?: boolean;
  showNextButton?: boolean;
}

const optionLetters = ["A", "B", "C", "D"];

const QuizActivityComponent = ({ 
  activity, 
  onComplete, 
  onNext, 
  isLast = false,
  showNextButton = true 
}: Props) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);

  // Validação dos dados
  useEffect(() => {
    console.log("🎯 QuizActivityComponent recebeu:", activity);
    if (!activity || !activity.question) {
      console.error("❌ Atividade inválida:", activity);
    }
  }, [activity]);

  // Timer
  useEffect(() => {
    if (!timerActive || showFeedback || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
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

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setTimerActive(false);
    setSelectedIndex(index);
    setShowFeedback(true);
    
    const correct = index === activity.correctIndex;
    if (correct) {
      playCorrectSound();
      console.log("✅ Resposta correta!");
    } else {
      playWrongSound();
      console.log("❌ Resposta errada. Correta era:", activity.correctIndex);
    }
  };

  const handleComplete = () => {
    onComplete(isCorrect);
  };

  // Adapt to QuizMedia format
  const mediaQuestion = {
    ...activity,
    id: 0,
    level: activity.level,
    correctIndex: activity.correctIndex,
    mediaType: activity.imageUrl ? "image" as const : "text" as const,
    imageUrl: activity.imageUrl,
    audioUrl: activity.audioUrl,
    videoUrl: activity.videoUrl,
  };

  // Se não tem dados, mostra loading
  if (!activity || !activity.question) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 text-center">
        <div className="animate-pulse">
          <div className="h-32 bg-white/5 rounded-2xl mb-4"></div>
          <div className="h-4 bg-white/5 rounded w-3/4 mx-auto"></div>
        </div>
        <p className="text-white/50 mt-4">Carregando pergunta...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="p-6 md:p-8">
        {/* Header with Timer */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span className="text-xl">❓</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Quiz</p>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="w-3 h-3 text-accent" />
                <span className="text-xs text-white/50">Nível {activity.level}</span>
              </div>
            </div>
          </div>
          
          {/* Timer */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border ${
            timeLeft <= 5 ? "border-red-500/50 animate-pulse" : "border-white/10"
          }`}>
            <Timer className={`w-4 h-4 ${timeLeft <= 5 ? "text-red-400" : "text-emerald-400"}`} />
            <span className={`font-bold text-lg ${timeLeft <= 5 ? "text-red-400" : "text-white"}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeLeft > 15 ? "bg-emerald-500" : timeLeft > 5 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>

        {/* Media */}
        {activity.imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/10">
            <img 
              src={activity.imageUrl} 
              alt="Ilustração" 
              className="w-full h-48 object-cover"
              onError={(e) => {
                console.error("❌ Erro ao carregar imagem:", activity.imageUrl);
                e.currentTarget.style.display = 'none';
              }}
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
            let itemClass = "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left";
            
            if (showFeedback) {
              if (i === activity.correctIndex) {
                itemClass += " bg-emerald-500/10 border-emerald-500/50 text-white";
              } else if (i === selectedIndex) {
                itemClass += " bg-red-500/10 border-red-500/50 text-white animate-shake";
              } else {
                itemClass += " bg-white/5 border-white/5 text-white/30";
              }
            } else {
              itemClass += " bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={itemClass}
              >
                <span className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border ${
                  showFeedback && i === activity.correctIndex
                    ? "bg-emerald-500 border-emerald-400 text-white"
                    : showFeedback && i === selectedIndex
                    ? "bg-red-500 border-red-400 text-white"
                    : "bg-white/5 border-white/10 text-white/50"
                }`}>
                  {optionLetters[i]}
                </span>
                <span className="flex-1 font-medium text-sm md:text-base">{option}</span>
                {showFeedback && i === activity.correctIndex && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                )}
                {showFeedback && i === selectedIndex && i !== activity.correctIndex && (
                  <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="mt-8 animate-fade-in-up space-y-4">
            <div className={`flex items-start gap-4 p-5 rounded-[2.5rem] border-2 ${
              isCorrect ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
            }`}>
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400 mt-0.5" />
              )}
              <div>
                <p className={`font-black text-lg ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                  {timeLeft === 0 && selectedIndex === null ? "Tempo esgotado! ⏰" : (isCorrect ? "Correto! 🎉" : "Ops, não foi dessa vez! 😕")}
                </p>
                {!isCorrect && activity.correctIndex !== undefined && (
                  <p className="text-sm text-white/50 mt-1">
                    Resposta correta: {optionLetters[activity.correctIndex]} - {activity.options[activity.correctIndex]}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-[2.5rem] bg-purple-500/5 border border-purple-500/20">
              <Lightbulb className="w-6 h-6 text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-purple-100/80 leading-relaxed italic">{activity.explanation}</p>
            </div>

            {showNextButton && (
              <button 
                onClick={handleComplete} 
                className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                {isLast ? "Ver Resultado →" : "Próxima Pergunta →"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizActivityComponent;